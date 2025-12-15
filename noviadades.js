// Sistema de Gerenciamento do Carrinho - CONSISTENTE COM OUTROS ARQUIVOS
const CarrinhoManager = {
    CARRINHO_KEY: 'karpe_carrinho',
    handleIconClick: null, // Para gerenciar evento do ícone
    
    init() {
        this.atualizarContadorCarrinho();
        this.configurarEventos();
        this.verificarLogin();
    },
    
    obterCarrinho() {
        const carrinho = localStorage.getItem(this.CARRINHO_KEY);
        return carrinho ? JSON.parse(carrinho) : [];
    },
    
    salvarCarrinho(carrinho) {
        localStorage.setItem(this.CARRINHO_KEY, JSON.stringify(carrinho));
        this.atualizarContadorCarrinho();
    },
    
    adicionarItem(produto) {
        const carrinho = this.obterCarrinho();
        const itemExistente = carrinho.find(item => item.id === produto.id);
        
        if (itemExistente) {
            itemExistente.quantidade += produto.quantidade || 1;
        } else {
            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
                quantidade: produto.quantidade || 1,
                categoria: produto.categoria || 'Novidades'
            });
        }
        
        this.salvarCarrinho(carrinho);
        return carrinho;
    },
    
    obterQuantidadeTotal() {
        const carrinho = this.obterCarrinho();
        return carrinho.reduce((total, item) => total + item.quantidade, 0);
    },
    
    atualizarContadorCarrinho() {
        const contadores = document.querySelectorAll('.header__action-count');
        const quantidade = this.obterQuantidadeTotal();
        
        contadores.forEach(contador => {
            contador.textContent = quantidade;
            contador.style.display = quantidade > 0 ? 'flex' : 'none';
        });
    },
    
    configurarEventos() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('produto-card__quickview') || 
                e.target.closest('.produto-card__quickview')) {
                e.preventDefault();
                
                const botao = e.target.classList.contains('produto-card__quickview') ? 
                    e.target : e.target.closest('.produto-card__quickview');
                
                const produtoCard = botao.closest('.produto-card');
                const produtoId = botao.getAttribute('data-product-id') || botao.getAttribute('data-product');
                
                const produto = {
                    id: produtoId || `novidade_${Date.now()}`,
                    nome: produtoCard.querySelector('.produto-card__title')?.textContent || 'Novidade KARPE',
                    preco: this.extrairPreco(produtoCard),
                    imagem: produtoCard.querySelector('.produto-card__image')?.src || 'https://via.placeholder.com/400x400?text=KARPE',
                    quantidade: 1,
                    categoria: 'Novidades'
                };
                
                this.adicionarAoCarrinhoComFeedback(produto, botao);
            }
        });
    },
    
    extrairPreco(produtoCard) {
        const precoElement = produtoCard.querySelector('.produto-card__price');
        if (precoElement) {
            const precoTexto = precoElement.textContent;
            const precoNumerico = precoTexto.replace('R$ ', '').replace(',', '.');
            return parseFloat(precoNumerico) || 99.90;
        }
        return 99.90;
    },
    
    adicionarAoCarrinhoComFeedback(produto, botao) {
        const textoOriginal = botao.textContent;
        
        botao.textContent = 'Adicionando...';
        botao.classList.add('loading');
        
        setTimeout(() => {
            this.adicionarItem(produto);
            
            botao.textContent = 'Adicionado!';
            botao.style.backgroundColor = '#10B981';
            
            this.mostrarNotificacao('Produto adicionado ao carrinho!', 'success');
            
            setTimeout(() => {
                botao.textContent = textoOriginal;
                botao.style.backgroundColor = '';
                botao.classList.remove('loading');
            }, 1500);
        }, 500);
    },
    
    mostrarNotificacao(mensagem, tipo = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--black);
            color: var(--white);
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 1.4rem;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = mensagem;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // ==================== SISTEMA DE LOGIN CORRIGIDO ====================
    
    // Sistema de Verificação de Login - CONSISTENTE COM OUTROS ARQUIVOS
    verificarLogin() {
        // ✅ Usa as chaves CORRETAS baseadas nos outros arquivos
        const token = localStorage.getItem('karpe_token');
        const userDataString = localStorage.getItem('karpe_usuario_logado'); // Chave atualizada
        const loginIcon = document.getElementById('loginIcon');
        
        if (loginIcon) {
            if (token && userDataString) {
                try {
                    const userData = JSON.parse(userDataString);
                    // ✅ Usa 'user-check' (igual ao Carrinho.js) e a cor correta
                    loginIcon.innerHTML = `<i class="fas fa-user-check" style="color: #10B981;"></i>`;
                    loginIcon.title = `Logado como: ${userData.nome || userData.email || 'Usuário KARPE'}`;
                    loginIcon.href = '#';
                    
                    // ✅ Remove event listener anterior para evitar duplicação
                    if (this.handleIconClick) {
                        loginIcon.removeEventListener('click', this.handleIconClick);
                    }
                    
                    // ✅ Adiciona o novo listener
                    this.handleIconClick = (e) => {
                        e.preventDefault();
                        CarrinhoManager.mostrarMenuUsuario(userData);
                    };
                    loginIcon.addEventListener('click', this.handleIconClick);
                    
                } catch (error) {
                    console.error('Erro ao processar dados do usuário:', error);
                    // ✅ Limpa as chaves CORRETAS em caso de erro
                    localStorage.removeItem('karpe_token');
                    localStorage.removeItem('karpe_usuario_logado');
                    this.resetarIconeLogin(loginIcon);
                }
            } else {
                // ✅ Estado não logado
                this.resetarIconeLogin(loginIcon);
            }
        }
    },

    // ✅ Função auxiliar para resetar o ícone
    resetarIconeLogin(loginIcon) {
        loginIcon.innerHTML = `<i class="fas fa-user"></i>`;
        loginIcon.title = 'Fazer Login';
        loginIcon.href = 'LoginUsuariosKARP.html';
        // Remove qualquer event listener anterior
        if (this.handleIconClick) {
            loginIcon.removeEventListener('click', this.handleIconClick);
            this.handleIconClick = null;
        }
    },

    // ✅ Função para mostrar menu do usuário (adaptada)
    mostrarMenuUsuario(userData) {
        const menuAnterior = document.getElementById('userDropdownMenu');
        if (menuAnterior) {
            menuAnterior.remove();
        }
        
        const menu = document.createElement('div');
        menu.id = 'userDropdownMenu';
        menu.style.cssText = `
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
        
        menu.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: 600; color: #000;">${userData.nome || 'Usuário KARPE'}</div>
            <div style="margin-bottom: 15px; color: #666; font-size: 0.9rem;">${userData.email || ''}</div>
            <hr style="margin: 10px 0; border: none; border-top: 1px solid #e5e7eb;">
            <button id="logoutBtn" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; font-size: 0.9rem;">
                <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>Sair
            </button>
        `;
        
        document.body.appendChild(menu);
        
        // ✅ Adiciona evento de logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            CarrinhoManager.sair();
        });
        
        // ✅ Fecha o menu ao clicar fora
        setTimeout(() => {
            const fecharMenu = (e) => {
                if (!menu.contains(e.target) && e.target.id !== 'loginIcon' && !e.target.closest('#loginIcon')) {
                    menu.remove();
                    document.removeEventListener('click', fecharMenu);
                    document.removeEventListener('touchstart', fecharMenu);
                }
            };
            
            document.addEventListener('click', fecharMenu);
            document.addEventListener('touchstart', fecharMenu);
        }, 100);
    },

    // ✅ Função de logout (consistente)
    sair() {
        // ✅ Remove as chaves CORRETAS
        localStorage.removeItem('karpe_token');
        localStorage.removeItem('karpe_usuario_logado');
        localStorage.removeItem('karpe_user'); // Remove a chave antiga por garantia
        localStorage.removeItem('userLoggedIn'); // Remove chave antiga do seu código original
        
        // Feedback visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 15px;
            background: #10B981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 1.4rem;
            z-index: 10000;
            transform: translateY(-100px);
            transition: transform 0.3s ease;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = '✅ Logout realizado com sucesso!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateY(-100px)';
            setTimeout(() => {
                document.body.removeChild(notification);
                location.reload(); // Recarrega para atualizar o ícone
            }, 300);
        }, 2000);
    }
};

// ==================== INICIALIZAÇÃO E FUNÇÕES GLOBAIS ====================

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    CarrinhoManager.init();
    
    // Inicializar outras funcionalidades
    initTabs();
    initAnimations();
    verificarNovidadesEmDestaque();
});

// Menu hamburger toggle
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

if (hamburger && nav) {
    hamburger.addEventListener('click', function() {
        nav.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Controlar scroll do body quando menu está aberto
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Fechar menu ao clicar em um link
    document.querySelectorAll('.header__nav-link').forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Fechar menu ao clicar/tocar fora
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('active') && !nav.contains(e.target) && 
            hamburger && !hamburger.contains(e.target)) {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    document.addEventListener('touchstart', function(e) {
        if (nav.classList.contains('active') && !nav.contains(e.target) && 
            hamburger && !hamburger.contains(e.target)) {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, { passive: true });
}

// Header scroll effect otimizado
let scrollTimeout;
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'var(--white)';
                header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                header.style.padding = '10px 0';
            } else {
                header.style.background = 'var(--white)';
                header.style.boxShadow = 'none';
                header.style.padding = '15px 0';
            }
        }
    }, 10);
});

// Tabs de destaques (para compatibilidade com seu código original)
function initTabs() {
    document.querySelectorAll('.destaques__tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover classe ativa de todas as tabs
            document.querySelectorAll('.destaques__tab').forEach(t => {
                t.classList.remove('destaques__tab--active');
            });
            
            // Adicionar classe ativa na tab clicada
            this.classList.add('destaques__tab--active');
            
            // Filtrar produtos
            const category = this.textContent.toLowerCase();
            filtrarProdutosPorCategoria(category);
        });
        
        // Suporte para toque
        tab.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });
    });
}

function filtrarProdutosPorCategoria(categoria) {
    const produtos = document.querySelectorAll('.produto-card, .destaque-card');
    
    produtos.forEach(produto => {
        let mostrarProduto = true;
        
        // Verificar categoria do produto
        if (categoria !== 'todos') {
            const produtoCategoria = produto.getAttribute('data-category') || 
                                    produto.querySelector('.produto-card__category')?.textContent?.toLowerCase() || 
                                    'novidades';
            
            if (produtoCategoria !== categoria) {
                mostrarProduto = false;
            }
        }
        
        // Aplicar animação de transição
        if (mostrarProduto) {
            produto.style.display = 'block';
            setTimeout(() => {
                produto.style.opacity = '1';
                produto.style.transform = 'translateY(0)';
            }, 10);
        } else {
            produto.style.opacity = '0';
            produto.style.transform = 'translateY(10px)';
            setTimeout(() => {
                produto.style.display = 'none';
            }, 300);
        }
    });
}

// Newsletter form (para compatibilidade com seu código original)
document.querySelectorAll('.newsletter__form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('.newsletter__input');
        const email = emailInput.value;
        
        if (email && email.includes('@')) {
            // Simular envio de email
            CarrinhoManager.mostrarNotificacao('Obrigado por se inscrever! Você receberá nossas novidades em breve.', 'success');
            emailInput.value = '';
            
            // Salvar no localStorage (opcional)
            const inscritos = JSON.parse(localStorage.getItem('karpe_newsletter') || '[]');
            inscritos.push({ email: email, data: new Date().toISOString() });
            localStorage.setItem('karpe_newsletter', JSON.stringify(inscritos));
        } else {
            CarrinhoManager.mostrarNotificacao('Por favor, insira um e-mail válido.', 'error');
        }
    });
});

// Adicionar funcionalidade aos cards de destaque
document.querySelectorAll('.destaque-card__link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.destaque-card');
        const title = card.querySelector('.destaque-card__title')?.textContent || 'Produto em destaque';
        
        // Aqui você pode implementar navegação para detalhes do produto
        console.log(`Abrindo detalhes: ${title}`);
        
        // Feedback visual
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.1);
            border-radius: 8px;
            transition: background 0.3s ease;
        `;
        card.appendChild(overlay);
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    });
});

// Verificar novidades em destaque
function verificarNovidadesEmDestaque() {
    const hoje = new Date();
    const ultimaVisita = localStorage.getItem('karpe_ultima_visita_novidades');
    
    if (!ultimaVisita || (hoje - new Date(ultimaVisita)) > (24 * 60 * 60 * 1000)) {
        // Mostrar badge "Novo" para produtos
        const produtosNovos = document.querySelectorAll('.produto-card');
        produtosNovos.forEach((produto, index) => {
            if (index < 3) { // Apenas os 3 primeiros produtos
                const badge = document.createElement('span');
                badge.textContent = 'NOVO';
                badge.style.cssText = `
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: #EF4444;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 1rem;
                    font-weight: 600;
                    z-index: 2;
                `;
                produto.style.position = 'relative';
                produto.appendChild(badge);
            }
        });
    }
    
    localStorage.setItem('karpe_ultima_visita_novidades', hoje.toISOString());
}

// Inicializar animações
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const elementosAnimaveis = document.querySelectorAll('.produto-card, .destaque-card, .section-header');
    elementosAnimaveis.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Melhorar a experiência de toque em dispositivos móveis
document.addEventListener('touchstart', function() {}, {passive: true});

// Prevenir zoom em inputs em dispositivos móveis
document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

// Adicionar efeitos de hover melhorados para desktop
if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.produto-card, .destaque-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
        });
    });
}

// Função para testar conexão com o backend
async function testarConexaoBackend() {
    try {
        const response = await fetch('https://karpe-backend.onrender.com/api/health', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Backend conectado com sucesso! (Novidades)');
        } else {
            console.warn('⚠️ Backend retornou status:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível conectar ao backend:', error.message);
    }
}

// Testar conexão ao carregar a página
setTimeout(() => {
    testarConexaoBackend();
}, 1000);

// Melhorar performance em scroll
window.addEventListener('scroll', function() {}, { passive: true });