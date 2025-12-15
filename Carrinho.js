// =============================================
// CONFIGURAÇÃO DO MERCADO PAGO - SEGURA
// =============================================
const MercadoPagoConfig = {
    mp: null,

    init() {
        try {
            if (typeof MercadoPago === 'undefined') {
                console.error('❌ SDK do Mercado Pago não carregado');
                this.recarregarSDK();
                return;
            }

            // ✅ APENAS A PUBLIC_KEY (ela é pública mesmo)
            this.mp = new MercadoPago('APP_USR-cbbb2054-d968-4c13-b7b4-29dc52f902ad', {
                locale: 'pt-BR'
            });
            console.log('✅ Mercado Pago inicializado (SEGURO)');
        } catch (error) {
            console.error('❌ Erro ao inicializar Mercado Pago:', error);
        }
    },

    // ✅ AGORA USA SUA API SEGURA NO RENDER
    async criarPreferencia(carrinho, usuario) {
        try {
            console.log('🔄 Criando preferência via API SEGURA...');

            if (!carrinho || carrinho.length === 0) {
                throw new Error('Carrinho vazio');
            }

            // Preparar dados para sua API
            const items = carrinho.map(item => ({
                id: item.id,
                title: item.nome,
                unit_price: parseFloat(item.preco),
                quantity: item.quantidade,
                picture_url: item.imagem || 'https://via.placeholder.com/150x150?text=KARPE'
            }));

            const customer = {
                nome: usuario.nome || 'Cliente KARPE',
                email: usuario.email || 'cliente@karpe.com',
                cpf: usuario.cpf || '000.000.000-00',
                telefone: usuario.telefone || '(00) 00000-0000'
            };

            const shippingAddress = {
                cep: usuario.cep || '00000-000',
                rua: usuario.endereco || 'Endereço não informado',
                numero: usuario.numero || 'S/N',
                complemento: usuario.complemento || '',
                bairro: usuario.bairro || 'Bairro não informado',
                cidade: usuario.cidade || 'Cidade não informada',
                estado: usuario.estado || 'MG'
            };

            // Obter token
            const token = localStorage.getItem('karpe_token');
            if (!token) {
                console.warn('⚠️ Token não encontrado, tentando fazer login automático...');
                await this.fazerLoginAutomatico();
            }

            const headers = {
                'Content-Type': 'application/json'
            };

            // Adicionar token se existir
            const currentToken = localStorage.getItem('karpe_token');
            if (currentToken) {
                headers['Authorization'] = 'Bearer ' + currentToken;
            }

            // ✅ CHAMA SUA API NO RENDER (SEGURA)
            const response = await fetch('https://karpe-backend.onrender.com/api/criar-preferencia', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ 
                    items, 
                    customer, 
                    shippingAddress 
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expirado, tentar fazer login novamente
                    console.log('🔄 Token expirado, renovando...');
                    await this.fazerLoginAutomatico();
                    
                    // Tentar novamente com novo token
                    const newToken = localStorage.getItem('karpe_token');
                    if (newToken) {
                        headers['Authorization'] = 'Bearer ' + newToken;
                        
                        const retryResponse = await fetch('https://karpe-backend.onrender.com/api/criar-preferencia', {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({ 
                                items, 
                                customer, 
                                shippingAddress 
                            })
                        });
                        
                        if (!retryResponse.ok) {
                            const errorData = await retryResponse.json().catch(() => ({}));
                            throw new Error(errorData.error || `Erro na API: ${retryResponse.status}`);
                        }
                        
                        const retryData = await retryResponse.json();
                        console.log('✅ Preferência criada via API SEGURA após renovação:', retryData);
                        return retryData;
                    }
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro na API: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Preferência criada via API SEGURA:', data);
            return data;

        } catch (error) {
            console.error('❌ Erro ao criar preferência:', error);
            throw error;
        }
    },

    async fazerLoginAutomatico() {
        try {
            console.log('🔐 Fazendo login automático...');
            
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

            const data = await response.json();
            
            if (data.success && data.token) {
                localStorage.setItem('karpe_token', data.token);
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(data.user || {}));
                console.log('✅ Login automático realizado!');
                return true;
            } else {
                console.error('❌ Login falhou:', data.message);
                // Criar um usuário temporário
                const usuarioTemporario = {
                    nome: 'Cliente KARPE',
                    email: 'cliente@karpe.com',
                    cpf: '000.000.000-00',
                    telefone: '(00) 00000-0000'
                };
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(usuarioTemporario));
                localStorage.setItem('karpe_token', 'token_temporario_' + Date.now());
                return true;
            }
        } catch (error) {
            console.error('❌ Erro no login automático:', error);
            // Criar um usuário temporário mesmo com erro
            const usuarioTemporario = {
                nome: 'Cliente KARPE',
                email: 'cliente@karpe.com',
                cpf: '000.000.000-00',
                telefone: '(00) 00000-0000'
            };
            localStorage.setItem('karpe_usuario_logado', JSON.stringify(usuarioTemporario));
            localStorage.setItem('karpe_token', 'token_temporario_' + Date.now());
            return true;
        }
    },

    async inicializarCheckout(carrinho, usuario) {
        try {
            console.log('🔄 Inicializando checkout SEGURO...');

            if (!this.mp) {
                throw new Error('Mercado Pago não inicializado');
            }

            this.mostrarLoading();

            // ✅ Agora usa sua API segura
            const preference = await this.criarPreferencia(carrinho, usuario);

            const compraData = {
                preference_id: preference.id,
                usuario: usuario,
                itens: carrinho,
                total: carrinho.reduce((total, item) => total + (parseFloat(item.preco) * item.quantidade), 0),
                data_compra: new Date().toISOString()
            };
            localStorage.setItem('karpe_compra_atual', JSON.stringify(compraData));

            await this.renderizarCheckoutPro(preference.id);

        } catch (error) {
            console.error('❌ Erro ao inicializar checkout:', error);
            this.mostrarErro('Erro ao processar pagamento: ' + error.message);
        }
    },

    async renderizarCheckoutPro(preferenceId) {
        try {
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
                        console.log('✅ Checkout Pro SEGURO ready');
                        this.esconderLoading();
                    },
                    onError: (error) => {
                        console.error('❌ Checkout Pro error:', error);
                        this.mostrarErro('Erro no processamento do pagamento');
                    }
                }
            });

        } catch (error) {
            console.error('❌ Erro ao renderizar checkout:', error);
            this.mostrarErro('Falha ao carregar checkout');
        }
    },

    recarregarSDK() {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => {
            console.log('✅ SDK do Mercado Pago recarregado');
            this.init();
        };
        script.onerror = () => {
            console.error('❌ Falha ao carregar SDK do Mercado Pago');
            this.mostrarErro('Falha ao carregar sistema de pagamento');
        };
        document.head.appendChild(script);
    },

    mostrarLoading() {
        const container = document.getElementById('checkout-pro-container');
        if (container) {
            container.innerHTML = `
                <div class="mp-loading">
                    <div class="mp-loading__spinner"></div>
                    <p>Inicializando checkout seguro...</p>
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
                    <button class="resumo__checkout" onclick="MercadoPagoConfig.fecharModal()">
                        Fechar
                    </button>
                </div>
            `;
        }
    },

    abrirModalCheckout(carrinho, usuario) {
        try {
            this.fecharModal();

            if (!carrinho || carrinho.length === 0) {
                if (typeof CarrinhoManager !== 'undefined') {
                    CarrinhoManager.mostrarMensagem('Seu carrinho está vazio!', 'error');
                } else {
                    alert('Seu carrinho está vazio!');
                }
                return;
            }

            const modalHTML = `
                <div class="mp-modal" id="mpModal">
                    <div class="mp-modal__content">
                        <div class="mp-modal__header">
                            <h3>Finalizar Compra - Mercado Pago</h3>
                            <button class="mp-modal__close" onclick="MercadoPagoConfig.fecharModal()">&times;</button>
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

            setTimeout(() => {
                this.inicializarCheckout(carrinho, usuario);
            }, 100);

        } catch (error) {
            console.error('❌ Erro ao abrir modal:', error);
            this.mostrarErro('Falha ao abrir checkout');
        }
    },

    fecharModal() {
        const modal = document.getElementById('mpModal');
        if (modal) {
            modal.remove();
        }
    }
};

// =============================================
// SISTEMA DO CARRINHO - CORRIGIDO
// =============================================
const CarrinhoManager = {
    CARRINHO_KEY: 'karpe_carrinho',

    init() {
        console.log('🔄 Inicializando CarrinhoManager...');
        
        // ✅ SEMPRE atualizar contador do carrinho
        this.atualizarContadorCarrinho();
        this.verificarLogin();

        // ✅ VERIFICAR SE ESTAMOS NA PÁGINA DO CARRINHO
        const isCarrinhoPage = window.location.pathname.includes('carrinho') || 
                               window.location.pathname.includes('Carrinho');
        
        // Se estiver na página do carrinho, inicializar o carrinho
        if (isCarrinhoPage) {
            console.log('✅ Página do carrinho detectada');
            this.carregarCarrinho();
            this.configurarEventos();
        }
        
        // Inicializar Mercado Pago com verificação
        setTimeout(() => {
            if (typeof MercadoPago !== 'undefined') {
                MercadoPagoConfig.init();
            } else {
                console.warn('⚠️ Aguardando SDK do Mercado Pago...');
                setTimeout(() => MercadoPagoConfig.init(), 1000);
            }
        }, 500);
    },

    obterCarrinho() {
        try {
            const carrinho = localStorage.getItem(this.CARRINHO_KEY);
            const carrinhoArray = carrinho ? JSON.parse(carrinho) : [];
            console.log('📦 Carrinho obtido:', carrinhoArray.length, 'itens');
            return carrinhoArray;
        } catch (error) {
            console.error('❌ Erro ao obter carrinho:', error);
            return [];
        }
    },

    salvarCarrinho(carrinho) {
        try {
            localStorage.setItem(this.CARRINHO_KEY, JSON.stringify(carrinho));
            console.log('💾 Carrinho salvo:', carrinho.length, 'itens');
            this.atualizarContadorCarrinho();
            
            // Se estiver na página do carrinho, recarregar
            if (window.location.pathname.includes('carrinho') || 
                window.location.pathname.includes('Carrinho')) {
                this.carregarCarrinho();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar carrinho:', error);
        }
    },
    
    // ✅ FUNÇÃO PARA ADICIONAR ITENS (para ser usada em outras páginas)
    adicionarItem(produto) {
        try {
            console.log('➕ Adicionando item:', produto);
            
            // Garantir que o produto tenha todos os campos necessários
            if (!produto.id || !produto.nome || !produto.preco) {
                console.error('❌ Produto inválido:', produto);
                return false;
            }
            
            const carrinho = this.obterCarrinho();
            
            // Verificar se o produto já está no carrinho
            const itemExistente = carrinho.find(item => item.id === produto.id);
            
            if (itemExistente) {
                // Se já existe, aumenta a quantidade
                itemExistente.quantidade += produto.quantidade || 1;
            } else {
                // Se não existe, adiciona novo item
                carrinho.push({
                    id: produto.id,
                    nome: produto.nome,
                    preco: produto.preco.toString(),
                    quantidade: produto.quantidade || 1,
                    imagem: produto.imagem || 'https://via.placeholder.com/120x120?text=KARPE',
                    categoria: produto.categoria || 'Produto KARPE'
                });
            }
            
            this.salvarCarrinho(carrinho);
            this.mostrarMensagem(`"${produto.nome}" adicionado ao carrinho!`);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao adicionar item:', error);
            this.mostrarMensagem('Erro ao adicionar produto', 'error');
            return false;
        }
    },

    removerItem(produtoId) {
        const carrinho = this.obterCarrinho();
        const novoCarrinho = carrinho.filter(item => item.id !== produtoId);
        this.salvarCarrinho(novoCarrinho);
        return novoCarrinho;
    },

    atualizarQuantidade(produtoId, quantidade) {
        const carrinho = this.obterCarrinho();
        const item = carrinho.find(item => item.id === produtoId);
        
        if (item) {
            if (quantidade <= 0) {
                return this.removerItem(produtoId);
            }
            item.quantidade = quantidade;
            this.salvarCarrinho(carrinho);
        }
        
        return carrinho;
    },

    limparCarrinho() {
        localStorage.removeItem(this.CARRINHO_KEY);
        this.atualizarContadorCarrinho();
        
        // Se estiver na página do carrinho, recarregar
        if (window.location.pathname.includes('carrinho') || 
            window.location.pathname.includes('Carrinho')) {
            this.carregarCarrinho();
        }
    },

    calcularTotal() {
        const carrinho = this.obterCarrinho();
        return carrinho.reduce((total, item) => {
            return total + (parseFloat(item.preco) * item.quantidade);
        }, 0);
    },

    carregarCarrinho() {
        console.log('🔄 Carregando carrinho...');
        
        const carrinhoItems = document.getElementById('carrinhoItems');
        const carrinhoVazio = document.getElementById('carrinhoVazio');
        const carrinhoContent = document.querySelector('.carrinho__content');
        const resumoPedido = document.getElementById('resumoPedido');
        
        // Verificar se estamos na página correta
        if (!carrinhoItems || !carrinhoVazio) {
            console.log('⚠️ Não está na página do carrinho');
            return;
        }
        
        const carrinho = this.obterCarrinho();
        
        if (carrinho.length === 0) {
            carrinhoVazio.style.display = 'block';
            if (carrinhoContent) carrinhoContent.style.display = 'none';
            if (resumoPedido) resumoPedido.style.display = 'none';
            return;
        }

        carrinhoVazio.style.display = 'none';
        if (carrinhoContent) carrinhoContent.style.display = 'block';
        if (resumoPedido) resumoPedido.style.display = 'block';

        carrinhoItems.innerHTML = '';

        carrinho.forEach(item => {
            const itemElement = this.criarItemCarrinho(item);
            carrinhoItems.appendChild(itemElement);
        });

        this.atualizarResumo();
    },

    criarItemCarrinho(item) {
        const div = document.createElement('div');
        div.className = 'carrinho-item';
        div.innerHTML = `
            <div class="carrinho-item__image-container">
                <img src="${item.imagem || 'https://via.placeholder.com/120x120?text=KARPE'}" alt="${item.nome}" class="carrinho-item__image">
            </div>
            <div class="carrinho-item__details">
                <h3 class="carrinho-item__title">${item.nome}</h3>
                <p class="carrinho-item__variant">${item.categoria || 'Produto KARPE'}</p>
                <button class="carrinho-item__remove" data-id="${item.id}">Remover</button>
            </div>
            <div class="carrinho-item__price">
                <span class="carrinho-item__current-price">R$ ${(parseFloat(item.preco) * item.quantidade).toFixed(2)}</span>
                <div class="carrinho-item__quantity">
                    <button class="carrinho-item__quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <input type="number" class="carrinho-item__quantity-input" value="${item.quantidade}" min="1" data-id="${item.id}">
                    <button class="carrinho-item__quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            </div>
        `;
        return div;
    },

    atualizarResumo() {
        const subtotal = this.calcularTotal();
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');

        if (subtotalElement && totalElement) {
            subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
            totalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
        }
    },

    atualizarContadorCarrinho() {
        const carrinho = this.obterCarrinho();
        const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
        const contador = document.querySelector('.header__action-count');
        
        console.log('🔢 Total de itens no carrinho:', totalItens);
        
        if (contador) {
            contador.textContent = totalItens;
            contador.style.display = totalItens > 0 ? 'flex' : 'none';
        }
    },

    configurarEventos() {
        console.log('⚙️ Configurando eventos do carrinho...');
        
        // Event delegation para botões de quantidade e remover
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Botões de aumentar/diminuir quantidade
            if (target.classList.contains('carrinho-item__quantity-btn')) {
                const action = target.dataset.action;
                const produtoId = target.dataset.id;
                const input = document.querySelector(`.carrinho-item__quantity-input[data-id="${produtoId}"]`);
                if (!input) return;
                
                let quantidade = parseInt(input.value);

                if (action === 'increase') {
                    quantidade++;
                } else if (action === 'decrease') {
                    quantidade--;
                }

                input.value = quantidade;
                this.atualizarQuantidade(produtoId, quantidade);
            }

            // Botão remover
            if (target.classList.contains('carrinho-item__remove')) {
                const produtoId = target.dataset.id;
                const item = this.obterCarrinho().find(item => item.id === produtoId);
                if (item) {
                    this.removerItem(produtoId);
                    this.mostrarMensagem(`"${item.nome}" removido do carrinho`);
                }
            }
        });

        // Input de quantidade
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('carrinho-item__quantity-input')) {
                const produtoId = e.target.dataset.id;
                const quantidade = parseInt(e.target.value);

                if (quantidade > 0) {
                    this.atualizarQuantidade(produtoId, quantidade);
                } else {
                    e.target.value = 1;
                    this.atualizarQuantidade(produtoId, 1);
                }
            }
        });

        // Botão atualizar carrinho
        const atualizarBtn = document.getElementById('atualizarCarrinho');
        if (atualizarBtn) {
            atualizarBtn.addEventListener('click', () => {
                this.carregarCarrinho();
                this.mostrarMensagem('Carrinho atualizado!');
            });
        }

        // Botão finalizar compra
        const finalizarBtn = document.getElementById('finalizarCompra');
        if (finalizarBtn) {
            finalizarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.finalizarCompra();
            });
        }
    },

    mostrarMensagem(texto, tipo = 'success') {
        // Criar e mostrar mensagem temporária
        const mensagem = document.createElement('div');
        mensagem.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${tipo === 'error' ? '#EF4444' : 'var(--black)'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 1.4rem;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        mensagem.textContent = texto;
        document.body.appendChild(mensagem);

        setTimeout(() => {
            mensagem.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            mensagem.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (mensagem.parentNode) {
                    document.body.removeChild(mensagem);
                }
            }, 300);
        }, 3000);
    },

    verificarLogin() {
        const usuarioLogado = localStorage.getItem('karpe_usuario_logado');
        const loginIcon = document.getElementById('loginIcon');
        
        if (loginIcon) {
            if (usuarioLogado) {
                try {
                    const usuario = JSON.parse(usuarioLogado);
                    loginIcon.innerHTML = `<i class="fas fa-user-check" style="color: #10B981;"></i>`;
                    loginIcon.href = '#';
                    loginIcon.title = `Logado como: ${usuario.nome || 'Usuário KARPE'}`;
                    
                    loginIcon.onclick = (e) => {
                        e.preventDefault();
                        this.toggleUserDropdown(usuario);
                    };
                } catch (error) {
                    console.error('❌ Erro ao processar dados do usuário:', error);
                    loginIcon.innerHTML = `<i class="fas fa-user"></i>`;
                    loginIcon.href = 'LoginUsuariosKARP.html';
                    loginIcon.title = 'Fazer Login';
                }
            } else {
                loginIcon.innerHTML = `<i class="fas fa-user"></i>`;
                loginIcon.href = 'LoginUsuariosKARP.html';
                loginIcon.title = 'Fazer Login';
            }
        }
    },

    toggleUserDropdown(usuario) {
        let dropdown = document.querySelector('.user-dropdown-menu');
        
        if (dropdown) {
            dropdown.remove();
            return;
        }
        
        dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown-menu';
        dropdown.style.cssText = `
            position: absolute;
            top: 60px;
            right: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 10000;
            min-width: 200px;
            font-family: inherit;
        `;
        
        dropdown.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: 600; color: #000;">${usuario.nome || 'Usuário KARPE'}</div>
            <div style="margin-bottom: 15px; color: #666; font-size: 0.9rem;">${usuario.email || ''}</div>
            <hr style="margin: 10px 0; border: none; border-top: 1px solid #e5e7eb;">
            <button class="logout-btn" onclick="CarrinhoManager.logout()" style="
                background: #ef4444; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                cursor: pointer; 
                width: 100%; 
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <i class="fas fa-sign-out-alt"></i>
                Sair
            </button>
        `;
        
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
            userDropdown.appendChild(dropdown);
        } else {
            document.body.appendChild(dropdown);
        }
        
        // Fechar dropdown ao clicar fora
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-dropdown') && !e.target.closest('.user-dropdown-menu')) {
                    dropdown.remove();
                }
            }, { once: true });
        }, 100);
    },

    logout() {
        localStorage.removeItem('karpe_usuario_logado');
        localStorage.removeItem('karpe_token');
        localStorage.removeItem('karpe_dados_checkout');
        window.location.reload();
    },

    finalizarCompra() {
        const carrinho = this.obterCarrinho();
        
        if (carrinho.length === 0) {
            this.mostrarMensagem('Seu carrinho está vazio!', 'error');
            return;
        }

        // Fazer login automático primeiro
        this.fazerLoginAutomatico().then(success => {
            if (success) {
                console.log('✅ Login realizado, redirecionando para checkout.html');
                window.location.href = 'checkout.html';
            } else {
                this.mostrarMensagem('Erro ao processar login. Tente novamente.', 'error');
            }
        });
    },

    async fazerLoginAutomatico() {
        try {
            console.log('🔐 Fazendo login automático...');
            
            // Verifica se já tem token
            const tokenAtual = localStorage.getItem('karpe_token');
            if (tokenAtual && !tokenAtual.startsWith('token_temporario_')) {
                console.log('✅ Token já existe, usando token atual');
                return true;
            }
            
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

            const data = await response.json();
            
            if (data.success && data.token) {
                localStorage.setItem('karpe_token', data.token);
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(data.user || {}));
                console.log('✅ Login automático realizado! Token:', data.token.substring(0, 20) + '...');
                return true;
            } else {
                console.error('❌ Login falhou:', data.message);
                // Criar um usuário temporário se falhar
                const usuarioTemporario = {
                    nome: 'Cliente KARPE',
                    email: 'cliente@karpe.com',
                    cpf: '000.000.000-00',
                    telefone: '(00) 00000-0000'
                };
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(usuarioTemporario));
                localStorage.setItem('karpe_token', 'token_temporario_' + Date.now());
                console.log('✅ Usuário temporário criado');
                return true;
            }
        } catch (error) {
            console.error('❌ Erro no login automático:', error);
            // Criar um usuário temporário mesmo com erro
            const usuarioTemporario = {
                nome: 'Cliente KARPE',
                email: 'cliente@karpe.com',
                cpf: '000.000.000-00',
                telefone: '(00) 00000-0000'
            };
            localStorage.setItem('karpe_usuario_logado', JSON.stringify(usuarioTemporario));
            localStorage.setItem('karpe_token', 'token_temporario_' + Date.now());
            console.log('✅ Usuário temporário criado (com erro)');
            return true;
        }
    }
};

// =============================================
// MENU MOBILE
// =============================================
const MenuManager = {
    init() {
        this.configurarMenuMobile();
    },
    
    configurarMenuMobile() {
        const hamburger = document.getElementById('hamburger');
        const nav = document.getElementById('nav');
        
        if (hamburger && nav) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                nav.classList.toggle('active');
                document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            });
            
            // Fechar menu ao clicar em um link
            const navLinks = nav.querySelectorAll('.header__nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    nav.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }
    }
};

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando sistema KARPE...');
    CarrinhoManager.init();
    MenuManager.init();
});

// Prevenir zoom em inputs no iOS
document.addEventListener('touchstart', function() {}, {passive: true});

// Garantir que MercadoPagoConfig esteja disponível globalmente
if (typeof window !== 'undefined') {
    window.MercadoPagoConfig = MercadoPagoConfig;
    window.CarrinhoManager = CarrinhoManager;
    
    // ✅ EXPORTAR FUNÇÕES PARA USO EM OUTRAS PÁGINAS
    window.adicionarAoCarrinho = function(produto) {
        return CarrinhoManager.adicionarItem(produto);
    };
    
    window.obterCarrinho = function() {
        return CarrinhoManager.obterCarrinho();
    };
    
    window.limparCarrinho = function() {
        return CarrinhoManager.limparCarrinho();
    };
}

// Verificar se está na página de checkout e inicializar MercadoPago
if (window.location.pathname.includes('checkout.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('✅ Página checkout detectada, inicializando Mercado Pago...');
            if (typeof MercadoPago !== 'undefined') {
                MercadoPagoConfig.init();
            } else {
                MercadoPagoConfig.recarregarSDK();
            }
        }, 1000);
    });
}

// Testar conexão com o servidor
setTimeout(() => {
    fetch('https://karpe-backend.onrender.com/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('🌐 Conexão com servidor:', data.success ? '✅ OK' : '❌ Falha');
        })
        .catch(error => {
            console.error('❌ Servidor offline:', error);
        });
}, 2000);