const session = JSON.parse(localStorage.getItem("frotaAG4Session") || "null");

if (!session) {
  window.location.href = "index.html";
} else {
  const userInfo = document.querySelector("#userInfo");
  const nav = document.querySelector("#bottomNav");
  const logoutButton = document.querySelector("#logoutButton");
  const openFormButton = document.querySelector("#openFormButton");
  const dialog = document.querySelector("#fuelingDialog");
  const form = document.querySelector("#fuelingForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const list = document.querySelector("#fuelingList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const feedback = document.querySelector("#feedback");
  const vehicleSelect = document.querySelector("#vehicleId");
  const driverSelect = document.querySelector("#driverId");

  const fuelingKey = "frotaAG4Fuelings";
  const vehicleKey = "frotaAG4Vehicles";
  const driverKey = "frotaAG4Drivers";

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

  const currentPage = location.pathname.split("/").pop();

  nav.innerHTML = tabs
    .filter(tab => tab.roles.includes(session.role))
    .map(tab => `
      <a class="nav-link ${tab.href === currentPage ? "active" : ""}" href="${tab.href}">
        <img src="${tab.icon}" alt="">
        <span>${tab.label}</span>
      </a>
    `)
    .join("");

  function getList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function getName(item) {
    return item?.name || item?.nome || "";
  }

  function fillSelect(select, items, placeholder, selectedId = "") {
    select.innerHTML = `<option value="">${placeholder}</option>`;

    items.forEach((item, index) => {
      const id = item.id ?? index;
      const option = document.createElement("option");
      option.value = String(id);
      option.textContent = getName(item) || `Cadastro ${index + 1}`;
      if (String(id) === String(selectedId)) option.selected = true;
      select.appendChild(option);
    });
  }

  function getVehicleName(id) {
    const vehicles = getList(vehicleKey);
    const vehicle = vehicles.find((item, index) =>
      String(item.id ?? index) === String(id)
    );
    return getName(vehicle) || "Veículo não encontrado";
  }

  function getDriverName(id) {
    const drivers = getList(driverKey);
    const driver = drivers.find((item, index) =>
      String(item.id ?? index) === String(id)
    );
    return getName(driver) || "Motorista não encontrado";
  }

  function calculateConsumption(record, records) {
    const previous = records
      .filter(item =>
        String(item.vehicleId) === String(record.vehicleId) &&
        Number(item.odometer) < Number(record.odometer)
      )
      .sort((a, b) => Number(b.odometer) - Number(a.odometer))[0];

    if (!previous) return null;

    const distance = Number(record.odometer) - Number(previous.odometer);
    const liters = Number(record.liters);

    return distance > 0 && liters > 0 ? distance / liters : null;
  }

  function renderFuelings() {
    const records = getList(fuelingKey)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = records.map(record => {
      const consumption = calculateConsumption(record, records);
      const date = record.date
        ? new Date(`${record.date}T00:00:00`).toLocaleDateString("pt-BR")
        : "";

      return `
        <article class="vehicle-item">
          <span>
            <span class="vehicle-name">${escapeHTML(getVehicleName(record.vehicleId))}</span>
            <span class="record-meta">
              ${escapeHTML(date)} · ${escapeHTML(getDriverName(record.driverId))}
            </span>
            <span class="record-meta">
              ${Number(record.liters).
