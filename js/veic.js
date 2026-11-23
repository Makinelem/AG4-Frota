const session = JSON.parse(localStorage.getItem("frotaAG4Session") || "null");

if (!session) {
  window.location.href = "index.html";
} else {
  const userInfo = document.querySelector("#userInfo");
  if (userInfo) userInfo.textContent = session.name;
  const tabs = [
    { label: "Início", href: "app.html", icon: "img/ini.svg", roles: ["usuario", "gerente", "administrador"] },
    { label: "Veículos", href: "veic.html", icon: "img/vei.svg", roles: ["usuario", "gerente", "administrador"] },
    { label: "Motoristas", href: "mot.html", icon: "img/mot.svg", roles: ["usuario", "gerente", "administrador"] },
    { label: "Abastecimentos", href: "abast.html", icon: "img/aba.svg", roles: ["gerente", "administrador"] },
    { label: "Revisão", href: "rev.html", icon: "img/rev.svg", roles: ["gerente", "administrador"] },
    { label: "Manutenção", href: "manut.html", icon: "img/man.svg", roles: ["gerente", "administrador"] },
    { label: "Estoque", href: "est.html", icon: "img/est.svg", roles: ["gerente", "administrador"] },
    { label: "Financeiro", href: "finan.html", icon: "img/fin.svg", roles: ["gerente", "administrador"] },
    { label: "Relatórios", href: "rel.html", icon: "img/rel.svg", roles: ["gerente", "administrador"] },
    { label: "Usuários", href: "user.html", icon: "img/use.svg", roles: ["administrador"] }
  ];

  const nav = document.querySelector("#bottomNav");
  const paginaAtual = location.pathname.split("/").pop();

  nav.innerHTML = tabs
    .filter(tab => tab.roles.includes(session.role))
    .map(tab => `
      <a class="nav-link ${tab.href === paginaAtual ? "active" : ""}" href="${tab.href}">
        <img src="${tab.icon}" alt="">
        <span>${tab.label}</span>
      </a>
    `).join("");

  document.querySelector("#userInfo").textContent =
    `${session.name} · ${session.role}`;

  document.querySelector("#logoutButton").addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    location.href = "index.html";
  });
}
