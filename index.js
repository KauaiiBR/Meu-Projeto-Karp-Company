// MAIN JS 
// Sistema de Gerenciamento do Carrinho (consistente com outros arquivos)
const CarrinhoManager = {
    CARRINHO_KEY: 'karpe_carrinho',
    handleIconClick: null, // Para gerenciar evento do ícone
    
    init() {
        this.atualizarContadorCarrinho();
        this.verificarLogin();
    },
    
    obterCarrinho() {
        const carrinho = localStorage.getItem(this.CARRINHO_KEY);
        return carrinho ? JSON.parse(carrinho) : [];
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

    // ==================== SISTEMA DE LOGIN CORRIGIDO ====================
    
    // Sistema de Verificação de Login (consistente com outros arquivos)
    verificarLogin() {
        // ✅ Usa as chaves CORRETAS baseadas nos outros arquivos
        const token = localStorage.getItem('karpe_token');
        const userDataString = localStorage.getItem('karpe_usuario_logado'); // Chave atualizada
        const loginIcon = document.getElementById('loginIcon');
        
        if (loginIcon) {
            if (token && userDataString) {
                try {
                    const userData = JSON.parse(userDataString);
                    // ✅ Usa 'user-check' (igual aos outros arquivos) e a cor correta
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

    // ✅ Função para mostrar menu do usuário (consistente com outros arquivos)
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

    // ✅ Função de logout (consistente com outros arquivos)
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

// ==================== FUNÇÕES DE ANIMAÇÃO E MENU ====================

// Menu Mobile
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

if (hamburger && nav) {
    hamburger.addEventListener('click', function() {
        nav.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Animar hamburger
        const spans = hamburger.querySelectorAll('span');
        if (nav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
        
        // Controlar scroll do body
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Fechar menu ao clicar em um link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            
            document.body.style.overflow = '';
        });
    });
    
    // Fechar menu ao clicar/tocar fora
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('active') && !nav.contains(e.target) && 
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
    
    document.addEventListener('touchstart', function(e) {
        if (nav.classList.contains('active') && !nav.contains(e.target) && 
            hamburger && !hamburger.contains(e.target)) {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            
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
                header.style.padding = '10px 0';
                header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.padding = '15px 0';
                header.style.boxShadow = 'none';
            }
        }
    }, 10);
});

// Animação de entrada dos elementos
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const elementsToAnimate = document.querySelectorAll('.collection-card, .about__content, .newsletter__content, .hero__content');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Adicionar estilo CSS para animações
function addAnimationStyles() {
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .header__action-count {
                transition: all 0.3s ease;
            }
            
            .notification {
                transition: transform 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
}

// Testar conexão com o backend
async function testarConexaoBackend() {
    try {
        const response = await fetch('https://karpe-backend.onrender.com/api/health', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Backend conectado com sucesso!');
        } else {
            console.warn('⚠️ Backend retornou status:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível conectar ao backend:', error.message);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    CarrinhoManager.init();
    initAnimations();
    addAnimationStyles();
    testarConexaoBackend();
    });
    