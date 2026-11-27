const session = JSON.parse(
  localStorage.getItem("frotaAG4Session") || "null"
);

if (!session) {
  window.location.href = "index.html";
} else {
  const userInfo = document.querySelector("#userInfo");
  const nav = document.querySelector("#bottomNav");
  const logoutButton = document.querySelector("#logoutButton");
  const openFormButton = document.querySelector("#openFormButton");
  const dialog = document.querySelector("#stockDialog");
  const form = document.querySelector("#stockForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const list = document.querySelector("#stockList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const feedback = document.querySelector("#feedback");

  const stockKey = "frotaAG4Stock";

  if (userInfo) userInfo.textContent = session.name || "";

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

  const currentPage = location.pathname.split("/").pop() || "est.html";

  if (nav) {
    nav.innerHTML = tabs
      .filter(tab => tab.roles.includes(session.role))
      .map(tab => `
        <a class="nav-link ${tab.href === currentPage ? "active" : ""}" href="${tab.href}">
          <img src="${tab.icon}" alt="" aria-hidden="true">
          <span>${tab.label}</span>
        </a>
      `)
      .join("");
  }

  function getStock() {
    try {
      const data = JSON.parse(localStorage.getItem(stockKey) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function formatMoney(value) {
    return (Number(value) || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function renderStock() {
    const items = getStock().sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR")
    );

    list.innerHTML = items.map(item => {
      const quantity = Number(item.quantity) || 0;
      const minimum = Number(item.minimum) || 0;
      const isLow = quantity <= minimum;
      const total = quantity * (Number(item.unitCost) || 0);

      return `
        <article class="vehicle-item">
          <span>
            <span class="vehicle-name">${escapeHTML(item.name)}</span>
            <span class="record-meta">
              Quantidade: ${quantity.toLocaleString("pt-BR")} ${escapeHTML(item.unit)}
            </span>
            <span class="record-meta">
              Mínimo: ${minimum.toLocaleString("pt-BR")} ${escapeHTML(item.unit)}
            </span>
            <span class="record-meta stock-value">
              Custo unitário: R$ ${formatMoney(item.unitCost)} ·
              Valor total: R$ ${formatMoney(total)}
            </span>
            <span class="stock-badge ${isLow ? "stock-low" : "stock-ok"}">
              ${isLow ? "Estoque baixo" : "Disponível"}
            </span>
          </span>
        </article>
      `;
    }).join("");

    emptyMessage.hidden = items.length > 0;
  }

  function closeDialog() {
    dialog.close();
    form.reset();
    formError.textContent = "";
  }

  openFormButton.addEventListener("click", () => {
    form.reset();
    formError.textContent = "";
    document.querySelector("#minimum").value = "0";
    document.querySelector("#unitCost").value = "0";
    dialog.showModal();
  });

  closeFormButton.addEventListener("click", closeDialog);
  cancelFormButton.addEventListener("click", closeDialog);

  form.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";

    const name = document.querySelector("#itemName").value.trim();
    const quantity = Number(document.querySelector("#quantity").value);
    const unit = document.querySelector("#unit").value;
    const minimum = Number(document
