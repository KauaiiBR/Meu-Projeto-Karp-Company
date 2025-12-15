// Script específico para checkout.html
document.addEventListener('DOMContentLoaded', function() {
    // Carregar carrinho no resumo
    function carregarResumoCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('karpe_carrinho') || '[]');
        const orderItems = document.getElementById('orderItems');
        const subtotal = document.getElementById('summarySubtotal');
        const total = document.getElementById('summaryTotal');
        
        if (carrinho.length === 0) {
            orderItems.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--gray-5);">
                    <i class="fas fa-shopping-bag fa-2x" style="margin-bottom: 10px;"></i>
                    <p>Carrinho vazio</p>
                </div>
            `;
            subtotal.textContent = 'R$ 0,00';
            total.textContent = 'R$ 0,00';
            return;
        }
        
        let itemsHTML = '';
        let totalCarrinho = 0;
        
        carrinho.forEach(item => {
            const precoTotal = (parseFloat(item.preco) * item.quantidade).toFixed(2);
            totalCarrinho += parseFloat(item.preco) * item.quantidade;
            
            itemsHTML += `
                <div class="order-item">
                    <img src="${item.imagem || 'https://via.placeholder.com/80x80?text=KARPE'}" alt="${item.nome}" class="order-item__image">
                    <div class="order-item__details">
                        <div class="order-item__name">${item.nome}</div>
                        <div class="order-item__price">R$ ${precoTotal.replace('.', ',')}</div>
                        <div class="order-item__quantity">Quantidade: ${item.quantidade}</div>
                    </div>
                </div>
            `;
        });
        
        orderItems.innerHTML = itemsHTML;
        subtotal.textContent = `R$ ${totalCarrinho.toFixed(2).replace('.', ',')}`;
        total.textContent = `R$ ${totalCarrinho.toFixed(2).replace('.', ',')}`;
    }
    
    // Buscar CEP
    document.getElementById('btnBuscarCep').addEventListener('click', function() {
        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace('-', '');
        
        if (cep.length !== 8) {
            alert('Por favor, digite um CEP válido (8 dígitos)');
            return;
        }
        
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('CEP não encontrado');
                    return;
                }
                
                document.getElementById('endereco').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
                
                // Focar no número
                document.getElementById('numero').focus();
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
                alert('Erro ao buscar CEP. Tente novamente.');
            });
    });
    
    // Formatar CPF
    document.getElementById('cpf').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 3 && value.length <= 6) {
            value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        } else if (value.length > 6 && value.length <= 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        }
        
        e.target.value = value;
    });
    
    // Formatar telefone
    document.getElementById('telefone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length === 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length === 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3');
        }
        
        e.target.value = value;
    });
    
    // Formatar CEP
    document.getElementById('cep').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 5) {
            value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
        }
        
        e.target.value = value;
    });
    
    // Carregar dados salvos do usuário
    function carregarDadosSalvos() {
        try {
            const dadosCheckout = JSON.parse(localStorage.getItem('karpe_dados_checkout') || '{}');
            const usuarioLogado = JSON.parse(localStorage.getItem('karpe_usuario_logado') || '{}');
            
            // Combinar dados (dados do checkout têm prioridade sobre dados do usuário)
            const dados = { ...usuarioLogado, ...dadosCheckout };
            
            if (dados.nome) document.getElementById('nome_completo').value = dados.nome;
            if (dados.email) document.getElementById('email').value = dados.email;
            if (dados.cpf) document.getElementById('cpf').value = dados.cpf;
            if (dados.telefone) document.getElementById('telefone').value = dados.telefone;
            if (dados.cep) document.getElementById('cep').value = dados.cep;
            if (dados.endereco) document.getElementById('endereco').value = dados.endereco;
            if (dados.numero) document.getElementById('numero').value = dados.numero;
            if (dados.complemento) document.getElementById('complemento').value = dados.complemento;
            if (dados.bairro) document.getElementById('bairro').value = dados.bairro;
            if (dados.cidade) document.getElementById('cidade').value = dados.cidade;
            if (dados.estado) document.getElementById('estado').value = dados.estado;
            
            // Marcar checkbox de salvar dados
            const salvarDados = localStorage.getItem('karpe_salvar_dados');
            if (salvarDados === 'true') {
                document.getElementById('salvar_dados').checked = true;
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }
    
    // Verificar e garantir autenticação
    async function verificarEAutenticar() {
        try {
            const token = localStorage.getItem('karpe_token');
            if (token) {
                console.log('✅ Token encontrado');
                return true;
            }
            
            console.log('🔐 Token não encontrado, fazendo login automático...');
            return await fazerLoginAutomatico();
            
        } catch (error) {
            console.error('❌ Erro na autenticação:', error);
            return false;
        }
    }
    
    // Fazer login automático
    async function fazerLoginAutomatico() {
        try {
            const response = await fetch('https://karpe-backend.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'teste@karpe.com',
                    senha: '123456'
                })
            });
            
            if (!response.ok) {
                console.error('❌ Falha no login automático:', response.status);
                // Criar usuário temporário
                criarUsuarioTemporario();
                return true;
            }
            
            const data = await response.json();
            
            if (data.success && data.token) {
                localStorage.setItem('karpe_token', data.token);
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(data.user || {}));
                console.log('✅ Login automático realizado com sucesso!');
                return true;
            } else {
                console.error('❌ Login automático falhou:', data.message);
                criarUsuarioTemporario();
                return true;
            }
            
        } catch (error) {
            console.error('❌ Erro no login automático:', error);
            criarUsuarioTemporario();
            return true;
        }
    }
    
    // Criar usuário temporário
    function criarUsuarioTemporario() {
        const usuarioTemporario = {
            nome: 'Cliente KARPE',
            email: 'cliente@karpe.com',
            cpf: '000.000.000-00',
            telefone: '(00) 00000-0000'
        };
        localStorage.setItem('karpe_usuario_logado', JSON.stringify(usuarioTemporario));
        localStorage.setItem('karpe_token', 'token_temporario_' + Date.now());
        console.log('✅ Usuário temporário criado');
    }
    
    // Configuração do Mercado Pago
    window.MercadoPagoConfig = {
        mp: null,
        
        init() {
            try {
                this.mp = new MercadoPago('APP_USR-cbbb2054-d968-4c13-b7b4-29dc52f902ad', {
                    locale: 'pt-BR'
                });
                console.log('✅ Mercado Pago inicializado na página checkout');
                return true;
            } catch (error) {
                console.error('❌ Erro ao inicializar Mercado Pago:', error);
                return false;
            }
        },
        
        async criarPreferencia(carrinho, usuario) {
            try {
                console.log('🔄 Criando preferência...');
                
                const token = localStorage.getItem('karpe_token');
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                if (token && token.startsWith('token_temporario_')) {
                    console.log('⚠️ Usando token temporário, sem Authorization header');
                } else if (token) {
                    headers['Authorization'] = 'Bearer ' + token;
                }
                
                const response = await fetch('https://karpe-backend.onrender.com/api/criar-preferencia', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        items: carrinho.map(item => ({
                            id: item.id,
                            title: item.nome,
                            unit_price: parseFloat(item.preco),
                            quantity: item.quantidade,
                            picture_url: item.imagem || 'https://via.placeholder.com/150x150?text=KARPE'
                        })),
                        customer: {
                            nome: usuario.nome,
                            email: usuario.email,
                            cpf: usuario.cpf,
                            telefone: usuario.telefone
                        },
                        shippingAddress: {
                            cep: usuario.cep,
                            rua: usuario.endereco,
                            numero: usuario.numero,
                            complemento: usuario.complemento || '',
                            bairro: usuario.bairro,
                            cidade: usuario.cidade,
                            estado: usuario.estado
                        }
                    })
                });
                
                if (!response.ok) {
                    if (response.status === 401 && token && !token.startsWith('token_temporario_')) {
                        console.log('🔄 Token expirado, tentando renovar...');
                        await fazerLoginAutomatico();
                        
                        const newToken = localStorage.getItem('karpe_token');
                        if (newToken && !newToken.startsWith('token_temporario_')) {
                            headers['Authorization'] = 'Bearer ' + newToken;
                            
                            const retryResponse = await fetch('https://karpe-backend.onrender.com/api/criar-preferencia', {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify({
                                    items: carrinho.map(item => ({
                                        id: item.id,
                                        title: item.nome,
                                        unit_price: parseFloat(item.preco),
                                        quantity: item.quantidade,
                                        picture_url: item.imagem || 'https://via.placeholder.com/150x150?text=KARPE'
                                    })),
                                    customer: {
                                        nome: usuario.nome,
                                        email: usuario.email,
                                        cpf: usuario.cpf,
                                        telefone: usuario.telefone
                                    },
                                    shippingAddress: {
                                        cep: usuario.cep,
                                        rua: usuario.endereco,
                                        numero: usuario.numero,
                                        complemento: usuario.complemento || '',
                                        bairro: usuario.bairro,
                                        cidade: usuario.cidade,
                                        estado: usuario.estado
                                    }
                                })
                            });
                            
                            if (!retryResponse.ok) {
                                throw new Error(`Erro ao criar preferência: ${retryResponse.status}`);
                            }
                            
                            return await retryResponse.json();
                        }
                    }
                    
                    throw new Error(`Erro ao criar preferência: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('✅ Preferência criada:', data);
                return data;
                
            } catch (error) {
                console.error('❌ Erro ao criar preferência:', error);
                throw error;
            }
        },
        
        async abrirModalCheckout(carrinho, usuario) {
            try {
                this.fecharModal();
                
                if (!this.mp) {
                    if (!this.init()) {
                        throw new Error('Não foi possível inicializar Mercado Pago');
                    }
                }
                
                console.log('🔄 Abrindo modal de checkout...');
                
                const modalHTML = `
                    <div class="mp-modal" id="mpModal">
                        <div class="mp-modal__content">
                            <div class="mp-modal__header">
                                <h3>Finalizar Compra - Mercado Pago</h3>
                                <button class="mp-modal__close" onclick="window.MercadoPagoConfig.fecharModal()">&times;</button>
                            </div>
                            <div class="mp-modal__body">
                                <div id="checkout-pro-container">
                                    <div class="mp-loading">
                                        <div class="mp-loading__spinner"></div>
                                        <p>Inicializando checkout seguro...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                
                await this.inicializarCheckout(carrinho, usuario);
                
            } catch (error) {
                console.error('❌ Erro ao abrir modal:', error);
                this.mostrarErro('Falha ao abrir checkout: ' + error.message);
            }
        },
        
        async inicializarCheckout(carrinho, usuario) {
            try {
                console.log('🔄 Inicializando checkout...');
                
                this.mostrarLoading();
                
                const preference = await this.criarPreferencia(carrinho, usuario);
                
                // Salvar dados da compra atual
                const compraData = {
                    preference_id: preference.id,
                    usuario: usuario,
                    itens: carrinho,
                    total: carrinho.reduce((total, item) => total + (parseFloat(item.preco) * item.quantidade), 0),
                    data_compra: new Date().toISOString(),
                    status: 'pending'
                };
                
                localStorage.setItem('karpe_compra_atual', JSON.stringify(compraData));
                
                // Salvar dados específicos para a página de sucesso
                const dadosSucesso = {
                    ...compraData,
                    payment_id: preference.id,
                    status: 'pending'
                };
                localStorage.setItem('karpe_dados_sucesso', JSON.stringify(dadosSucesso));
                
                await this.renderizarCheckoutPro(preference.id);
                
            } catch (error) {
                console.error('❌ Erro ao inicializar checkout:', error);
                this.mostrarErro('Erro ao processar pagamento: ' + error.message);
            }
        },
        
        async renderizarCheckoutPro(preferenceId) {
            try {
                if (!this.mp) {
                    throw new Error('Mercado Pago não inicializado');
                }
                
                const bricksBuilder = this.mp.bricks();
                
                await bricksBuilder.create('wallet', 'checkout-pro-container', {
                    initialization: {
                        preferenceId: preferenceId,
                    },
                    customization: {
                        visual: {
                            style: {
                                theme: 'default'
                            }
                        },
                        paymentMethods: {
                            maxInstallments: 12,
                            excludedPaymentTypes: ['atm'],
                            excludedPaymentMethods: ['debvisa', 'debmaster']
                        }
                    },
                    callbacks: {
                        onReady: () => {
                            console.log('✅ Checkout Pro ready');
                            this.esconderLoading();
                        },
                        onError: (error) => {
                            console.error('❌ Checkout Pro error:', error);
                            this.mostrarErro('Erro no processamento do pagamento: ' + error.message);
                        },
                        onSubmit: (data) => {
                            console.log('✅ Pagamento submetido:', data);
                        },
                        // Callback para quando o pagamento é processado
                        onPaymentStatusChanged: async (data) => {
                            console.log('🔄 Status do pagamento alterado:', data);
                            
                            if (data.status === 'approved') {
                                // Atualizar status da compra
                                const compraAtual = JSON.parse(localStorage.getItem('karpe_compra_atual') || '{}');
                                compraAtual.status = 'approved';
                                compraAtual.payment_id = data.payment_id;
                                compraAtual.external_reference = data.external_reference;
                                localStorage.setItem('karpe_compra_atual', JSON.stringify(compraAtual));
                                
                                // Preparar dados para a página de sucesso
                                await this.prepararRedirecionamentoSucesso(data);
                            }
                        }
                    }
                });
                
            } catch (error) {
                console.error('❌ Erro ao renderizar checkout:', error);
                this.mostrarErro('Falha ao carregar interface de pagamento');
            }
        },
        
        async prepararRedirecionamentoSucesso(paymentData) {
            try {
                console.log('🔄 Preparando redirecionamento para sucesso...');
                
                // Obter todos os dados necessários
                const compraAtual = JSON.parse(localStorage.getItem('karpe_compra_atual') || '{}');
                const usuario = JSON.parse(localStorage.getItem('karpe_usuario_logado') || '{}');
                const dadosCheckout = JSON.parse(localStorage.getItem('karpe_dados_checkout') || '{}');
                const carrinho = JSON.parse(localStorage.getItem('karpe_carrinho') || '[]');
                
                // Combinar dados do usuário
                const usuarioCompleto = { ...usuario, ...dadosCheckout };
                
                // Criar objeto completo de dados
                const dadosSucesso = {
                    payment_id: paymentData.payment_id || compraAtual.preference_id || 'MP-' + Date.now(),
                    status: paymentData.status || 'approved',
                    external_reference: paymentData.external_reference || compraAtual.preference_id,
                    payment_method: paymentData.payment_method_id || 'credit_card',
                    installments: paymentData.installments || 1,
                    transaction_amount: paymentData.transaction_amount || compraAtual.total,
                    usuario: usuarioCompleto,
                    itens: carrinho,
                    data_compra: new Date().toISOString(),
                    endereco_entrega: this.construirEndereco(usuarioCompleto)
                };
                
                console.log('📋 Dados para sucesso:', dadosSucesso);
                
                // Salvar dados específicos para a página de sucesso
                localStorage.setItem('karpe_dados_sucesso', JSON.stringify(dadosSucesso));
                
                // Limpar carrinho após compra
                localStorage.removeItem('karpe_carrinho');
                
                // Fechar modal
                this.fecharModal();
                
                // Pequeno delay para garantir que tudo foi salvo
                setTimeout(() => {
                    // Redirecionar para página de sucesso
                    const params = new URLSearchParams({
                        payment_id: dadosSucesso.payment_id,
                        status: dadosSucesso.status,
                        external_reference: dadosSucesso.external_reference,
                        payment_method: dadosSucesso.payment_method,
                        transaction_amount: dadosSucesso.transaction_amount
                    });
                    
                    window.location.href = `sucesso.html?${params.toString()}`;
                }, 1000);
                
            } catch (error) {
                console.error('❌ Erro ao preparar redirecionamento:', error);
                // Fallback: redirecionar mesmo sem todos os dados
                window.location.href = 'sucesso.html?status=approved';
            }
        },
        
        construirEndereco(usuario) {
            if (usuario.endereco && usuario.numero && usuario.bairro && usuario.cidade && usuario.estado) {
                return `${usuario.endereco}, ${usuario.numero}${usuario.complemento ? ' - ' + usuario.complemento : ''} - ${usuario.bairro} - ${usuario.cidade}/${usuario.estado}`;
            }
            return 'Endereço será confirmado por e-mail';
        },
        
        mostrarLoading() {
            const container = document.getElementById('checkout-pro-container');
            if (container) {
                container.innerHTML = `
                    <div class="mp-loading">
                        <div class="mp-loading__spinner"></div>
                        <p>Processando seu pagamento...</p>
                    </div>
                `;
            }
        },
        
        esconderLoading() {
            const loading = document.querySelector('.mp-loading');
            if (loading) {
                loading.remove();
            }
        },
        
        mostrarErro(mensagem) {
            console.error('💥 Erro:', mensagem);
            
            const container = document.getElementById('checkout-pro-container');
            if (container) {
                container.innerHTML = `
                    <div class="compra-status">
                        <div class="compra-status__icon error">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3 class="compra-status__title">Erro no Pagamento</h3>
                        <p class="compra-status__text">${mensagem}</p>
                        <button class="resumo__checkout" onclick="window.MercadoPagoConfig.fecharModal()" style="margin-top: 20px; width: 100%;">
                            Fechar
                        </button>
                    </div>
                `;
            }
        },
        
        fecharModal() {
            const modal = document.getElementById('mpModal');
            if (modal) {
                modal.remove();
            }
        }
    };
    
    // Enviar formulário
    document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Mostrar loading
        const btnSubmit = document.getElementById('btnIrParaPagamento');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        btnSubmit.disabled = true;
        
        try {
            // Verificar se tem itens no carrinho
            const carrinho = JSON.parse(localStorage.getItem('karpe_carrinho') || '[]');
            if (carrinho.length === 0) {
                alert('Seu carrinho está vazio!');
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
                return;
            }
            
            // Coletar dados do formulário
            const dadosForm = {
                nome: document.getElementById('nome_completo').value.trim(),
                email: document.getElementById('email').value.trim(),
                cpf: document.getElementById('cpf').value.trim(),
                telefone: document.getElementById('telefone').value.trim(),
                cep: document.getElementById('cep').value.trim(),
                endereco: document.getElementById('endereco').value.trim(),
                numero: document.getElementById('numero').value.trim(),
                complemento: document.getElementById('complemento').value.trim(),
                bairro: document.getElementById('bairro').value.trim(),
                cidade: document.getElementById('cidade').value.trim(),
                estado: document.getElementById('estado').value,
                observacoes: document.getElementById('observacoes').value.trim()
            };
            
            // Validar campos obrigatórios
            if (!dadosForm.nome || !dadosForm.email || !dadosForm.cpf || !dadosForm.telefone ||
                !dadosForm.cep || !dadosForm.endereco || !dadosForm.numero || 
                !dadosForm.bairro || !dadosForm.cidade || !dadosForm.estado) {
                alert('Por favor, preencha todos os campos obrigatórios (*)');
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
                return;
            }
            
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(dadosForm.email)) {
                alert('Por favor, digite um email válido');
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
                return;
            }
            
            // Salvar dados do checkout
            localStorage.setItem('karpe_dados_checkout', JSON.stringify(dadosForm));
            
            // Salvar checkbox
            const salvarDados = document.getElementById('salvar_dados').checked;
            localStorage.setItem('karpe_salvar_dados', salvarDados.toString());
            
            // Atualizar usuário logado se necessário
            if (salvarDados) {
                const usuarioAtual = JSON.parse(localStorage.getItem('karpe_usuario_logado') || '{}');
                const usuarioAtualizado = { ...usuarioAtual, ...dadosForm };
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(usuarioAtualizado));
            }
            
            console.log('✅ Dados do formulário salvos:', dadosForm);
            
            // Verificar autenticação
            const autenticado = await verificarEAutenticar();
            if (!autenticado) {
                alert('Erro de autenticação. Por favor, tente novamente.');
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
                return;
            }
            
            // Combinar dados do usuário
            const usuarioLogado = JSON.parse(localStorage.getItem('karpe_usuario_logado') || '{"nome": "Cliente KARPE", "email": "cliente@karpe.com"}');
            const usuarioComDados = { ...usuarioLogado, ...dadosForm };
            
            // Garantir que o SDK do Mercado Pago foi carregado
            if (typeof MercadoPago === 'undefined') {
                alert('Sistema de pagamento não carregado. Aguarde um momento e tente novamente.');
                console.error('SDK do Mercado Pago não está disponível');
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
                return;
            }
            
            // Inicializar Mercado Pago se necessário
            if (!window.MercadoPagoConfig.mp) {
                window.MercadoPagoConfig.init();
            }
            
            // Abrir modal do Mercado Pago
            console.log('✅ Chamando abrirModalCheckout...');
            await window.MercadoPagoConfig.abrirModalCheckout(carrinho, usuarioComDados);
            
        } catch (error) {
            console.error('❌ Erro no processamento do checkout:', error);
            alert('Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.');
        } finally {
            // Restaurar botão
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    });
    
    // Inicializar
    carregarResumoCarrinho();
    carregarDadosSalvos();
    
    // Verificar SDK do Mercado Pago
    if (typeof MercadoPago !== 'undefined') {
        console.log('✅ SDK do Mercado Pago já carregado');
    } else {
        console.log('⏳ Aguardando SDK do Mercado Pago...');
        const checkSDK = setInterval(() => {
            if (typeof MercadoPago !== 'undefined') {
                console.log('✅ SDK do Mercado Pago carregado');
                clearInterval(checkSDK);
            }
        }, 500);
    }
});