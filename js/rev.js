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
  const dialog = document.querySelector("#revisionDialog");
  const form = document.querySelector("#revisionForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const vehicleSelect = document.querySelector("#vehiclePlate");
  const list = document.querySelector("#revisionList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const feedback = document.querySelector("#feedback");

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

  const currentPage = location.pathname.split("/").pop() || "rev.html";

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
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  function getVehicleByPlate(plate) {
    return getList(vehicleKey).find(vehicle => vehicle.plate === plate);
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

    openFormButton.disabled = !vehicles.some(vehicle => vehicle.plate);
  }

  function currentOdometer(plate) {
    const vehicles = getList(vehicleKey);
    const vehicleIndex = vehicles.findIndex(vehicle => vehicle.plate === plate);

    return getList(fuelingKey)
      .filter(item =>
        item.vehiclePlate === plate ||
        item.plate === plate ||
        (vehicleIndex >= 0 && String(item.vehicleId) === String(vehicleIndex))
      )
      .reduce((highest, item) =>
        Math.max(highest, Number(item.odometer) || 0), 0);
  }

  function alertFor(plate, revisionOdometer) {
    const current = currentOdometer(plate);

    if (current === 0) {
      return {
        text: "Aguardando quilometragem de abastecimento",
        className: "alert-neutral"
      };
    }

    const distance = Math.max(0, current - Number(revisionOdometer));

    if (distance < 6000) {
      return {
        text: `Dentro do limite — ${6000 - distance} km até a revisão`,
        className: "alert-green"
      };
    }

    if (distance <= 8000) {
      return {
        text: `Revisão no limite/atrasada — ${distance - 6000} km além do limite`,
        className: "alert-orange"
      };
    }

    return {
      text: `Revisão atrasada — ${distance - 6000} km além do limite`,
      className: "alert-red"
    };
  }

  function renderRevisions() {
    const revisions = getList(revisionKey)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = revisions.map(revision => {
      const vehicle = getVehicleByPlate(revision.vehiclePlate);
      const vehicleName = vehicle
        ? vehicleLabel(vehicle)
        : `Veículo — ${revision.vehiclePlate || "não encontrado"}`;
      const alert = alertFor(revision.vehiclePlate, revision.odometer);

      return `
        <article class="vehicle-item">
          <span>
            <span class="vehicle-name">${escapeHTML(vehicleName)}</span>
            <span class="record-meta">${escapeHTML(formatDate(revision.date))}</span>
            <span class="record-meta">
              ${Number(revision.odometer || 0).toLocaleString("pt-BR")} km na revisão
            </span>
            <span class="record-meta">${escapeHTML(revision.service)}</span>
            ${revision.itemsApplied
              ? `<span class="record-meta">Itens aplicados: ${escapeHTML(revision.itemsApplied)}</span>`
              : ""}
            <span class="revision-alert ${alert.className}">${escapeHTML(alert.text)}</span>
          </span>
        </article>
      `;
    }).join("");

    emptyMessage.hidden = revisions.length > 0;
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

    const vehiclePlate = vehicleSelect.value;
    const date = document.querySelector("#date").value;
    const odometer = Number(document.querySelector("#odometer").value);
    const service = document.querySelector("#service").value.trim();
    const itemsApplied = document.querySelector("#itemsApplied").value.trim();

    if (!vehiclePlate || !date || !service || !Number.isFinite(odometer) || odometer < 0) {
      formError.textContent = "Confira os dados informados.";
      return;
    }

    const revisions = getList(revisionKey);
    revisions.push({ vehiclePlate, date, odometer, service, itemsApplied });

    localStorage.setItem(revisionKey, JSON.stringify(revisions));
    renderRevisions();
    closeDialog();

    if (feedback) feedback.textContent = "Revisão registrada.";
  });

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });

  fillVehicles();
  renderRevisions();
}
