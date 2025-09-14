// Cria cliente Supabase
const supabaseUrl = "https://jhxlbkjulksfrcuwfhcb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGxia2p1bGtzZnJjdXdmaGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTczNjQsImV4cCI6MjA3MzM3MzM2NH0.d6KOZxc1iJaI_wloMpa-xura80Fv-YXKijG2wuz5wZg";
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

const form = document.getElementById("login");

const msg = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Conectando...";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    msg.textContent = "Erro: " + error.message;
  } else {
    msg.textContent = "Login realizado com sucesso!";
    console.log("Usuário logado:", data.user);
  }
});
