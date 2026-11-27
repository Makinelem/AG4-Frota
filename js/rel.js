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

  const currentPage = location.pathname.split("/").pop() || "rel.html";

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

  function readArray(keys) {
    for (const key of keys) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        if (Array.isArray(value)) return value;
      } catch {
        // Tenta a próxima chave.
      }
    }
    return [];
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

  function valueFrom(record, fields) {
    for (const field of fields) {
      if (record[field] !== undefined && record[field] !== null && record[field] !== "") {
        return record[field];
      }
    }
    return "";
  }

  function amountFrom(record, fields) {
    const value = valueFrom(record, fields);
    if (typeof value === "number") return value;

    const normalized = String(value)
      .replace(/[R$\s]/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".");

    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }

  function formatMoney(value) {
    return (Number(value) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function getDate(record) {
    return valueFrom(record, ["date", "data", "dateAt", "createdAt"]);
  }

  function formatDate(value) {
    if (!value) return "Data não informada";
    const text = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const [year, month, day] = text.split("-");
      return `${day}/${month}/${year}`;
    }

    const date = new Date(text);
    return Number.isNaN(date.getTime())
      ? escapeHTML(text)
      : date.toLocaleDateString("pt-BR");
  }

  function vehicleText(record) {
    return valueFrom(record, [
      "vehiclePlate", "plate", "placa", "vehicle", "vehicleName"
    ]) || "Veículo não informado";
  }

  function renderRecords(containerId, emptyId, records, makeContent) {
    const container = document.querySelector(`#${containerId}`);
    const empty = document.querySelector(`#${emptyId}`);

    if (!container || !empty) return;

    const recent = [...records]
      .sort((a, b) => String(getDate(b)).localeCompare(String(getDate(a))))
      .slice(0, 5);

    container.innerHTML = recent.map(record =>
      `<article class="report-item">${makeContent(record)}</article>`
    ).join("");

    empty.hidden = records.length > 0;
  }

  const fuelings = readArray([
    "frotaAG4Fuelings",
    "frotaAG4Fuel",
    "frotaAG4Abastecimentos"
  ]);

  const revisions = readArray([
    "frotaAG4Revisions",
    "frotaAG4Revisions",
    "frotaAG4Revisoes"
  ]);

  const maintenances = readArray([
    "frotaAG4Maintenances",
    "frotaAG4Maintenance",
    "frotaAG4Manutencoes"
  ]);

  const financeEntries = readArray([
    "frotaAG4Finance",
    "frotaAG4Finances",
    "frotaAG4Lancamentos"
  ]);

  const expenses = financeEntries.filter(entry => {
    const type = String(valueFrom(entry, ["type", "tipo"])).toLowerCase();
    return type === "despesa" || type === "expense";
  });

  const fuelingTotal = fuelings.reduce((total, item) =>
    total + amountFrom(item, ["cost", "amount", "valor", "total"]), 0
  );

  const maintenanceTotal = maintenances.reduce((total, item) =>
    total + amountFrom(item, ["cost", "amount", "valor", "total"]), 0
  );

  const expenseTotal = expenses.reduce((total, item) =>
    total + amountFrom(item, ["amount", "cost", "valor", "total"]), 0
  );

  document.querySelector("#fuelingCount").textContent = fuelings.length;
  document.querySelector("#fuelingTotal").textContent =
    `Total: ${formatMoney(fuelingTotal)}`;

  document.querySelector("#revisionCount").textContent = revisions.length;
  document.querySelector("#revisionLatest").textContent = revisions.length
    ? `Última revisão: ${formatDate(getDate(
        [...revisions].sort((a, b) =>
          String(getDate(b)).localeCompare(String(getDate(a)))
        )[0]
      ))}`
    : "Nenhuma revisão registrada";

  document.querySelector("#maintenanceCount").textContent = maintenances.length;
  document.querySelector("#maintenanceTotal").textContent =
    `Custo: ${formatMoney(maintenanceTotal)}`;

  document.querySelector("#expenseCount").textContent = expenses.length;
  document.querySelector("#expenseTotal").textContent =
    `Total: ${formatMoney(expenseTotal)}`;

  renderRecords("fuelingList", "fuelingEmpty", fuelings, record => `
    <strong>${escapeHTML(vehicleText(record))}</strong>
    <span>${escapeHTML(formatDate(getDate(record)))}</span>
    <span>${escapeHTML(valueFrom(record, ["fuel", "fuelType", "combustivel", "tipoCombustivel"]) || "Abastecimento")}</span>
    <span>Valor: ${formatMoney(amountFrom(record, ["cost", "amount", "valor", "total"]))}</span>
  `);

  renderRecords("revisionList", "revisionEmpty", revisions, record => `
    <strong>${escapeHTML(vehicleText(record))}</strong>
    <span>${escapeHTML(formatDate(getDate(record)))}</span>
    <span>${escapeHTML(valueFrom(record, ["description", "service", "tipo", "type"]) || "Revisão")}</span>
    <span>${escapeHTML(valueFrom(record, ["status", "situacao"]) || "")}</span>
  `);

  renderRecords("maintenanceList", "maintenanceEmpty", maintenances, record => `
    <strong>${escapeHTML(vehicleText(record))}</strong>
    <span>${escapeHTML(formatDate(getDate(record)))}</span>
    <span>${escapeHTML(valueFrom(record, ["service", "description", "servico"]) || "Manutenção")}</span>
    <span>Custo: ${formatMoney(amountFrom(record, ["cost", "amount", "valor", "total"]))}</span>
  `);

  renderRecords("expenseList", "expenseEmpty", expenses, record => `
    <strong>${escapeHTML(valueFrom(record, ["description", "descricao", "name"]) || "Despesa")}</strong>
    <span>${escapeHTML(formatDate(getDate(record)))}</span>
    <span>${escapeHTML(valueFrom(record, ["category", "categoria"]) || "")}</span>
    <span>Valor: ${formatMoney(amountFrom(record, ["amount", "cost", "valor", "total"]))}</span>
  `);

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });
}
