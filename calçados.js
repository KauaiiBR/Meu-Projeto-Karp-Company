// MAIN JS OTIMIZADO PARA MOBILE
// Sistema de Gerenciamento do Carrinho
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
                categoria: produto.categoria || 'Calçados'
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
                const produtoId = botao.getAttribute('data-product-id');
                
                const produto = {
                    id: produtoId,
                    nome: produtoCard.querySelector('.produto-card__title').textContent,
                    preco: produtoCard.querySelector('.produto-card__price').textContent
                        .replace('R$ ', '').replace(',', '.'),
                    imagem: produtoCard.querySelector('.produto-card__image').src,
                    quantidade: 1
                };
                
                this.adicionarAoCarrinhoComFeedback(produto, botao);
            }
        });
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
    
    // Sistema de Verificação de Login - VERSÃO CORRIGIDA
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

    // ✅ Função de logout (atualizada)
    sair() {
        // ✅ Remove as chaves CORRETAS
        localStorage.removeItem('karpe_token');
        localStorage.removeItem('karpe_usuario_logado');
        localStorage.removeItem('karpe_user'); // Remove a chave antiga por garantia
        
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
});

// Menu hamburger toggle
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

function toggleMenu() {
    if (menuToggle && mainNav) {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    }
}

if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        toggleMenu();
    }, { passive: false });
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', function() {
        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
        if (mainNav) {
            mainNav.classList.remove('active');
        }
        document.body.style.overflow = '';
    });
});

// Fechar menu ao tocar fora (para mobile)
document.addEventListener('touchstart', function(e) {
    if (mainNav && mainNav.classList.contains('active') && !mainNav.contains(e.target) && 
        menuToggle && !menuToggle.contains(e.target)) {
        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
        if (mainNav) {
            mainNav.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
});

// Header scroll effect otimizado
let scrollTimeout;
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (header && window.scrollY > 50) {
            header.style.background = 'var(--white)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else if (header) {
            header.style.background = 'var(--white)';
            header.style.boxShadow = 'none';
        }
    }, 10);
});

// Filtros de produtos
document.querySelectorAll('.produtos__filter').forEach(filter => {
    filter.addEventListener('click', function() {
        document.querySelectorAll('.produtos__filter').forEach(f => {
            f.classList.remove('active');
        });
        this.classList.add('active');
        
        const filterType = this.textContent.toLowerCase();
        filterProducts(filterType);
    });
    
    filter.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.click();
    }, { passive: false });
});

function filterProducts(filterType) {
    const products = document.querySelectorAll('.produto-card');
    
    products.forEach(product => {
        let showProduct = true;
        
        if (filterType === 'novidades') {
            showProduct = product.querySelector('.produto-card__badge') !== null && 
                         product.querySelector('.produto-card__badge').textContent === 'Novidade';
        } else if (filterType === 'mais vendidos') {
            showProduct = product.querySelector('.produto-card__badge') !== null && 
                         product.querySelector('.produto-card__badge').textContent === 'Mais Vendido';
        }
        
        if (showProduct) {
            product.style.display = 'block';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, 10);
        } else {
            product.style.opacity = '0';
            product.style.transform = 'translateY(10px)';
            setTimeout(() => {
                product.style.display = 'none';
            }, 300);
        }
    });
}

// Prevenir zoom em inputs no iOS
document.addEventListener('touchstart', function() {}, {passive: true});

// Melhorar performance em scroll
window.addEventListener('scroll', function() {}, { passive: true });