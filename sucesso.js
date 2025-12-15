// sucesso.js - Script para a página de sucesso
document.addEventListener('DOMContentLoaded', function() {
    // Sistema de Gerenciamento de Pedidos
    const OrderManager = {
        init() {
            console.log('🔍 Iniciando carregamento da página de sucesso...');
            this.carregarDadosPedido();
            this.configurarEventos();
            this.criarConfetti();
        },
        
        carregarDadosPedido() {
            console.log('🔄 Carregando dados do pedido...');
            
            // PRIMEIRO: Tentar obter dados dos parâmetros da URL
            const urlParams = new URLSearchParams(window.location.search);
            const paymentId = urlParams.get('payment_id');
            const status = urlParams.get('status');
            const externalReference = urlParams.get('external_reference');
            
            console.log('📋 Parâmetros da URL:', {
                paymentId,
                status,
                externalReference,
                urlCompleta: window.location.href
            });
            
            // SEGUNDO: Tentar obter dados salvos específicos para sucesso
            const dadosSucessoSalvos = JSON.parse(localStorage.getItem('karpe_dados_sucesso') || 'null');
            console.log('💾 Dados salvos para sucesso:', dadosSucessoSalvos);
            
            // TERCEIRO: Tentar obter dados do checkout
            const dadosCheckout = JSON.parse(localStorage.getItem('karpe_dados_checkout') || '{}');
            console.log('🛒 Dados do checkout:', dadosCheckout);
            
            // QUARTO: Tentar obter dados do usuário logado
            const usuarioLogado = JSON.parse(localStorage.getItem('karpe_usuario_logado') || '{}');
            console.log('👤 Usuário logado:', usuarioLogado);
            
            // QUINTO: Tentar obter compra atual
            const compraAtual = JSON.parse(localStorage.getItem('karpe_compra_atual') || 'null');
            console.log('🛍️ Compra atual:', compraAtual);
            
            // SEXTO: Tentar obter carrinho (como fallback para itens)
            const carrinho = JSON.parse(localStorage.getItem('karpe_carrinho') || '[]');
            console.log('🛒 Carrinho (fallback):', carrinho);
            
            // COMBINAR TODOS OS DADOS
            let dadosCompra = null;
            
            if (dadosSucessoSalvos) {
                // Caso 1: Temos dados específicos salvos para sucesso
                dadosCompra = dadosSucessoSalvos;
                console.log('✅ Usando dados salvos específicos para sucesso');
            } else if (paymentId || externalReference) {
                // Caso 2: Temos parâmetros na URL, vamos construir os dados
                const usuarioCompleto = { ...usuarioLogado, ...dadosCheckout };
                
                dadosCompra = {
                    payment_id: paymentId || externalReference || 'KRP-' + Date.now(),
                    status: status || 'approved',
                    external_reference: externalReference || paymentId,
                    usuario: usuarioCompleto,
                    itens: compraAtual?.itens || carrinho,
                    total: compraAtual?.total || this.calcularTotal(carrinho),
                    data_compra: compraAtual?.data_compra || new Date().toISOString(),
                    endereco_entrega: this.construirEndereco(usuarioCompleto)
                };
                console.log('✅ Construindo dados a partir dos parâmetros da URL');
            } else if (compraAtual) {
                // Caso 3: Temos compra atual mas sem parâmetros na URL
                const usuarioCompleto = { ...usuarioLogado, ...dadosCheckout };
                
                dadosCompra = {
                    payment_id: compraAtual.preference_id || 'KRP-' + Date.now(),
                    status: compraAtual.status || 'approved',
                    external_reference: compraAtual.preference_id,
                    usuario: usuarioCompleto,
                    itens: compraAtual.itens || [],
                    total: compraAtual.total || 0,
                    data_compra: compraAtual.data_compra || new Date().toISOString(),
                    endereco_entrega: this.construirEndereco(usuarioCompleto)
                };
                console.log('✅ Usando dados da compra atual');
            }
            
            if (dadosCompra) {
                console.log('✅ Dados da compra encontrados:', dadosCompra);
                this.preencherDadosPedido(dadosCompra);
            } else {
                console.warn('⚠️ Nenhum dado de compra encontrado, usando fallback');
                this.preencherDadosFallback();
            }
        },
        
        construirEndereco(usuario) {
            if (usuario.endereco && usuario.numero && usuario.bairro && usuario.cidade && usuario.estado) {
                return `${usuario.endereco}, ${usuario.numero}${usuario.complemento ? ' - ' + usuario.complemento : ''} - ${usuario.bairro} - ${usuario.cidade}/${usuario.estado}`;
            }
            return 'Endereço será confirmado por e-mail<br>Entrega em até 7 dias úteis';
        },
        
        calcularTotal(carrinho) {
            return carrinho.reduce((total, item) => {
                return total + (parseFloat(item.preco) * item.quantidade);
            }, 0);
        },
        
        preencherDadosPedido(compraData) {
            console.log('📝 Preenchendo dados do pedido com:', compraData);
            
            // Preencher informações básicas do pedido
            document.getElementById('orderNumber').textContent = compraData.payment_id || compraData.preference_id || 'KRP-' + Date.now();
            
            const dataFormatada = new Date(compraData.data_compra || compraData.data).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            document.getElementById('orderDate').textContent = dataFormatada;
            
            // Preencher informações do cliente
            document.getElementById('customerName').textContent = compraData.usuario?.nome || 'Cliente KARPE';
            document.getElementById('customerPhone').textContent = compraData.usuario?.telefone || '(11) 98765-4321';
            
            // Preencher endereço de entrega
            const enderecoHTML = compraData.endereco_entrega || 
                                compraData.usuario?.endereco ? 
                                    `${compraData.usuario.endereco}, ${compraData.usuario.numero || ''}${compraData.usuario.complemento ? ' - ' + compraData.usuario.complemento : ''}<br>${compraData.usuario.bairro || ''} - ${compraData.usuario.cidade || ''}/${compraData.usuario.estado || ''}` :
                                    'Endereço será confirmado por e-mail<br>Entrega em até 7 dias úteis';
            
            document.getElementById('shippingAddress').innerHTML = enderecoHTML;
            
            // Preencher informações de pagamento
            document.getElementById('paymentMethod').textContent = compraData.payment_method ? 
                this.formatarMetodoPagamento(compraData.payment_method) : 'Mercado Pago';
            
            document.getElementById('paymentDetails').textContent = 
                `Pagamento ${compraData.status === 'approved' ? 'aprovado' : compraData.status || 'processado'} | Ref: ${compraData.payment_id || compraData.external_reference}`;
            
            // Preencher itens do pedido
            this.preencherItensPedido(compraData.itens);
            
            // Preencher totais
            this.preencherTotais(compraData.total);
            
            // Limpar carrinho após compra concluída
            this.limparCarrinho();
            
            // Salvar histórico da compra
            this.salvarHistoricoCompra(compraData);
            
            // Remover dados temporários
            this.limparDadosTemporarios();
        },
        
        formatarMetodoPagamento(metodo) {
            const metodos = {
                'credit_card': 'Cartão de Crédito',
                'debit_card': 'Cartão de Débito',
                'ticket': 'Boleto Bancário',
                'pix': 'PIX',
                'mercado_pago': 'Mercado Pago'
            };
            return metodos[metodo] || metodo;
        },
        
        preencherItensPedido(itens) {
            const orderItemsContainer = document.getElementById('orderItems');
            
            if (!itens || itens.length === 0) {
                orderItemsContainer.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                        <p>Nenhum item encontrado no pedido.</p>
                        <small class="text-muted">Os detalhes completos serão enviados por e-mail</small>
                    </div>
                `;
                return;
            }
            
            let itemsHTML = '';
            let totalItens = 0;
            
            itens.forEach(item => {
                // Adaptar para diferentes estruturas de dados
                const nome = item.nome || item.title || 'Produto KARPE';
                const preco = item.preco || item.unit_price || 0;
                const quantidade = item.quantidade || item.quantity || 1;
                const imagem = item.imagem || item.picture_url || 'https://via.placeholder.com/80x80?text=KARPE';
                const categoria = item.categoria || item.description || 'Produto KARPE';
                
                const precoTotal = (parseFloat(preco) * quantidade).toFixed(2);
                totalItens += parseFloat(preco) * quantidade;
                
                itemsHTML += `
                    <div class="order-item">
                        <img src="${imagem}" alt="${nome}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80?text=KARPE'">
                        <div class="item-details">
                            <div class="item-name">${nome}</div>
                            <div class="item-price">R$ ${parseFloat(preco).toFixed(2).replace('.', ',')} × ${quantidade} = R$ ${precoTotal.replace('.', ',')}</div>
                            <small class="text-muted">${categoria}</small>
                        </div>
                    </div>
                `;
            });
            
            orderItemsContainer.innerHTML = itemsHTML;
            console.log(`✅ ${itens.length} itens carregados no pedido`);
        },
        
        preencherTotais(total) {
            const subtotal = parseFloat(total) || 0;
            const desconto = 0; // Poderia ser calculado com base em cupons, etc.
            const frete = 0; // Frete grátis
            const totalFinal = subtotal - desconto + frete;
            
            document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            document.getElementById('total').textContent = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
            
            if (desconto > 0) {
                document.getElementById('discountRow').style.display = 'flex';
                document.getElementById('discount').textContent = `- R$ ${desconto.toFixed(2).replace('.', ',')}`;
            }
            
            console.log(`💰 Total do pedido: R$ ${totalFinal.toFixed(2)}`);
        },
        
        preencherDadosFallback() {
            console.log('🔄 Usando dados de fallback');
            
            // Dados de exemplo para quando não há informações reais
            const dadosCheckout = JSON.parse(localStorage.getItem('karpe_dados_checkout') || '{}');
            const usuarioLogado = JSON.parse(localStorage.getItem('karpe_usuario_logado') || '{}');
            const carrinho = JSON.parse(localStorage.getItem('karpe_carrinho') || '[]');
            
            const usuarioCompleto = { ...usuarioLogado, ...dadosCheckout };
            
            const orderData = {
                payment_id: 'KRP-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
                data_compra: new Date().toISOString(),
                usuario: usuarioCompleto,
                itens: carrinho.length > 0 ? carrinho : [{
                    nome: 'Produto KARPE',
                    preco: '199.90',
                    quantidade: 1,
                    imagem: 'https://via.placeholder.com/80x80?text=KARPE',
                    categoria: 'Produto KARPE'
                }],
                total: carrinho.length > 0 ? 
                    carrinho.reduce((total, item) => total + (parseFloat(item.preco) * item.quantidade), 0) : 
                    199.90,
                endereco_entrega: this.construirEndereco(usuarioCompleto) || 'Endereço será confirmado por e-mail<br>Entrega em até 7 dias úteis'
            };
            
            this.preencherDadosPedido(orderData);
        },
        
        limparCarrinho() {
            // Limpar carrinho após compra concluída
            localStorage.removeItem('karpe_carrinho');
            console.log('🛒 Carrinho limpo após compra');
        },
        
        limparDadosTemporarios() {
            // Manter dados do usuário, mas limpar dados específicos da compra
            localStorage.removeItem('karpe_compra_atual');
            console.log('🧹 Dados temporários da compra limpos');
        },
        
        salvarHistoricoCompra(compraData) {
            try {
                const historico = JSON.parse(localStorage.getItem('karpe_historico_compras') || '[]');
                historico.push({
                    ...compraData,
                    dataSalvamento: new Date().toISOString()
                });
                localStorage.setItem('karpe_historico_compras', JSON.stringify(historico));
                console.log('💾 Compra salva no histórico');
            } catch (error) {
                console.error('❌ Erro ao salvar histórico:', error);
            }
        },
        
        configurarEventos() {
            // Botão de download do comprovante
            document.getElementById('downloadReceipt').addEventListener('click', () => {
                this.gerarComprovante();
            });
        },
        
        gerarComprovante() {
            // Coletar dados da página
            const numeroPedido = document.getElementById('orderNumber').textContent;
            const dataPedido = document.getElementById('orderDate').textContent;
            const clienteNome = document.getElementById('customerName').textContent;
            const clienteTelefone = document.getElementById('customerPhone').textContent;
            const endereco = document.getElementById('shippingAddress').textContent;
            const total = document.getElementById('total').textContent;
            
            // Coletar itens
            const itens = Array.from(document.querySelectorAll('.order-item')).map(item => {
                const nome = item.querySelector('.item-name').textContent;
                const preco = item.querySelector('.item-price').textContent;
                return `- ${nome} | ${preco}`;
            }).join('\n');
            
            // Criar conteúdo do comprovante
            const comprovante = `
==========================================
      COMPROVANTE DE COMPRA - KARPE
==========================================

📋 DADOS DO PEDIDO:
Nº do Pedido: ${numeroPedido}
Data: ${dataPedido}

👤 DADOS DO CLIENTE:
Nome: ${clienteNome}
Telefone: ${clienteTelefone}

📍 ENDEREÇO DE ENTREGA:
${endereco}

🛍️ ITENS DO PEDIDO:
${itens}

💰 RESUMO FINANCEIRO:
${document.getElementById('subtotal').textContent} (Subtotal)
Frete: Grátis
${document.getElementById('total').textContent} (TOTAL)

💳 FORMA DE PAGAMENTO:
${document.getElementById('paymentMethod').textContent}
${document.getElementById('paymentDetails').textContent}

==========================================
📞 ATENDIMENTO: @Karpe_company
📧 E-MAIL: karpe.companyy@gmail.com
📍 LOCAL: Pirapora-MG

Obrigado por comprar na KARPE!
Moda com atitude. Design com propósito.
==========================================
            `.trim();
            
            // Criar blob e fazer download
            const blob = new Blob([comprovante], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `comprovante-karpe-${numeroPedido}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Feedback visual
            const btn = document.getElementById('downloadReceipt');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Comprovante Baixado!';
            btn.classList.remove('btn-outline-karpe');
            btn.classList.add('btn-success');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-karpe');
            }, 3000);
        },
        
        criarConfetti() {
            const container = document.querySelector('.success-hero');
            if (!container) return;
            
            const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animationDelay = Math.random() * 5 + 's';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = (Math.random() * 10 + 5) + 'px';
                confetti.style.height = confetti.style.width;
                
                // Animação
                confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear infinite`;
                
                container.appendChild(confetti);
            }
            
            // Adicionar keyframes dinamicamente
            if (!document.querySelector('#confetti-styles')) {
                const style = document.createElement('style');
                style.id = 'confetti-styles';
                style.textContent = `
                    @keyframes fall {
                        0% {
                            transform: translateY(-100px) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(360deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    // Inicializar o gerenciador de pedidos
    OrderManager.init();
    
    // Log inicial para debug
    console.log('=== PÁGINA DE SUCESSO CARREGADA ===');
    console.log('URL completa:', window.location.href);
    console.log('Parâmetros:', Object.fromEntries(new URLSearchParams(window.location.search)));
});