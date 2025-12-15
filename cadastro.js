// Password Strength Indicator
document.getElementById('senha').addEventListener('input', function() {
    const password = this.value;
    const strengthBar = document.getElementById('passwordStrength');
    const strengthBars = strengthBar.querySelectorAll('[data-strength]');
    const strengthText = document.getElementById('strengthText');
    
    if (password.length > 0) {
        strengthBar.classList.remove('hidden');
        
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        
        // Update bars
        strengthBars.forEach((bar, index) => {
            bar.className = 'flex-1 h-1 rounded-full transition-all duration-300';
            if (index < strength) {
                if (strength < 2) bar.classList.add('bg-red-400');
                else if (strength < 4) bar.classList.add('bg-yellow-400');
                else bar.classList.add('bg-green-400');
            } else {
                bar.classList.add('bg-gray-200');
            }
        });
        
        // Update text
        const texts = ['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];
        const colors = ['text-red-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-green-500'];
        strengthText.textContent = texts[strength];
        strengthText.className = `text-xs font-medium ${colors[strength]}`;
    } else {
        strengthBar.classList.add('hidden');
    }
});

// Password Match Indicator
document.getElementById('confirmarSenha').addEventListener('input', function() {
    const senha = document.getElementById('senha').value;
    const confirmarSenha = this.value;
    const matchDiv = document.getElementById('passwordMatch');
    
    if (confirmarSenha.length > 0) {
        matchDiv.classList.remove('hidden');
        if (senha === confirmarSenha) {
            matchDiv.innerHTML = '<p class="text-green-600 text-xs font-medium"><i class="fas fa-check-circle mr-1"></i>Senhas coincidem</p>';
        } else {
            matchDiv.innerHTML = '<p class="text-red-500 text-xs font-medium"><i class="fas fa-times-circle mr-1"></i>Senhas não coincidem</p>';
        }
    } else {
        matchDiv.classList.add('hidden');
    }
});

// ✅ Registration System - ATUALIZADO PARA SEU BACKEND
document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const telefone = document.getElementById('telefone').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    
    console.log('📝 Dados do cadastro:', { nome, email, telefone, dataNascimento });
    
    // Validações
    if (!nome || nome.length < 2) {
        alert('❌ Por favor, insira um nome válido (mínimo 2 caracteres)');
        return;
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
        alert('❌ Por favor, insira um e-mail válido');
        return;
    }
    
    if (senha !== confirmarSenha) {
        alert('❌ As senhas não coincidem!');
        return;
    }
    
    if (senha.length < 6) {
        alert('❌ A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    if (!document.getElementById('terms').checked) {
        alert('❌ Você deve aceitar os termos e condições!');
        return;
    }
    
    try {
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        const originalClasses = btn.className;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>CRIANDO CONTA...';
        btn.disabled = true;
        btn.classList.add('opacity-70');
        
        // ✅ USANDO SEU BACKEND NO RENDER (karpe-backend.onrender.com)
        const response = await fetch('https://karpe-backend.onrender.com/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha,
                telefone: telefone,
                data_nascimento: dataNascimento
            })
        });

        console.log('📤 Resposta do servidor:', response.status);
        
        let data;
        try {
            data = await response.json();
            console.log('📊 Dados retornados:', data);
        } catch (jsonError) {
            console.error('❌ Erro ao parsear JSON:', jsonError);
            throw new Error('Resposta inválida do servidor');
        }

        if (response.ok && data.success) {
            // ✅ SUCESSO - Cadastro realizado
            btn.innerHTML = '<i class="fas fa-check mr-2"></i>CONTA CRIADA!';
            btn.classList.remove('bg-black', 'opacity-70');
            btn.classList.add('bg-green-600');
            
            // Salvar usuário no localStorage
            if (data.user && data.token) {
                localStorage.setItem('karpe_usuario_logado', JSON.stringify(data.user));
                localStorage.setItem('karpe_token', data.token);
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
                            <strong>✅ Conta criada com sucesso!</strong>
                            <p class="text-sm mt-1">Redirecionando para a página inicial...</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                window.location.href = 'index.html'; // Redireciona para home
            }, 2000);
            
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
            
            const errorMessage = data?.message || 'Erro ao criar conta. Tente novamente.';
            alert('❌ ' + errorMessage);
            
            // Tentar cadastro local como fallback
            console.log('🔄 Tentando cadastro local como fallback...');
            const resultadoLocal = cadastrarLocalmente(nome, email, senha, telefone, dataNascimento);
            
            if (resultadoLocal.success) {
                setTimeout(() => {
                    alert('✅ Cadastro realizado localmente! Você pode fazer login.');
                    window.location.href = 'LoginUsuariosKARP.html';
                }, 1000);
            }
        }
        
    } catch (error) {
        console.error('💥 Erro no cadastro:', error);
        
        const btn = this.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-times mr-2"></i>ERRO DE CONEXÃO';
        btn.classList.remove('bg-black');
        btn.classList.add('bg-red-600');
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-user-plus mr-3"></i>CRIAR CONTA KARPE';
            btn.classList.remove('bg-red-600', 'opacity-70');
            btn.classList.add('bg-black');
            btn.disabled = false;
        }, 3000);
        
        // Tentar cadastro local
        console.log('🔄 Tentando cadastro local...');
        const resultadoLocal = cadastrarLocalmente(nome, email, senha, telefone, dataNascimento);
        
        if (resultadoLocal.success) {
            alert('✅ Cadastro realizado localmente! Você pode fazer login.');
            setTimeout(() => {
                window.location.href = 'LoginUsuariosKARP.html';
            }, 1500);
        } else {
            alert('❌ Erro de conexão: ' + (error.message || 'Não foi possível conectar ao servidor.'));
        }
    }
});

// ✅ Fallback: Se não tiver backend, salvar localmente
function cadastrarLocalmente(nome, email, senha, telefone, dataNascimento) {
    try {
        console.log('🔄 Iniciando cadastro local...');
        
        const usuarios = JSON.parse(localStorage.getItem('karpe_usuarios') || '[]');
        
        // Verificar se email já existe
        const usuarioExistente = usuarios.find(u => u.email === email);
        if (usuarioExistente) {
            console.log('❌ Email já cadastrado localmente');
            return { 
                success: false, 
                message: 'Este e-mail já está cadastrado localmente.' 
            };
        }
        
        const novoUsuario = {
            id: 'usr_local_' + Date.now(),
            nome: nome,
            email: email,
            senha: senha, // ⚠️ Em produção, isso deveria ser hasheado
            telefone: telefone,
            data_nascimento: dataNascimento,
            data_cadastro: new Date().toISOString(),
            tipo: 'local'
        };
        
        usuarios.push(novoUsuario);
        localStorage.setItem('karpe_usuarios', JSON.stringify(usuarios));
        localStorage.setItem('karpe_usuario_logado', JSON.stringify(novoUsuario));
        localStorage.setItem('karpe_token', 'token_local_' + Date.now());
        localStorage.setItem('karpe_ultimo_login', new Date().toISOString());
        
        console.log('✅ Usuário cadastrado localmente:', novoUsuario);
        
        return { 
            success: true, 
            user: novoUsuario,
            token: 'token_local_' + Date.now(),
            message: 'Cadastro realizado localmente com sucesso!'
        };
    } catch (error) {
        console.error('❌ Erro no cadastro local:', error);
        return { 
            success: false, 
            message: 'Erro ao salvar localmente: ' + error.message 
        };
    }
}

// ✅ Máscara para telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    e.target.value = value;
});

// ✅ Formatar data para padrão brasileiro (opcional)
document.getElementById('dataNascimento').addEventListener('change', function(e) {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
        const idade = calcularIdade(date);
        console.log('👤 Idade calculada:', idade, 'anos');
        
        // Validação de idade (opcional)
        if (idade < 16) {
            alert('⚠️ Você precisa ter pelo menos 16 anos para se cadastrar.');
            e.target.value = '';
        }
    }
});

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade;
}

// ✅ Verificar se já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = localStorage.getItem('karpe_usuario_logado');
    if (usuarioLogado) {
        // Se já está logado, redirecionar para home
        console.log('ℹ️ Usuário já logado, redirecionando...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
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
            }
        });
        
        if (response.ok) {
            console.log('✅ Backend conectado com sucesso!');
        } else {
            console.warn('⚠️ Backend retornou status:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível conectar ao backend:', error.message);
        console.log('ℹ️ Usando modo local para cadastro/login');
    }
}