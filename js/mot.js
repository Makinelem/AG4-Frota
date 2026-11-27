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
  const driverDialog = document.querySelector("#driverDialog");
  const driverForm = document.querySelector("#driverForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const driverList = document.querySelector("#driverList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const storageKey = "frotaAG4Drivers";

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

  const navScrollKey = "frotaAG4NavScroll";

if (nav) {
  nav.scrollLeft = Number(sessionStorage.getItem(navScrollKey)) || 0;

  nav.addEventListener("scroll", () => {
    sessionStorage.setItem(navScrollKey, nav.scrollLeft);
  });
}

  function getDrivers() {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  }

  function daysUntil(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const expiry = Date.UTC(year, month - 1, day);
    const today = new Date();
    const todayUTC = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return Math.floor((expiry - todayUTC) / 86400000);
  }

  function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  function renderDrivers() {
  const drivers = getDrivers();

  driverList.innerHTML = drivers.map((driver, index) => {
    const days = daysUntil(driver.licenseExpiry);
    let alert = "";

    if (days < 0) {
      alert = `<span class="license-alert expired">CNH vencida</span>`;
    } else if (days < 90) {
      const message = days === 0
        ? "CNH vence hoje"
        : `CNH vence em ${days} dia${days === 1 ? "" : "s"}`;

      alert = `<span class="license-alert">${message}</span>`;
    }

    return `
      <button class="vehicle-item driver-item" type="button" data-index="${index}">
        <span>
          <span class="vehicle-name">${driver.name}</span><br>
          <span class="driver-birth">${formatDate(driver.birthDate)}</span>
          ${alert}
        </span>
      </button>
    `;
  }).join("");

  emptyMessage.hidden = drivers.length > 0;
}

  const driverDetailsDialog = document.querySelector("#driverDetailsDialog");
const closeDetailsButton = document.querySelector("#closeDetailsButton");

driverList.addEventListener("click", event => {
  const button = event.target.closest(".driver-item");
  if (!button) return;

  const driver = getDrivers()[Number(button.dataset.index)];
  if (!driver) return;

  document.querySelector("#detailName").textContent = driver.name;
  document.querySelector("#detailBirthDate").textContent = formatDate(driver.birthDate);
  document.querySelector("#detailPhone").textContent = driver.phone;
  document.querySelector("#detailLicenseExpiry").textContent =
    formatDate(driver.licenseExpiry);

  driverDetailsDialog.showModal();
});

closeDetailsButton.addEventListener("click", () => {
  driverDetailsDialog.close();
});

  function closeDialog() {
    driverDialog.close();
    driverForm.reset();
    formError.textContent = "";
  }

  openFormButton.addEventListener("click", () => {
    driverForm.reset();
    formError.textContent = "";
    driverDialog.showModal();
  });

  closeFormButton.addEventListener("click", closeDialog);
  cancelFormButton.addEventListener("click", closeDialog);

  driverForm.addEventListener("submit", event => {
    event.preventDefault();

    const driver = {
      name: document.querySelector("#name").value.trim(),
      birthDate: document.querySelector("#birthDate").value,
      phone: document.querySelector("#phone").value.trim(),
      licenseExpiry: document.querySelector("#licenseExpiry").value
    };

    const drivers = getDrivers();
    drivers.push(driver);
    localStorage.setItem(storageKey, JSON.stringify(drivers));

    renderDrivers();
    closeDialog();
  });

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });

  renderDrivers();
}
