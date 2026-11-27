const sessionText = localStorage.getItem("frotaAG4Session");

if (!sessionText) {
  window.location.href = "index.html";
} else {
  const session = JSON.parse(sessionText);

  const tabs = [
    { label: "Início", href: "app.html", icon: "img/ini.svg", roles: ["usuario", "administrador"] },
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
  const currentPage = window.location.pathname.split("/").pop() || "app.html";

  nav.innerHTML = tabs
    .filter((tab) => tab.roles.includes(session.role))
    .map((tab) => `
      <a class="nav-link ${tab.href === currentPage ? "active" : ""}"
         href="${tab.href}">
        <img src="${tab.icon}" alt="" aria-hidden="true">
        <span>${tab.label}</span>
      </a>
    `)
    .join("");

  const navScrollKey = "frotaAG4NavScroll";

if (nav) {
  nav.scrollLeft = Number(sessionStorage.getItem(navScrollKey)) || 0;

  nav.addEventListener("scroll", () => {
    sessionStorage.setItem(navScrollKey, nav.scrollLeft);
  });
}

  const userInfo = document.querySelector("#userInfo");
  const welcomeMessage = document.querySelector("#welcomeMessage");
  const accessNote = document.querySelector("#accessNote");

  if (userInfo) userInfo.textContent = session.name;
  if (welcomeMessage) welcomeMessage.textContent = `Olá, ${session.name}!`;
  if (accessNote) accessNote.textContent = "As abas exibidas dependem do seu nível de acesso.";

  document.querySelector("#logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });
}
