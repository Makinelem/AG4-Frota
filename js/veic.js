const session = JSON.parse(
  localStorage.getItem("frotaAG4Session") || "null"
);

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

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });

  const openFormButton = document.querySelector("#openFormButton");
  const vehicleDialog = document.querySelector("#vehicleDialog");
  const vehicleForm = document.querySelector("#vehicleForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const vehicleList = document.querySelector("#vehicleList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const storageKey = "frotaAG4Vehicles";

  function getVehicles() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  }

  function renderVehicles() {
    const vehicles = getVehicles();

    vehicleList.innerHTML = vehicles.map(vehicle => `
      <article class="vehicle-item">
        <div>
          <div class="vehicle-name">${vehicle.name}</div>
          <div class="vehicle-plate">${vehicle.plate} · ${vehicle.model}</div>
          <div>${vehicle.year} · ${vehicle.color}</div>
        </div>
      </article>
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
