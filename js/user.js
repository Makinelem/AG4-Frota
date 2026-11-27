let session;

try {
  session = JSON.parse(localStorage.getItem("frotaAG4Session") || "null");
} catch {
  session = null;
}

if (!session || session.role !== "administrador") {
  window.location.href = "app.html";
} else {
  const userInfo = document.querySelector("#userInfo");
  const nav = document.querySelector("#bottomNav");
  const logoutButton = document.querySelector("#logoutButton");
  const openFormButton = document.querySelector("#openFormButton");
  const dialog = document.querySelector("#userDialog");
  const form = document.querySelector("#userForm");
  const closeFormButton = document.querySelector("#closeFormButton");
  const cancelFormButton = document.querySelector("#cancelFormButton");
  const userList = document.querySelector("#userList");
  const emptyMessage = document.querySelector("#emptyMessage");
  const formError = document.querySelector("#formError");
  const feedback = document.querySelector("#feedback");

  const usersKey = "frotaAG4Users";

  if (userInfo) userInfo.textContent = session.name || "";

  const tabs = [
    { label: "Início", href: "app.html", icon: "img/ini.svg" },
    { label: "Veículos", href: "veic.html", icon: "img/vei.svg" },
    { label: "Motoristas", href: "mot.html", icon: "img/mot.svg" },
    { label: "Abastecimentos", href: "abast.html", icon: "img/aba.svg" },
    { label: "Revisão", href: "rev.html", icon: "img/rev.svg" },
    { label: "Manutenção", href: "manut.html", icon: "img/man.svg" },
    { label: "Estoque", href: "est.html", icon: "img/est.svg" },
    { label: "Financeiro", href: "finan.html", icon: "img/fin.svg" },
    { label: "Relatórios", href: "rel.html", icon: "img/rel.svg" },
    { label: "Usuários", href: "user.html", icon: "img/use.svg" }
  ];

  const currentPage = location.pathname.split("/").pop() || "user.html";

  if (nav) {
    nav.innerHTML = tabs.map(tab => `
      <a class="nav-link ${tab.href === currentPage ? "active" : ""}" href="${tab.href}">
        <img src="${tab.icon}" alt="" aria-hidden="true">
        <span>${tab.label}</span>
      </a>
    `).join("");
  }

  const navScrollKey = "frotaAG4NavScroll";

if (nav) {
  nav.scrollLeft = Number(sessionStorage.getItem(navScrollKey)) || 0;

  nav.addEventListener("scroll", () => {
    sessionStorage.setItem(navScrollKey, nav.scrollLeft);
  });
}

  function getUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(usersKey) || "[]");
      return Array.isArray(users) ? users : [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(usersKey, JSON.stringify(users));
      return true;
    } catch {
      return false;
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

  function roleLabel(role) {
    const labels = {
      usuario: "Usuário",
      gerente: "Gerente",
      administrador: "Administrador"
    };

    return labels[role] || "Usuário";
  }

  function renderUsers() {
    const users = getUsers();

    userList.innerHTML = users.map((user, index) => `
      <article class="user-card">
        <div>
          <strong>${escapeHTML(user.name || user.nome || "Sem nome")}</strong>
          <span class="user-meta">${escapeHTML(user.email || "")}</span>
          <span class="user-role">
            ${escapeHTML(roleLabel(user.role || user.perfil))}
          </span>
        </div>
        <button class="delete-user-button" type="button" data-index="${index}">
          Excluir
        </button>
      </article>
    `).join("");

    emptyMessage.hidden = users.length > 0;
  }

  function closeDialog() {
    dialog.close();
    form.reset();
    formError.textContent = "";
  }

  openFormButton.addEventListener("click", () => {
    form.reset();
    formError.textContent = "";
    dialog.showModal();
  });

  closeFormButton.addEventListener("click", closeDialog);
  cancelFormButton.addEventListener("click", closeDialog);

  form.addEventListener("submit", event => {
    event.preventDefault();
    formError.textContent = "";

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim().toLowerCase();
    const password = document.querySelector("#password").value;
    const role = document.querySelector("#role").value;

    if (!name || !email || !password) {
      formError.textContent = "Preencha todos os campos.";
      return;
    }

    if (password.length < 6) {
      formError.textContent = "A senha precisa ter pelo menos 6 caracteres.";
      return;
    }

    const users = getUsers();
    const emailExists = users.some(
      user => String(user.email || "").toLowerCase() === email
    );

    if (emailExists) {
      formError.textContent = "Já existe um usuário com esse e-mail.";
      return;
    }

    users.push({ name, email, password, role });

    if (!saveUsers(users)) {
      formError.textContent = "Não foi possível salvar o usuário.";
      return;
    }

    renderUsers();
    closeDialog();

    if (feedback) {
      feedback.textContent = "Usuário cadastrado.";
    }
  });

  userList.addEventListener("click", event => {
    const button = event.target.closest(".delete-user-button");
    if (!button) return;

    const index = Number(button.dataset.index);
    const users = getUsers();
    const userToDelete = users[index];

    if (!userToDelete) return;

    if (
      String(userToDelete.email || "").toLowerCase() ===
      String(session.email || "").toLowerCase()
    ) {
      if (feedback) feedback.textContent = "Você não pode excluir sua própria conta.";
      return;
    }

    if (!window.confirm(`Excluir o usuário "${userToDelete.name || userToDelete.email}"?`)) {
      return;
    }

    users.splice(index, 1);

    if (!saveUsers(users)) {
      if (feedback) feedback.textContent = "Não foi possível excluir o usuário.";
      return;
    }

    renderUsers();

    if (feedback) feedback.textContent = "Usuário excluído.";
  });

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("frotaAG4Session");
    window.location.href = "index.html";
  });

  renderUsers();
}
