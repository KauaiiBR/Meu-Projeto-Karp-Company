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
                categoria: produto.categoria || 'Skincare'
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
                    quantidade: 1,
                    categoria: produtoCard.querySelector('.produto-card__category').textContent
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
        notification.className = 'notification';
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
            top: 40px;
            right: 0;
            background: white;
            border: 1px solid var(--gray-2);
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 10000;
            min-width: 200px;
            font-family: inherit;
        `;
        
        menu.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: 600; color: var(--black);">${userData.nome || 'Usuário KARPE'}</div>
            <div style="margin-bottom: 15px; color: var(--gray-5); font-size: 0.9rem;">${userData.email || ''}</div>
            <hr style="margin: 10px 0; border: none; border-top: 1px solid var(--gray-2);">
            <button id="logoutBtn" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; font-size: 0.9rem;">
                <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>Sair
            </button>
        `;
        
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
            userDropdown.appendChild(menu);
        } else {
            document.body.appendChild(menu);
        }
        
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
        
        // ✅ Usa a notificação existente
        this.mostrarNotificacao('✅ Logout realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.reload(); // Recarrega para atualizar o ícone
        }, 1500);
    }
};

// ==================== INICIALIZAÇÃO E FUNÇÕES GLOBAIS ====================

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    CarrinhoManager.init();
});

// Menu hamburger toggle
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

if (hamburger && nav) {
    hamburger.addEventListener('click', function() {
        nav.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Animação do hamburger para X
        const spans = hamburger.querySelectorAll('span');
        if(nav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
        
        // Controla o scroll do body
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', function() {
        if (nav) {
            nav.classList.remove('active');
        }
        if (hamburger) {
            hamburger.classList.remove('active');
            
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
        
        document.body.style.overflow = '';
    });
});

// Header scroll effect
let scrollTimeout;
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'var(--white)';
                header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.background = 'var(--white)';
                header.style.boxShadow = 'none';
            }
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
        
        // Filtrar produtos
        const categoria = this.textContent.toLowerCase();
        filtrarProdutos(categoria);
    });
    
    filter.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.click();
    }, { passive: false });
});

// Função para filtrar produtos
function filtrarProdutos(categoria) {
    const produtos = document.querySelectorAll('.produto-card');
    
    produtos.forEach(produto => {
        const produtoCategoria = produto.querySelector('.produto-card__category').textContent.toLowerCase();
        
        if (categoria === 'todos' || produtoCategoria.includes(categoria)) {
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

// Melhorar a experiência de toque em dispositivos móveis
document.addEventListener('touchstart', function() {}, {passive: true});

// Fechar menu ao tocar fora (para mobile)
document.addEventListener('touchstart', function(e) {
    if (nav && nav.classList.contains('active') && !nav.contains(e.target) && 
        hamburger && !hamburger.contains(e.target)) {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        
        document.body.style.overflow = '';
    }
});