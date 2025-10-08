const resetPasswordForm = document.getElementById('reset-password-form');
const linkEsqueciSenha = document.getElementById('link-esqueci-senha');
const linkVoltarLogin = document.getElementById('link-voltar-login');
const linkSucessoVoltarLogin = document.getElementById('link-sucesso-voltar-login');
const updatePasswordForm = document.getElementById('update-password-form');
const updatePasswordMsg = document.getElementById('update-password-msg');

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

client.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    document.getElementById('nav-section').classList.add('hidden'); 
    showSection(updatePasswordSection);
  }
});

updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('update-password').value;
    const submitButton = e.target.querySelector('button');

    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Salvando...';
    updatePasswordMsg.textContent = '';

    const { data, error } = await client.auth.updateUser({
      password: newPassword
    });

    if (error) {
        updatePasswordMsg.textContent = 'Erro ao atualizar a senha: ' + error.message;
        console.error(error);
    } else {
        updatePasswordMsg.textContent = 'Senha atualizada com sucesso! Você já pode fazer o login.';
        
        setTimeout(() => {
            window.location.hash = '';
            window.location.reload();
        }, 3000);
    }

    submitButton.removeAttribute('aria-busy');
    submitButton.textContent = 'Salvar Nova Senha';
});