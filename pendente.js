// pendente.js - Script para a página de pagamento pendente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Iniciando verificação de pagamento pendente...');
    
    const PaymentManager = {
        init() {
            this.analisarParametrosURL();
            this.iniciarVerificacaoAutomatica();
            this.configurarBotaoVoltar();
        },
        
        analisarParametrosURL() {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Log dos parâmetros para debug
            console.log('📋 Parâmetros da URL:', {
                payment_id: urlParams.get('payment_id'),
                status: urlParams.get('status'),
                preference_id: urlParams.get('preference_id'),
                external_reference: urlParams.get('external_reference')
            });
            
            // Mostrar ID do pagamento se existir
            const paymentId = urlParams.get('payment_id');
            if (paymentId) {
                this.adicionarInfoPagamento(paymentId);
            }
            
            // Verificar se veio do Mercado Pago com status
            const status = urlParams.get('status');
            if (status === 'approved') {
                this.redirecionarParaSucesso();
            } else if (status === 'rejected') {
                this.mostrarMensagemRejeicao();
            }
        },
        
        adicionarInfoPagamento(paymentId) {
            const container = document.querySelector('.container');
            
            // Adicionar informações do pagamento
            const infoHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <h4 style="color: #856404; margin-bottom: 10px;">📋 Informações do Pagamento</h4>
                    <p style="margin: 5px 0; color: #666;">
                        <strong>ID do Pagamento:</strong> ${paymentId}
                    </p>
                    <p style="margin: 5px 0; color: #666;">
                        <strong>Status:</strong> <span style="color: #F59E0B; font-weight: bold;">⏳ Em Análise</span>
                    </p>
                    <p style="margin: 5px 0; color: #666;">
                        <strong>Última verificação:</strong> <span id="lastCheck">Agora</span>
                    </p>
                </div>
                
                <div id="statusMessage" style="margin: 20px 0;">
                    <p>🔄 Verificando status automaticamente...</p>
                </div>
                
                <button id="checkNow" style="background: #F59E0B; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px;">
                    🔄 Verificar Agora
                </button>
            `;
            
            // Inserir após o primeiro parágrafo
            const firstParagraph = container.querySelector('p');
            firstParagraph.insertAdjacentHTML('afterend', infoHTML);
            
            // Configurar botão de verificação
            document.getElementById('checkNow').addEventListener('click', () => {
                this.verificarStatusPagamento();
            });
        },
        
        async verificarStatusPagamento() {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentId = urlParams.get('payment_id');
            
            if (!paymentId) {
                console.log('❌ Nenhum ID de pagamento encontrado');
                return;
            }
            
            try {
                console.log('🔄 Verificando status do pagamento:', paymentId);
                
                // Atualizar última verificação
                document.getElementById('lastCheck').textContent = new Date().toLocaleTimeString('pt-BR');
                
                // Fazer requisição para a API
                const response = await fetch(`https://karpe-backend.onrender.com/api/pagamento/status/${paymentId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + (localStorage.getItem('karpe_token') || ''),
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Erro na resposta da API');
                }
                
                const data = await response.json();
                console.log('📊 Status recebido:', data);
                
                // Processar o status
                this.processarStatus(data);
                
            } catch (error) {
                console.error('❌ Erro ao verificar status:', error);
                this.atualizarMensagemStatus('⚠️ Erro ao verificar status. Tente novamente em alguns instantes.', 'error');
            }
        },
        
        processarStatus(data) {
            const status = data.status;
            const statusDetail = data.status_detail;
            
            switch (status) {
                case 'approved':
                    this.mostrarStatusAprovado();
                    break;
                    
                case 'pending':
                    this.mostrarStatusPendente(statusDetail);
                    break;
                    
                case 'rejected':
                    this.mostrarStatusRejeitado(statusDetail);
                    break;
                    
                default:
                    this.atualizarMensagemStatus('❓ Status desconhecido. Entre em contato com o suporte.', 'unknown');
            }
        },
        
        mostrarStatusAprovado() {
            this.atualizarMensagemStatus('✅ Pagamento aprovado! Redirecionando...', 'success');
            
            // Redirecionar para sucesso após 2 segundos
            setTimeout(() => {
                const paymentId = new URLSearchParams(window.location.search).get('payment_id');
                window.location.href = `sucesso.html?payment_id=${paymentId}`;
            }, 2000);
        },
        
        mostrarStatusPendente(statusDetail) {
            let mensagem = '⏳ Pagamento ainda em processamento...';
            
            if (statusDetail === 'pending_waiting_payment') {
                mensagem = '💳 Aguardando confirmação do banco...';
            } else if (statusDetail === 'pending_contingency') {
                mensagem = '🔍 Análise de segurança em andamento...';
            } else if (statusDetail === 'pending_review_manual') {
                mensagem = '👨‍💼 Pagamento em revisão manual...';
            }
            
            this.atualizarMensagemStatus(mensagem, 'pending');
        },
        
        mostrarStatusRejeitado(statusDetail) {
            let mensagem = '❌ Pagamento não aprovado.';
            
            if (statusDetail === 'cc_rejected_insufficient_amount') {
                mensagem = '💸 Saldo insuficiente no cartão.';
            } else if (statusDetail === 'cc_rejected_card_error') {
                mensagem = '💳 Problema com os dados do cartão.';
            } else if (statusDetail === 'cc_rejected_other_reason') {
                mensagem = '🚫 Pagamento não autorizado.';
            }
            
            this.atualizarMensagemStatus(mensagem, 'rejected');
            
            // Adicionar botão para tentar novamente
            const statusMessage = document.getElementById('statusMessage');
            statusMessage.innerHTML += `
                <br>
                <button onclick="window.location.href='carrinho.html'" 
                        style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    🛒 Tentar Novamente
                </button>
            `;
        },
        
        atualizarMensagemStatus(mensagem, tipo) {
            const statusMessage = document.getElementById('statusMessage');
            if (!statusMessage) return;
            
            let cor = '#666';
            if (tipo === 'success') cor = '#10B981';
            if (tipo === 'error') cor = '#dc3545';
            if (tipo === 'rejected') cor = '#dc3545';
            if (tipo === 'pending') cor = '#F59E0B';
            
            statusMessage.innerHTML = `<p style="color: ${cor}; font-weight: bold;">${mensagem}</p>`;
        },
        
        iniciarVerificacaoAutomatica() {
            // Verificar a cada 15 segundos
            setInterval(() => {
                this.verificarStatusPagamento();
            }, 15000);
            
            // Primeira verificação após 3 segundos
            setTimeout(() => {
                this.verificarStatusPagamento();
            }, 3000);
            
            console.log('🔄 Verificação automática iniciada (15 segundos)');
        },
        
        configurarBotaoVoltar() {
            const btnVoltar = document.querySelector('.btn');
            if (btnVoltar) {
                btnVoltar.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'index.html';
                });
            }
        },
        
        redirecionarParaSucesso() {
            const paymentId = new URLSearchParams(window.location.search).get('payment_id');
            window.location.href = `sucesso.html?payment_id=${paymentId}`;
        },
        
        mostrarMensagemRejeicao() {
            this.atualizarMensagemStatus('❌ Pagamento não foi aprovado. Tente novamente.', 'rejected');
        },
        
        // Ferramentas de desenvolvimento (apenas em localhost)
        adicionarFerramentasDev() {
            if (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify')) {
                const container = document.querySelector('.container');
                
                const devTools = `
                    <div style="background: #e9ecef; border: 1px dashed #6c757d; border-radius: 5px; padding: 15px; margin: 20px 0;">
                        <h4 style="color: #495057; margin-bottom: 10px;">🛠️ Ferramentas de Desenvolvimento</h4>
                        <button onclick="PaymentManager.simularAprovado()" 
                                style="background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin: 5px;">
                            ✅ Simular Aprovado
                        </button>
                        <button onclick="PaymentManager.simularPendente()" 
                                style="background: #F59E0B; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin: 5px;">
                            ⏳ Simular Pendente
                        </button>
                        <button onclick="PaymentManager.simularRejeitado()" 
                                style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin: 5px;">
                            ❌ Simular Rejeitado
                        </button>
                    </div>
                `;
                
                container.insertAdjacentHTML('beforeend', devTools);
            }
        },
        
        simularAprovado() {
            this.atualizarMensagemStatus('✅ [SIMULAÇÃO] Pagamento aprovado! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = 'sucesso.html?payment_id=TEST_APPROVED';
            }, 2000);
        },
        
        simularPendente() {
            this.atualizarMensagemStatus('⏳ [SIMULAÇÃO] Pagamento ainda pendente...', 'pending');
        },
        
        simularRejeitado() {
            this.atualizarMensagemStatus('❌ [SIMULAÇÃO] Pagamento rejeitado!', 'rejected');
        }
    };

    // Inicializar o gerenciador
    PaymentManager.init();
    
    // Adicionar ferramentas de desenvolvimento
    PaymentManager.adicionarFerramentasDev();
    
    // Expor globalmente para as ferramentas de desenvolvimento
    window.PaymentManager = PaymentManager;
    
    console.log('🎯 Sistema de verificação de pagamento carregado!');
});