let session;

try {
  session = JSON.parse(localStorage.getItem("frotaAG4Session") || "null");
} catch {
  session = null;
}

if (!session) {
  window.location.href = "index.html";
} else {
  const userInfo = document.querySelector("#userInfo");
  const nav = document.querySelector("#bottomNav");
  const logoutButton = document.querySelector("#logoutButton");
  const openFormButton = document.querySelector("#openFormButton");
  const dialog = document.querySelector("#financeDialog");
  const form = document.querySelector("#financeForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const list = document.querySelector("#financeList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const feedback = document.querySelector("#feedback");

  const financeKey = "frotaAG4Finance";

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

  const currentPage = location.pathname.split("/").pop() || "finan.html";

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

  const navScrollKey = "frotaAG4NavScroll";

if (nav) {
  nav.scrollLeft = Number(sessionStorage.getItem(navScrollKey)) || 0;

  nav.addEventListener("scroll", () => {
    sessionStorage.setItem(navScrollKey, nav.scrollLeft);
  });
}

  function getEntries() {
    try {
      const data = JSON.parse(localStorage.getItem(financeKey) || "[]");
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

  function money(value) {
    return (Number(value) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatDate(value) {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  function renderEntries() {
    const entries = getEntries().sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || ""))
    );

    let income = 0;
    let expense = 0;

    entries.forEach(entry => {
      const amount = Number(entry.amount) || 0;
      if (entry.type === "Receita") income += amount;
      else expense += amount;
    });

    document.querySelector("#incomeTotal").textContent = money(income);
    document.querySelector("#expenseTotal").textContent = money(expense);
    document.querySelector("#balanceTotal").textContent = money(income - expense);

    list.innerHTML = entries.map(entry => {
      const isIncome = entry.type === "Receita";

      return `
        <article class="vehicle-item">
          <span>
            <span class="vehicle-name">${escapeHTML(entry.description)}</span>
            <span class="record-meta">
              ${escapeHTML(formatDate(entry.date))}
              ${entry.category ? ` · ${escapeHTML(entry.category)}` : ""}
            </span>
            <span class="record-meta">${money(entry.amount)}</span>
            <span class="finance-type ${isIncome ? "finance-income" : "finance-expense"}">
              ${isIncome ? "Receita" : "Despesa"}
            </span>
          </span>
        </article>
      `;
    }).join("");

    emptyMessage.hidden = entries.length > 0;
  }

  function closeDialog() {
    dialog.close();
    form.reset();
    formError.textContent = "";
  }

  openFormButton.addEventListener("click", () => {
    form.reset();
    formError.textContent = "";
    dialog.showModal();
  });

  closeFormButton.addEventListener("click", closeDialog);
  cancelFormButton.addEventListener("click", closeDialog);

  form.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";

    const type = document.querySelector("#type").value;
    const date = document.querySelector("#date").value;
    const description = document.querySelector("#description").value.trim();
    const category = document.querySelector("#category").value.trim();
    const amount = Number(document.querySelector("#amount").value);

    if (!date || !description) {
      formError.textContent = "Preencha a data e a descrição.";
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      formError.textContent = "Informe um valor maior que zero.";
      return;
    }

    const entries = getEntries();
    entries.push({ type, date, description, category, amount });

    try {
      localStorage.setItem(financeKey, JSON.stringify(entries));
    } catch {
      formError.textContent = "Não foi possível salvar o lançamento neste navegador.";
      return;
    }

    renderEntries();
    closeDialog();

    if (feedback) feedback.textContent = "Lançamento salvo.";
  });

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });

  renderEntries();
}
