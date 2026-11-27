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
  const vehicleDialog = document.querySelector("#vehicleDialog");
  const vehicleForm = document.querySelector("#vehicleForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const vehicleList = document.querySelector("#vehicleList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const vehicleDetailsDialog = document.querySelector("#vehicleDetailsDialog");
  const closeDetailsButton = document.querySelector("#closeDetailsButton");
  const confirmDeleteDialog = document.querySelector("#confirmDeleteDialog");
  const cancelDeleteButton = document.querySelector("#cancelDeleteButton");
  const confirmDeleteButton = document.querySelector("#confirmDeleteButton");

  const storageKey = "frotaAG4Vehicles";
  let editingIndex = null;

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

    const navScrollKey = "frotaAG4NavScroll";

    requestAnimationFrame(() => {
      nav.scrollLeft = Number(sessionStorage.getItem(navScrollKey)) || 0;
    });

    nav.addEventListener("scroll", () => {
      sessionStorage.setItem(navScrollKey, nav.scrollLeft);
    });
  }

  function getVehicles() {
    try {
      const vehicles = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(vehicles) ? vehicles : [];
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

  function renderVehicles() {
    const vehicles = getVehicles();

    vehicleList.innerHTML = vehicles.map((vehicle, index) => `
      <article class="vehicle-item">
        <button class="vehicle-info" type="button" data-index="${index}">
          <span>
            <span class="vehicle-name">${escapeHTML(vehicle.name)}</span><br>
            <span class="vehicle-plate">${escapeHTML(vehicle.plate)}</span>
          </span>
        </button>

        <div class="action-buttons">
          <button type="button" class="action-button edit-vehicle"
                  data-index="${index}" aria-label="Editar veículo">
            <img src="img/lap.svg" alt="">
          </button>
          <button type="button" class="action-button delete-vehicle"
                  data-index="${index}" aria-label="Excluir veículo">
            <img src="img/lix.svg" alt="">
          </button>
        </div>
      </article>
    `).join("");

    emptyMessage.hidden = vehicles.length > 0;
  }

  function openVehicleForm(vehicle = null, index = null) {
    vehicleForm.reset();
    formError.textContent = "";
    editingIndex = index;

    document.querySelector("#formTitle").textContent =
      vehicle ? "Editar veículo" : "Cadastrar veículo";

    vehicleForm.querySelector('[type="submit"]').textContent =
      vehicle ? "Salvar alterações" : "Salvar veículo";

    if (vehicle) {
      document.querySelector("#name").value = vehicle.name || "";
      document.querySelector("#plate").value = vehicle.plate || "";
      document.querySelector("#model").value = vehicle.model || "";
      document.querySelector("#year").value = vehicle.year || "";
      document.querySelector("#color").value = vehicle.color || "";
    }

    vehicleDialog.showModal();
  }

  function closeFormDialog() {
    vehicleDialog.close();
    vehicleForm.reset();
    formError.textContent = "";
    editingIndex = null;
    document.querySelector("#formTitle").textContent = "Cadastrar veículo";
    vehicleForm.querySelector('[type="submit"]').textContent = "Salvar veículo";
  }

  openFormButton.addEventListener("click", () => openVehicleForm());
  closeFormButton.addEventListener("click", closeFormDialog);
  cancelFormButton.addEventListener("click", closeFormDialog);

  vehicleList.addEventListener("click", event => {
    const detailsButton = event.target.closest(".vehicle-info");
    const editButton = event.target.closest(".edit-vehicle");
    const deleteButton = event.target.closest(".delete-vehicle");

    if (detailsButton) {
      const vehicle = getVehicles()[Number(detailsButton.dataset.index)];
      if (!vehicle) return;

      document.querySelector("#detailName").textContent = vehicle.name || "";
      document.querySelector("#detailPlate").textContent = vehicle.plate || "";
      document.querySelector("#detailModel").textContent = vehicle.model || "";
      document.querySelector("#detailYear").textContent = vehicle.year || "";
      document.querySelector("#detailColor").textContent = vehicle.color || "";

      vehicleDetailsDialog.showModal();
    }

    if (editButton) {
      const index = Number(editButton.dataset.index);
      const vehicle = getVehicles()[index];
      if (vehicle) openVehicleForm(vehicle, index);
    }

    if (deleteButton) {
      confirmDeleteDialog.dataset.deleteIndex = deleteButton.dataset.index;
      confirmDeleteDialog.showModal();
    }
  });

  closeDetailsButton.addEventListener("click", () => {
    vehicleDetailsDialog.close();
  });

  cancelDeleteButton.addEventListener("click", () => {
    confirmDeleteDialog.close();
  });

  confirmDeleteButton.addEventListener("click", () => {
    const index = Number(confirmDeleteDialog.dataset.deleteIndex);
    const vehicles = getVehicles();

    if (vehicles[index]) {
      vehicles.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(vehicles));
      renderVehicles();

      const fuelings = JSON.parse(
        localStorage.getItem("frotaAG4Fuelings") || "[]"
      );
      const vehicleInUse = fuelings.some(
        fueling => String(fueling.vehicleId) === String(index)
      );

      if (vehicleInUse) {
        document.querySelector("#feedback").textContent =
          "Veículo excluído. Confira os abastecimentos associados a ele.";
      } else {
        document.querySelector("#feedback").textContent = "Veículo excluído.";
      }
    }

    confirmDeleteDialog.close();
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("frotaAG4Session");
      window.location.href = "index.html";
    });
  }

  vehicleForm.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";

    const vehicle = {
      name: document.querySelector("#name").value.trim(),
      plate: document.querySelector("#plate").value.trim().toUpperCase(),
      model: document.querySelector("#model").value.trim(),
      year: document.querySelector("#year").value,
      color: document.querySelector("#color").value.trim()
    };

    const vehicles = getVehicles();

    const duplicatePlate = vehicles.some((item, index) =>
      index !== editingIndex && item.plate === vehicle.plate
    );

    if (duplicatePlate) {
      formError.textContent = "Já existe um veículo cadastrado com essa placa.";
      return;
    }

     const wasEditing = editingIndex !== null;

    if (wasEditing) {
      vehicles[editingIndex] = vehicle;
    } else {
      vehicles.push(vehicle);
    }

    localStorage.setItem(storageKey, JSON.stringify(vehicles));
    renderVehicles();
    closeFormDialog();

    document.querySelector("#feedback").textContent =
      wasEditing ? "Veículo atualizado." : "Veículo cadastrado.";
  });

  renderVehicles();
}
