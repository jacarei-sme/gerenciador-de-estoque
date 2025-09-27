// Em js/auth.js

// --- RECUPERAÇÃO DE SENHA ---

// 1. Selecione os novos elementos do HTML
const resetPasswordSection = document.getElementById('reset-password-section');
const resetSuccessSection = document.getElementById('reset-success-section');
const resetPasswordForm = document.getElementById('reset-password-form');
const linkEsqueciSenha = document.getElementById('link-esqueci-senha');
const linkVoltarLogin = document.getElementById('link-voltar-login');
const linkSucessoVoltarLogin = document.getElementById('link-sucesso-voltar-login');

// 2. Adicione os Event Listeners para navegação
linkEsqueciSenha.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(resetPasswordSection); // Mostra o formulário de redefinição
});

linkVoltarLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(loginSection); // Volta para a tela de login
});

linkSucessoVoltarLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(loginSection); // Volta para a tela de login
});

// 3. Adicione o Event Listener para o envio do formulário
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const submitButton = e.target.querySelector('button');
    
    // Desabilita o botão para evitar múltiplos envios
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Enviando...';

    // 4. Chama a função do Supabase para enviar o e-mail
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // Opcional: URL para onde o usuário volta após redefinir
    });

    if (error) {
        alert("Erro ao enviar o e-mail: " + error.message);
    } else {
        // Mostra a tela de sucesso, independentemente se o e-mail existe ou não
        // Isso é uma boa prática de segurança para não confirmar quais e-mails estão cadastrados.
        showSection(resetSuccessSection);
    }

    // Reabilita o botão
    submitButton.removeAttribute('aria-busy');
    submitButton.textContent = 'Enviar Link de Redefinição';
});