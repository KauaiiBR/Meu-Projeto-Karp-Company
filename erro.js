    // MAIN JS 
        // Sistema de Verificação de Login
        function verificarLogin() {
            const usuarioLogado = localStorage.getItem('karpe_usuario_logado');
            const loginIcon = document.getElementById('loginIcon');
            
            if (usuarioLogado && loginIcon) {
                const usuario = JSON.parse(usuarioLogado);
                loginIcon.innerHTML = `<i class="fas fa-user-check"></i>`;
                loginIcon.href = '#';
                loginIcon.onclick = (e) => {
                    e.preventDefault();
                    toggleUserDropdown();
                };
            }
        }

        // Menu dropdown do usuário
        function toggleUserDropdown() {
            const usuarioLogado = localStorage.getItem('karpe_usuario_logado');
            if (!usuarioLogado) return;
            
            const usuario = JSON.parse(usuarioLogado);
            let dropdown = document.querySelector('.user-dropdown-menu');
            
            if (dropdown) {
                dropdown.remove();
                return;
            }
            
            dropdown = document.createElement('div');
            dropdown.className = 'user-dropdown-menu';
            dropdown.innerHTML = `
                <div>${usuario.nome}</div>
                <div>${usuario.email}</div>
                <hr>
                <button class="logout-btn" onclick="logout()">Sair</button>
            `;
            
            document.querySelector('.user-dropdown').appendChild(dropdown);
            
            // Fechar dropdown ao clicar fora
            setTimeout(() => {
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.user-dropdown')) {
                        dropdown.remove();
                    }
                }, { once: true });
            }, 100);
        }

        // Função de logout
        function logout() {
            localStorage.removeItem('karpe_usuario_logado');
            window.location.reload();
        }

        // Menu Mobile
        function configurarMenuMobile() {
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

        // Contador do carrinho
        function atualizarContadorCarrinho() {
            const carrinho = JSON.parse(localStorage.getItem('karpe_carrinho') || '[]');
            const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
            const contador = document.querySelector('.header__action-count');
            if (contador) {
                contador.textContent = totalItens;
                contador.style.display = totalItens > 0 ? 'flex' : 'none';
            }
        }

        // Inicialização
        document.addEventListener('DOMContentLoaded', () => {
            verificarLogin();
            configurarMenuMobile();
            atualizarContadorCarrinho();
        });

        // Estilos para o dropdown do usuário
        const style = document.createElement('style');
        style.textContent = `
            .user-dropdown {
                position: relative;
            }

            .user-dropdown-menu {
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
            }

            .user-dropdown-menu div:first-child {
                margin-bottom: 10px;
                font-weight: 600;
                color: var(--black);
            }

            .user-dropdown-menu div:nth-child(2) {
                margin-bottom: 15px;
                color: var(--gray-5);
                font-size: 0.9rem;
            }

            .user-dropdown-menu hr {
                margin: 10px 0;
                border: none;
                border-top: 1px solid var(--gray-2);
            }

            .logout-btn {
                background: #ef4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                font-size: 0.9rem;
                transition: var(--transition);
            }

            .logout-btn:hover {
                background: #dc2626;
            }
        `;
        document.head.appendChild(style);