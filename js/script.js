const demoUsers = [
  { username: "usuario", password: "1234", name: "Usuário de demonstração", role: "usuario" },
  { username: "gerente", password: "1234", name: "Gerente de demonstração", role: "gerente" },
  { username: "admin", password: "1234", name: "Administrador", role: "administrador" }
];

const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.querySelector("#username").value.trim();
    const password = document.querySelector("#password").value;
    const error = document.querySelector("#loginError");

    const user = demoUsers.find(
      (item) => item.username === username && item.password === password
    );

    if (!user) {
      error.textContent = "Usuário ou senha incorretos.";
      return;
    }

    // Apenas para demonstração. Não armazene senhas assim em um sistema real.
    localStorage.setItem("frotaAG4Session", JSON.stringify({
      username: user.username,
      name: user.name,
      role: user.role
    }));

    window.location.href = "app.html";
  });
}
