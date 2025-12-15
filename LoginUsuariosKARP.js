// Login System - VERSÃO CORRIGIDA E COMPLETA
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    
    console.log('🔐 Tentativa de login:', email);
    
    try {
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        const originalClasses = btn.className;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>ACESSANDO...';
        btn.disabled = true;
        btn.classList.add('opacity-70');
        
        // ✅ CORRIGIDO: Usando seu backend no Render COM tratamento de erros
        const response = await fetch('https://karpe-backend.onrender.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: password
            })
        });

        console.log('📤 Status da resposta:', response.status);
        
        let data;
        try {
            data = await response.json();
            console.log('📊 Resposta da API:', data);
        } catch (jsonError) {
            console.error('❌ Erro ao parsear JSON:', jsonError);
            throw new Error('Resposta inválida do servidor');
        }

        if (response.ok && data.success) {
            // ✅ SUCESSO - Login realizado
            btn.innerHTML = '<i class="fas fa-check mr-2"></i>SUCESSO!';
            btn.classList.remove('bg-black', 'opacity-70');
            btn.classList.add('bg-green-600');
            
            // ✅ CORRIGIDO: Salvando dados corretamente
            if (data.token) {
                localStorage.setItem('karpe_token', data.token);
            }
            
            if (data.user) {
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(data.user));
                localStorage.setItem('karpe_ultimo_login', new Date().toISOString());
                console.log('✅ Usuário salvo no localStorage:', data.user);
            }
            
            // Feedback visual
            const successMessage = document.createElement('div');
            successMessage.innerHTML = `
                <div class="fixed top-20 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg animate-fade-in-up">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                        <div>
                            <strong>✅ Login realizado com sucesso!</strong>
                            <p class="text-sm mt-1">Redirecionando para a página inicial...</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // ❌ ERRO - Mostrar mensagem
            btn.innerHTML = '<i class="fas fa-times mr-2"></i>ERRO!';
            btn.classList.remove('bg-black', 'opacity-70');
            btn.classList.add('bg-red-600');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.className = originalClasses;
                btn.disabled = false;
            }, 3000);
            
            const errorMessage = data?.message || 'Credenciais inválidas ou erro no servidor';
            alert('❌ ' + errorMessage);
            
            // Tentar login local como fallback
            console.log('🔄 Tentando login local como fallback...');
            const loginLocal = fazerLoginLocal(email, password);
            if (loginLocal.success) {
                setTimeout(() => {
                    alert('✅ Login realizado localmente!');
                    window.location.href = 'index.html';
                }, 1000);
            }
        }
    } catch (error) {
        console.error('💥 Erro no login:', error);
        
        const btn = this.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-times mr-2"></i>ERRO DE CONEXÃO';
        btn.classList.remove('bg-black');
        btn.classList.add('bg-red-600');
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-sign-in-alt mr-3"></i>ENTRAR NA KARPE';
            btn.classList.remove('bg-red-600', 'opacity-70');
            btn.classList.add('bg-black');
            btn.disabled = false;
        }, 3000);
        
        // Tentar login local como fallback
        console.log('🔄 Tentando login local devido a erro de conexão...');
        const loginLocal = fazerLoginLocal(email, password);
        
        if (loginLocal.success) {
            alert('✅ Login realizado localmente (modo offline)!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            alert('❌ Erro de conexão: ' + (error.message || 'Não foi possível conectar ao servidor.') + 
                  '\n\nVerifique se você já possui uma conta local ou se cadastre primeiro.');
        }
    }
});

// ✅ Função de fallback para login local (MELHORADA)
function fazerLoginLocal(email, senha) {
    try {
        console.log('🔄 Tentando login local...');
        
        // Primeiro, verificar no localStorage
        const usuarios = JSON.parse(localStorage.getItem('karpe_usuarios') || '[]');
        const usuarioLogado = JSON.parse(localStorage.getItem('karpe_usuario_logado') || 'null');
        
        // Verificar se já está logado
        if (usuarioLogado && usuarioLogado.email === email) {
            console.log('✅ Usuário já logado anteriormente:', usuarioLogado);
            return { 
                success: true, 
                user: usuarioLogado,
                message: 'Login restaurado da sessão anterior' 
            };
        }
        
        // Buscar usuário no array local
        const usuario = usuarios.find(u => 
            u.email === email && u.senha === senha
        );
        
        if (usuario) {
            localStorage.setItem('karpe_usuario_logado', JSON.stringify(usuario));
            localStorage.setItem('karpe_token', 'token_local_' + Date.now());
            localStorage.setItem('karpe_ultimo_login', new Date().toISOString());
            
            console.log('✅ Login local realizado:', usuario);
            return { 
                success: true, 
                user: usuario,
                token: 'token_local_' + Date.now()
            };
        }
        
        console.log('❌ Credenciais locais não encontradas');
        return { 
            success: false, 
            message: 'Nenhuma conta local encontrada com estas credenciais.' 
        };
    } catch (error) {
        console.error('❌ Erro no login local:', error);
        return { 
            success: false, 
            message: 'Erro ao fazer login local: ' + error.message 
        };
    }
}

// ✅ Social login buttons
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.querySelector('span').textContent;
        
        // Animation feedback
        const originalBg = this.style.background;
        this.style.background = 'linear-gradient(135deg, #000000 0%, #2d3748 100%)';
        this.style.color = 'white';
        
        setTimeout(() => {
            this.style.background = originalBg;
            this.style.color = '';
            alert(`🔜 Login com ${platform} será implementado em breve!\n\nPor enquanto, use o login tradicional.`);
        }, 300);
    });
});

// ✅ Add focus effects to inputs
document.querySelectorAll('.input-elegant').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('ring-2', 'ring-black', 'ring-opacity-10');
        this.parentElement.classList.add('rounded-xl');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('ring-2', 'ring-black', 'ring-opacity-10');
    });
});

// ✅ Verificar se já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Verificando se usuário já está logado...');
    
    const usuarioLogado = localStorage.getItem('karpe_usuario_logado');
    const ultimoLogin = localStorage.getItem('karpe_ultimo_login');
    
    if (usuarioLogado) {
        try {
            const usuario = JSON.parse(usuarioLogado);
            console.log('✅ Usuário encontrado no localStorage:', usuario.email);
            
            // Verificar se o login é recente (menos de 24 horas)
            if (ultimoLogin) {
                const tempoLogin = new Date(ultimoLogin);
                const agora = new Date();
                const horasPassadas = (agora - tempoLogin) / (1000 * 60 * 60);
                
                if (horasPassadas < 24) {
                    console.log(`🕒 Sessão válida (${horasPassadas.toFixed(1)} horas)`);
                    // Se quiser redirecionar automaticamente:
                    // setTimeout(() => {
                    //     window.location.href = 'index.html';
                    // }, 1000);
                } else {
                    console.log('⏰ Sessão expirada');
                    // Opcional: limpar dados expirados
                    // localStorage.removeItem('karpe_usuario_logado');
                    // localStorage.removeItem('karpe_token');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao parsear usuário:', error);
        }
    } else {
        console.log('ℹ️ Nenhum usuário logado encontrado');
    }
    
    // Testar conexão com backend
    testarConexaoBackend();
});

// ✅ Testar conexão com o backend
async function testarConexaoBackend() {
    try {
        const response = await fetch('https://karpe-backend.onrender.com/api/health', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            timeout: 5000 // Timeout de 5 segundos
        });
        
        if (response.ok) {
            console.log('✅ Backend conectado com sucesso!');
        } else {
            console.warn('⚠️ Backend retornou status:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível conectar ao backend:', error.message);
        console.log('ℹ️ Usando modo local para login (fallback)');
    }
}

// ✅ Auto-preenchimento para testes (REMOVA EM PRODUÇÃO)
if (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify')) {
    console.log('🔧 Modo de desenvolvimento ativado');
    
    // Preencher automaticamente campos de teste (opcional)
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput && !emailInput.value) {
            emailInput.value = 'teste@karpe.com';
            console.log('📝 Email preenchido automaticamente para testes');
        }
        
        if (passwordInput && !passwordInput.value) {
            passwordInput.value = '123456';
            console.log('🔑 Senha preenchida automaticamente para testes');
        }
    }, 500);
}