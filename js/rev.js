const session = JSON.parse(localStorage.getItem("frotaAG4Session") || "null");

if (!session) {
  window.location.href = "index.html";
} else {
  const userInfo = document.querySelector("#userInfo");
  const nav = document.querySelector("#bottomNav");
  const logoutButton = document.querySelector("#logoutButton");
  const openFormButton = document.querySelector("#openFormButton");
  const dialog = document.querySelector("#revisionDialog");
  const form = document.querySelector("#revisionForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const vehicleSelect = document.querySelector("#vehiclePlate");
  const list = document.querySelector("#revisionList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");

  const revisionKey = "frotaAG4Revisions";
  const vehicleKey = "frotaAG4Vehicles";
  const fuelingKey = "frotaAG4Fuelings";

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

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function vehicleLabel(vehicle) {
    return `${vehicle.name || "Veículo"} — ${vehicle.plate || "Sem placa"}`;
  }

  function fillVehicles() {
    const vehicles = getList(vehicleKey);
    vehicleSelect.innerHTML = '<option value="">Selecione um veículo</option>';

    vehicles.forEach(vehicle => {
      if (!vehicle.plate) return;
      const option = document.createElement("option");
      option.value = vehicle.plate;
      option.textContent = vehicleLabel(vehicle);
      vehicleSelect.appendChild(option);
    });

    openFormButton.disabled = vehicles.length === 0;
  }

  function currentOdometer(plate) {
    const records = getList(fuelingKey)
      .filter(item => item.vehiclePlate === plate || item.plate === plate);

    return records.reduce((highest, item) =>
      Math.max(highest, Number(item.odometer) || 0), 0);
  }

  function alertFor(plate, revisionOdometer) {
    const current = currentOdometer(plate);
    const distance = current - Number(revisionOdometer);

    if (current === 0) {
      return { text: "Aguardando quilometragem de abastecimento", className: "alert-neutral" };
    }
    if (distance < 6000) {
      return { text: `Dentro do limite — ${Math.max(0, 6000 - distance)} km até a revisão`, className: "alert-green" };
    }
    if (distance <= 8000) {
      return { text: `Revisão no limite/atrasada — ${distance - 6000} km além do limite`, className: "alert-orange" };
    }
    return { text: `Revisão atrasada — ${distance - 6000} km além do limite`,
