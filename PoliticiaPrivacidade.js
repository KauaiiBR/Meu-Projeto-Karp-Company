// POLITICAPRIVACIDADE.JS - Sistema de Login IDÊNTICO ao calçados.js

// Sistema de Gerenciamento do Carrinho (igual ao calçados.js)
const CarrinhoManagerPrivacidade = {
    CARRINHO_KEY: 'karpe_carrinho',
    handleIconClick: null,
    
    init() {
        this.atualizarContadorCarrinho();
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

    // ==================== SISTEMA DE LOGIN (IGUAL AO CALÇADOS.JS) ====================
    
    verificarLogin() {
        const token = localStorage.getItem('karpe_token');
        const userDataString = localStorage.getItem('karpe_usuario_logado');
        const loginIcon = document.getElementById('loginIcon');
        
        if (loginIcon) {
            if (token && userDataString) {
                try {
                    const userData = JSON.parse(userDataString);
                    loginIcon.innerHTML = `<i class="fas fa-user-check" style="color: #10B981;"></i>`;
                    loginIcon.title = `Logado como: ${userData.nome || userData.email || 'Usuário KARPE'}`;
                    loginIcon.href = '#';
                    
                    if (this.handleIconClick) {
                        loginIcon.removeEventListener('click', this.handleIconClick);
                    }
                    
                    this.handleIconClick = (e) => {
                        e.preventDefault();
                        CarrinhoManagerPrivacidade.mostrarMenuUsuario(userData);
                    };
                    loginIcon.addEventListener('click', this.handleIconClick);
                    
                } catch (error) {
                    console.error('Erro ao processar dados do usuário:', error);
                    localStorage.removeItem('karpe_token');
                    localStorage.removeItem('karpe_usuario_logado');
                    this.resetarIconeLogin(loginIcon);
                }
            } else {
                this.resetarIconeLogin(loginIcon);
            }
        }
    },

    resetarIconeLogin(loginIcon) {
        loginIcon.innerHTML = `<i class="fas fa-user"></i>`;
        loginIcon.title = 'Fazer Login';
        loginIcon.href = 'LoginUsuariosKARP.html';
        if (this.handleIconClick) {
            loginIcon.removeEventListener('click', this.handleIconClick);
            this.handleIconClick = null;
        }
    },

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
            <button id="logoutBtnPrivacidade" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; font-size: 0.9rem;">
                <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>Sair
            </button>
        `;
        
        document.body.appendChild(menu);
        
        document.getElementById('logoutBtnPrivacidade').addEventListener('click', () => {
            CarrinhoManagerPrivacidade.sair();
        });
        
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

    sair() {
        localStorage.removeItem('karpe_token');
        localStorage.removeItem('karpe_usuario_logado');
        localStorage.removeItem('karpe_user');
        
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
        notification.textContent = '✅ Desconectado da Política de Privacidade!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateY(-100px)';
            setTimeout(() => {
                document.body.removeChild(notification);
                location.reload();
            }, 300);
        }, 2000);
    }
};

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    CarrinhoManagerPrivacidade.init();
    
    // Header scroll effect (do seu código original)
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'var(--white)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'var(--white)';
            header.style.boxShadow = 'none';
        }
    });

    // Mobile menu toggle (do seu código original)
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenu && mainNav) {
        mobileMenu.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            const spans = mobileMenu.querySelectorAll('span');
            if(mainNav.classList.contains('active')) {
                spans[0].style.transform = 'translateY(9px) rotate(45deg)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'translateY(-9px) rotate(-45deg)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.header__nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (mainNav) mainNav.classList.remove('active');
            
            if (mobileMenu) {
                const spans = mobileMenu.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // Melhorar a experiência de toque em dispositivos móveis
    document.addEventListener('touchstart', function() {}, {passive: true});

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});