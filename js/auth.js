// IINICIALIZAÇÃO DO SUPABASE
const supabaseUrl = "https://jhxlbkjulksfrcuwfhcb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGxia2p1bGtzZnJjdXdmaGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTczNjQsImV4cCI6MjA3MzM3MzM2NH0.d6KOZxc1iJaI_wloMpa-xura80Fv-YXKijG2wuz5wZg";
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

// LOGIN
const loginForm = document.getElementById('login-form');
const msg = document.getElementById('mensagem');

const navSection = document.getElementById('nav-section');

// AUTENTICAÇÃO
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "Conectando...";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if(error){
        msg.textContent = "Usuário ou Senha incorretos";
        //msg.textoContent = error.message; Modificado o erro padrão! 
    }
    else {
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
        msg.textContent = ""; //Evita que o texto "Conectando" após usar o botão "Sair"
        navSection.classList.remove('hidden');
        checkAuth();
    }
});

btnLogout.addEventListener('click', async () => {
    await client.auth.signOut();
    localStorage.removeItem('usuarioLogado');
    navSection.classList.add('hidden');
    checkAuth();
});

function checkAuth() {
    const user = localStorage.getItem('usuarioLogado');
    if (user) {
        showSection(mainSection);
        navSection.classList.remove('hidden');
        carregarProdutos();
    } else {
        showSection(loginSection);
        navSection.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});