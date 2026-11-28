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

  const confirmDeleteDialog = document.querySelector("#confirmDeleteDialog");
  const cancelDeleteButton = document.querySelector("#cancelDeleteButton");
  const confirmDeleteButton = document.querySelector("#confirmDeleteButton");

  let editingIndex = null;

  const fuelingKey = "frotaAG4Fuelings";
  const vehicleKey = "frotaAG4Vehicles";
  const driverKey = "frotaAG4Drivers";

  if (userInfo) userInfo.textContent = session.name || "";

  const tabs = [
    { label: "Início", href: "app.html", icon: "img/ini.svg", roles: ["usuario", "gerente", "administrador"] },
    { label: "Veículos", href: "veic.html", icon: "img/vei.svg", roles: ["usuario", "gerente", "administrador"] },
    { label: "Motoristas", href: "mot.html", icon: "img/mot.svg", roles: ["usuario", "gerente", "administrador"] },
    { label: "Abastecimentos", href: "abast.html", icon: "img/aba.svg", roles: ["usuario", "gerente", "administrador"] },
    { label: "Revisão", href: "rev.html", icon: "img/rev.svg", roles: ["gerente", "administrador"] },
    { label: "Manutenção", href: "manut.html", icon: "img/man.svg", roles: ["gerente", "administrador"] },
    { label: "Estoque", href: "est.html", icon: "img/est.svg", roles: ["gerente", "administrador"] },
    { label: "Financeiro", href: "finan.html", icon: "img/fin.svg", roles: ["gerente", "administrador"] },
    { label: "Relatórios", href: "rel.html", icon: "img/rel.svg", roles: ["gerente", "administrador"] },
    { label: "Usuários", href: "user.html", icon: "img/use.svg", roles: ["administrador"] }
  ];

  const paginaAtual = location.pathname.split("/").pop();

  if (nav) {
    nav.innerHTML = tabs
      .filter(tab => tab.roles.includes(session.role))
      .map(tab => `
        <a class="nav-link ${tab.href === paginaAtual ? "active" : ""}" href="${tab.href}">
          <img src="${tab.icon}" alt="">
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

  function getList(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveList(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
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

  function getName(item) {
    return item?.name || item?.nome || "";
  }

  function fillSelect(select, items, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;

    items.forEach((item, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = getName(item) || `Cadastro ${index + 1}`;
      select.appendChild(option);
    });
  }

  function refreshFormOptions() {
    fillSelect(vehicleSelect, getList(vehicleKey), "Selecione um veículo");
    fillSelect(driverSelect, getList(driverKey), "Selecione um motorista");
  }

  function getVehicleName(index) {
    const vehicle = getList(vehicleKey)[Number(index)];
    if (!vehicle) return "Veículo não encontrado";

    return [vehicle.name, vehicle.plate].filter(Boolean).join(" — ") || "Veículo";
  }

  function getDriverName(index) {
    const driver = getList(driverKey)[Number(index)];
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

  function recalculateAllConsumptions() {
    const records = getList(fuelingKey);

    records.forEach(record => {
      record.consumption = calculateConsumption(record, records);
    });

    saveList(fuelingKey, records);
  }

  function renderFuelings() {
    const records = getList(fuelingKey)
      .map((record, index) => ({ ...record, originalIndex: index }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = records.map(record => {
      const date = record.date
        ? new Date(`${record.date}T00:00:00`).toLocaleDateString("pt-BR")
        : "";

      const liters = Number(record.liters) || 0;
      const odometer = Number(record.odometer) || 0;
      const consumption =
        record.consumption == null ? null : Number(record.consumption);

      return `
        <tr>
          <td>${escapeHTML(date)}</td>
          <td>${escapeHTML(getVehicleName(record.vehicleId))}</td>
          <td>${escapeHTML(getDriverName(record.driverId))}</td>
          <td>${liters.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} L</td>
          <td>${odometer.toLocaleString("pt-BR")} km</td>
          <td>${Number.isFinite(consumption)
            ? `${consumption.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} km/L`
            : "—"}</td>
          <td class="action-buttons">
            <button type="button" class="action-button edit-fueling"
                    data-index="${record.originalIndex}" aria-label="Editar registro">
              <img src="img/lap.svg" alt="">
            </button>
            <button type="button" class="action-button delete-fueling"
                    data-index="${record.originalIndex}" aria-label="Excluir registro">
              <img src="img/lix.svg" alt="">
            </button>
          </td>
        </tr>
      `;
    }).join("");

    emptyMessage.hidden = records.length > 0;
  }

  list.addEventListener("click", event => {
    const editButton = event.target.closest(".edit-fueling");
    const deleteButton = event.target.closest(".delete-fueling");

    if (editButton) {
      editingIndex = Number(editButton.dataset.index);
      const record = getList(fuelingKey)[editingIndex];
      if (!record) return;

      refreshFormOptions();
      vehicleSelect.value = String(record.vehicleId);
      driverSelect.value = String(record.driverId);
      document.querySelector("#date").value = record.date;
      document.querySelector("#liters").value = record.liters;
      document.querySelector("#value").value = record.value;
      document.querySelector("#odometer").value = record.odometer;

      formError.textContent = "";
      dialog.querySelector("h2").textContent = "Editar abastecimento";
      form.querySelector('[type="submit"]').textContent = "Salvar alterações";
      dialog.showModal();
    }

    if (deleteButton) {
      confirmDeleteDialog.dataset.deleteIndex = deleteButton.dataset.index;
      confirmDeleteDialog.showModal();
    }
  });

  cancelDeleteButton.addEventListener("click", () => {
    confirmDeleteDialog.close();
  });

  confirmDeleteButton.addEventListener("click", () => {
    const index = Number(confirmDeleteDialog.dataset.deleteIndex);
    const records = getList(fuelingKey);

    if (records[index]) {
      records.splice(index, 1);
      saveList(fuelingKey, records);
      recalculateAllConsumptions();
      renderFuelings();

      if (feedback) feedback.textContent = "Abastecimento excluído.";
    }

    confirmDeleteDialog.close();
  });

  function closeDialog() {
    dialog.close();
    form.reset();
    formError.textContent = "";
    editingIndex = null;
    dialog.querySelector("h2").textContent = "Registrar abastecimento";
    form.querySelector('[type="submit"]').textContent = "Salvar abastecimento";
  }

  openFormButton.addEventListener("click", () => {
    editingIndex = null;
    dialog.querySelector("h2").textContent = "Registrar abastecimento";
    form.querySelector('[type="submit"]').textContent = "Salvar abastecimento";
    form.reset();
    formError.textContent = "";
    refreshFormOptions();
    dialog.showModal();
  });

  closeFormButton.addEventListener("click", closeDialog);
  cancelFormButton.addEventListener("click", closeDialog);

  form.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";

    const vehicleId = vehicleSelect.value;
    const driverId = driverSelect.value;
    const date = document.querySelector("#date").value;
    const liters = Number(document.querySelector("#liters").value);
    const value = Number(document.querySelector("#value").value);
    const odometer = Number(document.querySelector("#odometer").value);

    if (vehicleId === "" || driverId === "") {
      formError.textContent = "Selecione um veículo e um motorista.";
      return;
    }

    if (!date || liters <= 0 || value < 0 || odometer < 0) {
      formError.textContent = "Confira os dados informados.";
      return;
    }

    const records = getList(fuelingKey);

    const duplicateOdometer = records.some((item, index) =>
      index !== editingIndex &&
      String(item.vehicleId) === String(vehicleId) &&
      Number(item.odometer) === odometer
    );

    if (duplicateOdometer) {
      formError.textContent =
        "Já existe um registro desse veículo com essa quilometragem.";
      return;
    }

    const updatedRecord = {
      ...(editingIndex !== null ? records[editingIndex] : {}),
      vehicleId,
      driverId,
      date,
      liters,
      value,
      odometer
    };

    const wasEditing = editingIndex !== null;

    if (wasEditing) {
      records[editingIndex] = updatedRecord;
    } else {
      records.push(updatedRecord);
    }

    saveList(fuelingKey, records);
    recalculateAllConsumptions();
    renderFuelings();
    closeDialog();

    if (feedback) {
      feedback.textContent = wasEditing
        ? "Abastecimento atualizado."
        : "Abastecimento registrado.";
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("frotaAG4Session");
      window.location.href = "index.html";
    });
  }

  recalculateAllConsumptions();
  refreshFormOptions();
  renderFuelings();
}
