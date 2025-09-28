const resetPasswordSection = document.getElementById('reset-password-section');
const resetSuccessSection = document.getElementById('reset-success-section');
const resetPasswordForm = document.getElementById('reset-password-form');
const linkEsqueciSenha = document.getElementById('link-esqueci-senha');
const linkVoltarLogin = document.getElementById('link-voltar-login');
const linkSucessoVoltarLogin = document.getElementById('link-sucesso-voltar-login');

linkEsqueciSenha.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(resetPasswordSection);
});

linkVoltarLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(loginSection);
});

linkSucessoVoltarLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(loginSection);
});

resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const submitButton = e.target.querySelector('button');
    
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Enviando...';

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
        alert("Erro ao enviar o e-mail: " + error.message);
    } else {
        showSection(resetSuccessSection);
    }

    submitButton.removeAttribute('aria-busy');
    submitButton.textContent = 'Enviar Link de Redefinição';
});