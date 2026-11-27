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
  const dialog = document.querySelector("#maintenanceDialog");
  const form = document.querySelector("#maintenanceForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const vehicleSelect = document.querySelector("#vehicleId");
  const list = document.querySelector("#maintenanceList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const feedback = document.querySelector("#feedback");

  const maintenanceKey = "frotaAG4Maintenances";
  const vehicleKey = "frotaAG4Vehicles";

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

  const currentPage = location.pathname.split("/").pop() || "manut.html";

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

  function getList(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
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

  function getVehicleName(vehicle) {
    const name = vehicle.name || vehicle.nome || "Veículo";
    const plate = vehicle.plate || vehicle.placa || "";
    return plate ? `${name} — ${plate}` : name;
  }

  function fillVehicles() {
    const vehicles = getList(vehicleKey);
    vehicleSelect.innerHTML =
      '<option value="">Selecione um veículo</option>';

    vehicles.forEach((vehicle, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = getVehicleName(vehicle);
      vehicleSelect.appendChild(option);
    });

    openFormButton.disabled = vehicles.length === 0;
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  function renderList() {
    const vehicles = getList(vehicleKey);
    const records = getList(maintenanceKey)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = records.map(record => {
      const vehicle = vehicles[Number(record.vehicleId)];
      const name = vehicle
        ? getVehicleName(vehicle)
        : "Veículo não encontrado";
      const status = record.status || "Concluída";
      const isPending = status === "Pendente";
      const cost = Number(record.cost) || 0;

      return `
        <article class="vehicle-item">
          <span>
            <span class="vehicle-name">${escapeHTML(name)}</span>
            <span class="record-meta">
              ${escapeHTML(formatDate(record.date))} ·
              ${Number(record.odometer || 0).toLocaleString("pt-BR")} km
            </span>
            <span class="record-meta">${escapeHTML(record.service)}</span>
            <span class="record-meta maintenance-cost">
              Custo: R$ ${cost.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            <span class="maintenance-status ${isPending ? "status-pending" : "status-done"}">
              ${escapeHTML(status)}
            </span>
          </span>
        </article>
      `;
    }).join("");

    emptyMessage.hidden = records.length > 0;
  }

  function closeDialog() {
    dialog.close();
    form.reset();
    formError.textContent = "";
  }

  openFormButton.addEventListener("click", () => {
    form.reset();
    formError.textContent = "";
    fillVehicles();
    dialog.showModal();
  });

  closeFormButton.addEventListener("click", closeDialog);
  cancelFormButton.addEventListener("click", closeDialog);

  form.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";

    const vehicleId = vehicleSelect.value;
    const date = document.querySelector("#date").value;
    const odometer = Number(document.querySelector("#odometer").value);
    const service = document.querySelector("#service").value.trim();
    const cost = Number(document.querySelector("#cost").value);
    const status = document.querySelector("#status").value;

    if (vehicleId === "" || !date || !service) {
      formError.textContent = "Preencha todos os campos obrigatórios.";
      return;
    }

    if (
      !Number.isFinite(odometer) ||
      odometer < 0 ||
      !Number.isFinite(cost) ||
      cost < 0
    ) {
      formError.textContent = "Confira a quilometragem e o custo informados.";
      return;
    }

    const records = getList(maintenanceKey);

    records.push({
      vehicleId,
      date,
      odometer,
      service,
      cost,
      status
    });

    localStorage.setItem(maintenanceKey, JSON.stringify(records));

    renderList();
    closeDialog();

    if (feedback) {
      feedback.textContent = "Manutenção registrada.";
    }
  });

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });

  fillVehicles();
  renderList();
}
