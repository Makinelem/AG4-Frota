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
  const storageKey = "frotaAG4Vehicles";

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

  function getVehicles() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  }

  function renderVehicles() {
    const vehicles = getVehicles();

    vehicleList.innerHTML = vehicles.map((vehicle, index) => `
      <button class="vehicle-item" type="button" data-index="${index}">
        <span>
          <span class="vehicle-name">${vehicle.name}</span><br>
          <span class="vehicle-plate">${vehicle.plate}</span>
        </span>
      </button>
    `).join("");

    emptyMessage.hidden = vehicles.length > 0;
  }

  openFormButton.addEventListener("click", () => {
    vehicleForm.reset();
    formError.textContent = "";
    vehicleDialog.showModal();
  });

  function closeDialog() {
    vehicleDialog.close();
    vehicleForm.reset();
    formError.textContent = "";
  }

  closeFormButton.addEventListener("click", closeDialog);
  cancelFormButton.addEventListener("click", closeDialog);

  vehicleList.addEventListener("click", event => {
    const button = event.target.closest(".vehicle-item");
    if (!button) return;

    const vehicle = getVehicles()[Number(button.dataset.index)];
    if (!vehicle) return;

    document.querySelector("#detailName").textContent = vehicle.name;
    document.querySelector("#detailPlate").textContent = vehicle.plate;
    document.querySelector("#detailModel").textContent = vehicle.model;
    document.querySelector("#detailYear").textContent = vehicle.year;
    document.querySelector("#detailColor").textContent = vehicle.color;

    vehicleDetailsDialog.showModal();
  });

  closeDetailsButton.addEventListener("click", () => {
    vehicleDetailsDialog.close();
  });

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });

  vehicleForm.addEventListener("submit", event => {
    event.preventDefault();

    const vehicle = {
      name: document.querySelector("#name").value.trim(),
      plate: document.querySelector("#plate").value.trim().toUpperCase(),
      model: document.querySelector("#model").value.trim(),
      year: document.querySelector("#year").value,
      color: document.querySelector("#color").value.trim()
    };

    const vehicles = getVehicles();

    if (vehicles.some(item => item.plate === vehicle.plate)) {
      formError.textContent = "Já existe um veículo cadastrado com essa placa.";
      return;
    }

    vehicles.push(vehicle);
    localStorage.setItem(storageKey, JSON.stringify(vehicles));

    renderVehicles();
    closeDialog();
  });

  renderVehicles();
}
