const usersKey = "users";
const loggedInKey = "loggedInUser";

let currentUser = null;
let selectedImage = "";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(usersKey)) || [];
  } catch (error) {
    return [];
  }
}

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem(loggedInKey));
  } catch (error) {
    return localStorage.getItem(loggedInKey);
  }
}

function findCurrentUser() {
  const loggedIn = getLoggedInUser();
  const users = getUsers();

  if (!loggedIn) {
    return null;
  }

  if (typeof loggedIn === "object") {
    const email = loggedIn.email;

    if (email) {
      const foundUser = users.find(function (user) {
        return user.email && user.email.toLowerCase() === email.toLowerCase();
      });

      if (foundUser) {
        return foundUser;
      }
    }

    return loggedIn;
  }

  return (
    users.find(function (user) {
      return (
        user.email &&
        user.email.toLowerCase() === String(loggedIn).toLowerCase()
      );
    }) || null
  );
}

function showMessage(message, title) {
  document.getElementById("messageModalTitle").textContent = title || "Atelier";
  document.getElementById("messageModalBody").textContent = message;

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("messageModal"),
  ).show();
}

function getUserImage(user) {
  if (!user) {
    return "";
  }

  return user.profilePicture || user.image || user.picture || "";
}

function updateImages() {
  const image = selectedImage || getUserImage(currentUser);

  const sidebarImage = document.getElementById("sidebarImage");
  const profilePicture = document.getElementById("profilePicture");
  const accountNavContent = document.getElementById("accountNavContent");

  if (image) {
    sidebarImage.innerHTML = "";
    const sidebarImg = document.createElement("img");
    sidebarImg.src = image;
    sidebarImg.alt = "Profile picture";
    sidebarImage.appendChild(sidebarImg);

    profilePicture.innerHTML = "";
    const profileImg = document.createElement("img");
    profileImg.src = image;
    profileImg.alt = "Profile picture";
    profilePicture.appendChild(profileImg);

    accountNavContent.innerHTML = "";
    const navImg = document.createElement("img");
    navImg.src = image;
    navImg.alt = "Profile";
    navImg.className = "account-nav-image";
    accountNavContent.appendChild(navImg);
  } else {
    sidebarImage.innerHTML = '<i class="fa-regular fa-user"></i>';
    profilePicture.innerHTML = '<i class="fa-regular fa-user"></i>';
    accountNavContent.textContent = "ACCOUNT";
  }
}

function updateProfileDisplay() {
  document.getElementById("sidebarName").textContent =
    currentUser.name || currentUser.fullName || "My Account";

  document.getElementById("sidebarEmail").textContent = currentUser.email || "";

  document.getElementById("profileName").value =
    currentUser.name || currentUser.fullName || "";

  document.getElementById("profileEmail").value = currentUser.email || "";

  updateImages();
}

function openSection(sectionName) {
  document.querySelectorAll(".content-panel").forEach(function (panel) {
    panel.classList.remove("active");
  });

  document
    .querySelectorAll(".sidebar-link[data-section]")
    .forEach(function (button) {
      button.classList.toggle("active", button.dataset.section === sectionName);
    });

  const selectedPanel = document.getElementById(sectionName + "Panel");

  if (selectedPanel) {
    selectedPanel.classList.add("active");
  }

  if (sectionName === "orders") {
    showOrders();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

document
  .querySelectorAll(".sidebar-link[data-section]")
  .forEach(function (button) {
    button.addEventListener("click", function () {
      openSection(button.dataset.section);
    });
  });

document.querySelectorAll("[data-open-section]").forEach(function (button) {
  button.addEventListener("click", function () {
    openSection(button.dataset.openSection);
  });
});

function saveUser(updatedUser) {
  const users = getUsers();

  const userIndex = users.findIndex(function (user) {
    return (
      user.email &&
      currentUser.email &&
      user.email.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    localStorage.setItem(usersKey, JSON.stringify(users));
  }

  localStorage.setItem(loggedInKey, JSON.stringify(updatedUser));
  currentUser = updatedUser;
}

document.getElementById("uploadButton").addEventListener("click", function () {
  document.getElementById("imageUpload").click();
});

document.getElementById("imageUpload").addEventListener("change", function () {
  const file = this.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showMessage("Please select a valid image.");
    this.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showMessage("Please choose an image smaller than 2 MB.");
    this.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    selectedImage = reader.result;
    updateImages();
  };

  reader.readAsDataURL(file);
});

document
  .getElementById("removeImageButton")
  .addEventListener("click", function () {
    selectedImage = "";
    currentUser.profilePicture = "";
    currentUser.image = "";
    updateImages();
    document.getElementById("imageUpload").value = "";
  });

document
  .getElementById("profileForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("profileName").value.trim();
    const email = document.getElementById("profileEmail").value.trim();
    const message = document.getElementById("profileMessage");

    if (!name || !email) {
      message.textContent = "Please fill in all fields.";
      message.style.color = "#b76565";
      return;
    }

    const users = getUsers();

    const emailExists = users.some(function (user) {
      return (
        user.email &&
        user.email.toLowerCase() === email.toLowerCase() &&
        user.email.toLowerCase() !==
          String(currentUser.email || "").toLowerCase()
      );
    });

    if (emailExists) {
      message.textContent = "This email is already registered.";
      message.style.color = "#b76565";
      return;
    }

    const oldEmail = currentUser.email;

    currentUser.name = name;
    currentUser.fullName = name;
    currentUser.email = email;

    if (selectedImage) {
      currentUser.profilePicture = selectedImage;
      currentUser.image = selectedImage;
    }

    const userIndex = users.findIndex(function (user) {
      return (
        user.email &&
        oldEmail &&
        user.email.toLowerCase() === oldEmail.toLowerCase()
      );
    });

    if (userIndex !== -1) {
      users[userIndex] = currentUser;
      localStorage.setItem(usersKey, JSON.stringify(users));
    }

    localStorage.setItem(loggedInKey, JSON.stringify(currentUser));

    updateProfileDisplay();

    message.textContent = "Your information has been saved.";
    message.style.color = "green";
  });

document.querySelectorAll(".show-password").forEach(function (button) {
  button.addEventListener("click", function () {
    const input = document.getElementById(this.dataset.password);

    if (input.type === "password") {
      input.type = "text";
      this.textContent = "Hide";
    } else {
      input.type = "password";
      this.textContent = "Show";
    }
  });
});

document
  .getElementById("passwordForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("passwordMessage");

    if (newPassword.length < 8) {
      message.textContent =
        "Your new password must have at least 8 characters.";
      message.style.color = "#b76565";
      return;
    }

    if (newPassword !== confirmPassword) {
      message.textContent = "The new passwords do not match.";
      message.style.color = "#b76565";
      return;
    }

    if (currentPassword === newPassword) {
      message.textContent = "Choose a different new password.";
      message.style.color = "#b76565";
      return;
    }

    if (String(currentUser.password || "") !== currentPassword) {
      message.textContent = "Your current password is incorrect.";
      message.style.color = "#b76565";
      return;
    }

    currentUser.password = newPassword;
    saveUser(currentUser);

    this.reset();

    document.querySelectorAll(".show-password").forEach(function (button) {
      button.textContent = "Show";
    });

    message.textContent = "Your password has been changed.";
    message.style.color = "green";
  });

function showOrders() {
  const container = document.getElementById("ordersContainer");
  let orders = [];

  try {
    orders = JSON.parse(localStorage.getItem("orders")) || [];
  } catch (error) {
    orders = [];
  }

  orders = orders.filter(function (order) {
    const orderEmail = order.email || (order.customer && order.customer.email);

    return (
      orderEmail &&
      currentUser.email &&
      orderEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-box-open d-block"></i>
                        <h3>No orders yet.</h3>
                        <p>Your orders will appear here when available.</p>
                        <a href="products.html" class="dark-link">Explore products →</a>
                    </div>
                `;
    return;
  }

  orders.forEach(function (order, index) {
    const card = document.createElement("div");
    card.className = "order-card";

    const title = document.createElement("h3");
    title.textContent = "Order #" + (order.id || order.orderId || index + 1);

    const date = document.createElement("p");
    date.textContent =
      "Date: " + (order.date || order.createdAt || "Not available");

    const total = document.createElement("p");
    total.textContent =
      "Total: $" + Number(order.total || order.grandTotal || 0).toFixed(2);

    const status = document.createElement("span");
    status.className = "order-status";
    status.textContent = order.status || "Order placed";

    card.append(title, date, total, status);
    container.appendChild(card);
  });
}

function logout() {
  localStorage.removeItem(loggedInKey);
  window.location.href = "index.html";
}

document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("sidebarLogout").addEventListener("click", logout);

document
  .getElementById("confirmDeleteAccount")
  .addEventListener("click", function () {
    const users = getUsers();

    const updatedUsers = users.filter(function (user) {
      return (
        !user.email ||
        !currentUser.email ||
        user.email.toLowerCase() !== currentUser.email.toLowerCase()
      );
    });

    localStorage.setItem(usersKey, JSON.stringify(updatedUsers));
    localStorage.removeItem(loggedInKey);

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("deleteAccountModal"),
    ).hide();

    window.location.href = "index.html";
  });

function updateCartCount() {
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch (error) {
    cart = [];
  }

  let count = 0;

  cart.forEach(function (item) {
    count += Number(item.quantity) || 1;
  });

  document.getElementById("cartCount").textContent = count;
}

currentUser = findCurrentUser();

if (!currentUser) {
  window.location.href = "index.html";
} else {
  updateProfileDisplay();
  updateCartCount();
}
