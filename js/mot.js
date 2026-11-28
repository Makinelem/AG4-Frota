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
  const driverDetailsDialog = document.querySelector("#driverDetailsDialog");
  const closeDetailsButton = document.querySelector("#closeDetailsButton");
  const confirmDeleteDialog = document.querySelector("#confirmDeleteDialog");
  const cancelDeleteButton = document.querySelector("#cancelDeleteButton");
  const confirmDeleteButton = document.querySelector("#confirmDeleteButton");
  const birthdayDialog = document.querySelector("#birthdayDialog");
  const birthdayList = document.querySelector("#birthdayList");
  const closeBirthdayButton = document.querySelector("#closeBirthdayButton");
  const acknowledgeBirthdayButton =
  document.querySelector("#acknowledgeBirthdayButton");

  const storageKey = "frotaAG4Drivers";
  let editingIndex = null;

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

  const currentPage = location.pathname.split("/").pop();

  if (nav) {
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

    requestAnimationFrame(() => {
      nav.scrollLeft = Number(sessionStorage.getItem(navScrollKey)) || 0;
    });

    nav.addEventListener("scroll", () => {
      sessionStorage.setItem(navScrollKey, nav.scrollLeft);
    });
  }

  function getDrivers() {
    try {
      const drivers = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(drivers) ? drivers : [];
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

  function daysUntil(dateString) {
    if (!dateString) return null;

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
    if (!dateString) return "—";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  function renderDrivers() {
  const drivers = getDrivers();

  driverList.innerHTML = drivers.map((driver, index) => {
    const days = daysUntil(driver.licenseExpiry);
    let alert = "";

    if (days !== null && days >= 0 && days < 90) {
      alert = `<span class="license-alert">${days} dias restantes</span>`;
    } else if (days !== null && days < 0) {
      alert = `<span class="license-alert expired">CNH vencida</span>`;
    }

    return `
      <article class="vehicle-item driver-card">
        <button class="driver-info" type="button" data-index="${index}">
          ${escapeHTML(driver.name)}
        </button>

        <div class="driver-alert-space">${alert}</div>

        <div class="action-buttons">
          <button type="button" class="action-button edit-driver"
                  data-index="${index}" aria-label="Editar motorista">
            <img src="img/lap.svg" alt="">
          </button>
          <button type="button" class="action-button delete-driver"
                  data-index="${index}" aria-label="Excluir motorista">
            <img src="img/lix.svg" alt="">
          </button>
        </div>
      </article>
    `;
  }).join("");

  emptyMessage.hidden = drivers.length > 0;
}

  function openDriverForm(driver = null, index = null) {
    driverForm.reset();
    formError.textContent = "";
    editingIndex = index;

    driverForm.querySelector("h2").textContent =
      driver ? "Editar motorista" : "Cadastrar motorista";

    driverForm.querySelector('[type="submit"]').textContent =
      driver ? "Salvar alterações" : "Salvar motorista";

    if (driver) {
      document.querySelector("#name").value = driver.name || "";
      document.querySelector("#birthDate").value = driver.birthDate || "";
      document.querySelector("#phone").value = driver.phone || "";
      document.querySelector("#licenseExpiry").value =
        driver.licenseExpiry || "";
    }

    driverDialog.showModal();
  }

  function closeDriverForm() {
    driverDialog.close();
    driverForm.reset();
    formError.textContent = "";
    editingIndex = null;
    driverForm.querySelector("h2").textContent = "Cadastrar motorista";
    driverForm.querySelector('[type="submit"]').textContent =
      "Salvar motorista";
  }

  openFormButton.addEventListener("click", () => openDriverForm());
  closeFormButton.addEventListener("click", closeDriverForm);
  cancelFormButton.addEventListener("click", closeDriverForm);

  driverList.addEventListener("click", event => {
    const detailsButton = event.target.closest(".driver-info");
    const editButton = event.target.closest(".edit-driver");
    const deleteButton = event.target.closest(".delete-driver");

    if (detailsButton) {
      const driver = getDrivers()[Number(detailsButton.dataset.index)];
      if (!driver) return;

      document.querySelector("#detailName").textContent = driver.name || "";
      document.querySelector("#detailBirthDate").textContent =
        formatDate(driver.birthDate);
      document.querySelector("#detailPhone").textContent = driver.phone || "";
      document.querySelector("#detailLicenseExpiry").textContent =
        formatDate(driver.licenseExpiry);

      driverDetailsDialog.showModal();
    }

    if (editButton) {
      const index = Number(editButton.dataset.index);
      const driver = getDrivers()[index];
      if (driver) openDriverForm(driver, index);
    }

    if (deleteButton) {
      confirmDeleteDialog.dataset.deleteIndex = deleteButton.dataset.index;
      confirmDeleteDialog.showModal();
    }
  });

  closeDetailsButton.addEventListener("click", () => {
    driverDetailsDialog.close();
  });

  cancelDeleteButton.addEventListener("click", () => {
    confirmDeleteDialog.close();
  });

  confirmDeleteButton.addEventListener("click", () => {
    const index = Number(confirmDeleteDialog.dataset.deleteIndex);
    const drivers = getDrivers();

    if (drivers[index]) {
      drivers.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(drivers));
      renderDrivers();
      document.querySelector("#feedback").textContent =
        "Motorista excluído.";
    }

    confirmDeleteDialog.close();
  });

  driverForm.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";

    const driver = {
      name: document.querySelector("#name").value.trim(),
      birthDate: document.querySelector("#birthDate").value,
      phone: document.querySelector("#phone").value.trim(),
      licenseExpiry: document.querySelector("#licenseExpiry").value
    };

    const drivers = getDrivers();
    const wasEditing = editingIndex !== null;

    if (wasEditing) {
      drivers[editingIndex] = driver;
    } else {
      drivers.push(driver);
    }

    localStorage.setItem(storageKey, JSON.stringify(drivers));
    renderDrivers();
    closeDriverForm();

    document.querySelector("#feedback").textContent =
      wasEditing ? "Motorista atualizado." : "Motorista cadastrado.";
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("frotaAG4Session");
      window.location.href = "index.html";
    });
  }
  function todayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBirthdayDrivers() {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  return getDrivers().filter(driver => {
    if (!driver.birthDate) return false;

    const [, month, day] = driver.birthDate.split("-").map(Number);
    return month === todayMonth && day === todayDay;
  });
}

function showBirthdayReminder() {
  const birthdayDrivers = getBirthdayDrivers();
  if (birthdayDrivers.length === 0) return;

  const key = `frotaAG4BirthdayOk_${todayKey()}`;
  const acknowledged = JSON.parse(localStorage.getItem(key) || "[]");
  const pendingDrivers = birthdayDrivers.filter(
    (driver, index) => !acknowledged.includes(driver.name + index)
  );

  if (pendingDrivers.length === 0) return;

  birthdayList.innerHTML = pendingDrivers.map(driver =>
    `<p>Hoje é aniversário de <strong>${escapeHTML(driver.name)}</strong>! 🎉</p>`
  ).join("");

  birthdayDialog.showModal();
}

closeBirthdayButton.addEventListener("click", () => {
  birthdayDialog.close();
});

acknowledgeBirthdayButton.addEventListener("click", () => {
  const key = `frotaAG4BirthdayOk_${todayKey()}`;
  const birthdayDrivers = getBirthdayDrivers();
  const acknowledged = birthdayDrivers.map(
    (driver, index) => driver.name + index
  );

  localStorage.setItem(key, JSON.stringify(acknowledged));
  birthdayDialog.close();
});

  renderDrivers();
  showBirthdayReminder();
}

