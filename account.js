const sidebarLinks = document.querySelectorAll(".sidebar-link");
const contentPanels = document.querySelectorAll(".content-panel");

const sidebarName = document.getElementById("sidebarName");
const sidebarEmail = document.getElementById("sidebarEmail");
const sidebarImage = document.getElementById("sidebarImage");
const profilePicture = document.getElementById("profilePicture");

const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileMessage = document.getElementById("profileMessage");

const imageUpload = document.getElementById("imageUpload");
const uploadButton = document.getElementById("uploadButton");
const removeImageButton = document.getElementById("removeImageButton");

const passwordForm = document.getElementById("passwordForm");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const passwordMessage = document.getElementById("passwordMessage");

const ordersContainer = document.getElementById("ordersContainer");

const logoutButton = document.getElementById("logoutButton");
const confirmDeleteAccount = document.getElementById("confirmDeleteAccount");

const messageModal = document.getElementById("messageModal");
const messageModalTitle = document.getElementById("messageModalTitle");
const messageModalBody = document.getElementById("messageModalBody");

const cartCount = document.getElementById("cartCount");
const cartLink = document.getElementById("cartLink");

let selectedImage = "";
let currentUser = null;

// Get saved data from localStorage
function getData(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

// Save data in localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Show a message using the Bootstrap modal
function showMessage(title, message) {
  messageModalTitle.textContent = title;
  messageModalBody.textContent = message;

  const modal = bootstrap.Modal.getOrCreateInstance(messageModal);
  modal.show();
}

// Get the logged-in user
function getCurrentUser() {
  const savedUser = localStorage.getItem("loggedInUser");

  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    if (typeof parsedUser === "object" && parsedUser !== null) {
      return parsedUser;
    }

    if (typeof parsedUser === "string") {
      const users = getData("users", []);
      return (
        users.find(function (user) {
          return user.email.toLowerCase() === parsedUser.toLowerCase();
        }) || null
      );
    }
  } catch (error) {
    const users = getData("users", []);

    return (
      users.find(function (user) {
        return user.email.toLowerCase() === savedUser.toLowerCase();
      }) || null
    );
  }

  return null;
}

// Find the saved user in the users array
function getSavedUser() {
  const users = getData("users", []);

  return users.find(function (user) {
    return user.email.toLowerCase() === currentUser.email.toLowerCase();
  });
}

// Save updated user information
function updateUser(updatedUser) {
  const users = getData("users", []);

  const userIndex = users.findIndex(function (user) {
    return user.email.toLowerCase() === currentUser.email.toLowerCase();
  });

  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    saveData("users", users);
  }

  currentUser = updatedUser;
  saveData("loggedInUser", updatedUser);
}

// Show the profile picture or default icon
function displayImage(container, image) {
  container.innerHTML = "";

  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = "Profile picture";

    container.appendChild(img);
  } else {
    const icon = document.createElement("i");
    icon.className = "fa-regular fa-user";

    container.appendChild(icon);
  }
}

// Load profile information
function loadProfile() {
  if (!currentUser) {
    return;
  }

  profileName.value = currentUser.name || "";
  profileEmail.value = currentUser.email || "";

  sidebarName.textContent = currentUser.name || "My Account";
  sidebarEmail.textContent = currentUser.email || "";

  selectedImage = currentUser.picture || "";

  displayImage(profilePicture, selectedImage);
  displayImage(sidebarImage, selectedImage);
}

// Check whether the user is logged in
function checkLogin() {
  currentUser = getCurrentUser();

  if (!currentUser || !currentUser.email) {
    showMessage("Login required", "Please log in to access your account.");

    setTimeout(function () {
      window.location.href = "index.html";
    }, 1200);

    return false;
  }

  return true;
}

// Change account sections
function openSection(sectionName) {
  sidebarLinks.forEach(function (link) {
    link.classList.remove("active");

    if (link.dataset.section === sectionName) {
      link.classList.add("active");
    }
  });

  contentPanels.forEach(function (panel) {
    panel.classList.remove("active");
  });

  const selectedPanel = document.getElementById(sectionName + "Panel");

  if (selectedPanel) {
    selectedPanel.classList.add("active");
  }

  if (sectionName === "orders") {
    loadOrders();
  }
}

// Sidebar navigation
sidebarLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    openSection(link.dataset.section);
  });
});

// Open sections from overview cards
document.querySelectorAll("[data-open-section]").forEach(function (button) {
  button.addEventListener("click", function () {
    openSection(button.dataset.openSection);
  });
});

// Save profile information
profileForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const name = profileName.value.trim();
  const email = profileEmail.value.trim().toLowerCase();

  if (!name || !email) {
    profileMessage.textContent = "Please fill in all fields.";
    profileMessage.style.color = "#bd3333";
    return;
  }

  const users = getData("users", []);

  const emailExists = users.some(function (user) {
    return (
      user.email.toLowerCase() === email &&
      user.email.toLowerCase() !== currentUser.email.toLowerCase()
    );
  });

  if (emailExists) {
    profileMessage.textContent = "This email is already registered.";
    profileMessage.style.color = "#bd3333";
    return;
  }

  const oldEmail = currentUser.email;

  const updatedUser = {
    ...currentUser,
    name: name,
    email: email,
    picture: selectedImage,
  };

  const userIndex = users.findIndex(function (user) {
    return user.email.toLowerCase() === oldEmail.toLowerCase();
  });

  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    saveData("users", users);
  }

  currentUser = updatedUser;
  saveData("loggedInUser", updatedUser);

  sidebarName.textContent = name;
  sidebarEmail.textContent = email;

  profileMessage.textContent = "Your profile has been updated successfully.";
  profileMessage.style.color = "green";
});

// Open image selector
uploadButton.addEventListener("click", function () {
  imageUpload.click();
});

// Upload a profile picture
imageUpload.addEventListener("change", function () {
  const file = imageUpload.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showMessage("Invalid file", "Please select an image file.");
    imageUpload.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showMessage("Image too large", "Please select an image smaller than 2 MB.");
    imageUpload.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    selectedImage = reader.result;

    displayImage(profilePicture, selectedImage);
    displayImage(sidebarImage, selectedImage);

    if (currentUser) {
      currentUser.picture = selectedImage;
      saveData("loggedInUser", currentUser);
    }

    profileMessage.textContent =
      "Image selected. Save changes to keep it in your account.";
    profileMessage.style.color = "green";
  };

  reader.readAsDataURL(file);
});

// Remove profile picture
removeImageButton.addEventListener("click", function () {
  selectedImage = "";

  displayImage(profilePicture, "");
  displayImage(sidebarImage, "");

  if (currentUser) {
    currentUser.picture = "";
    saveData("loggedInUser", currentUser);
  }

  imageUpload.value = "";

  profileMessage.textContent = "Profile picture removed.";
  profileMessage.style.color = "green";
});

// Show or hide passwords
document.querySelectorAll(".show-password").forEach(function (button) {
  button.addEventListener("click", function () {
    const input = document.getElementById(button.dataset.password);

    if (input.type === "password") {
      input.type = "text";
      button.textContent = "Hide";
    } else {
      input.type = "password";
      button.textContent = "Show";
    }
  });
});

// Change password
passwordForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const oldPassword = currentPassword.value;
  const password = newPassword.value;
  const confirm = confirmPassword.value;

  if (oldPassword !== currentUser.password) {
    passwordMessage.textContent = "Your current password is incorrect.";
    passwordMessage.style.color = "#bd3333";
    return;
  }

  if (
    password.length < 12 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password) ||
    /\s/.test(password)
  ) {
    passwordMessage.textContent =
      "Use at least 12 characters, including uppercase, lowercase, a number and a special character.";

    passwordMessage.style.color = "#bd3333";
    return;
  }

  if (password !== confirm) {
    passwordMessage.textContent = "The new passwords do not match.";
    passwordMessage.style.color = "#bd3333";
    return;
  }

  if (oldPassword === password) {
    passwordMessage.textContent = "Choose a different password.";
    passwordMessage.style.color = "#bd3333";
    return;
  }

  currentUser.password = password;
  updateUser(currentUser);

  passwordForm.reset();

  document.querySelectorAll(".show-password").forEach(function (button) {
    button.textContent = "Show";
  });

  passwordMessage.textContent = "Your password has been changed successfully.";
  passwordMessage.style.color = "green";
});

// Load orders belonging to the logged-in user
function loadOrders() {
  ordersContainer.innerHTML = "";

  const orders = getData("orders", []);

  const userOrders = orders.filter(function (order) {
    const orderEmail = order.email || order.customerEmail || "";

    return orderEmail.toLowerCase() === currentUser.email.toLowerCase();
  });

  if (userOrders.length === 0) {
    ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open"></i>
                <h3>No orders yet.</h3>
                <p>Your orders will appear here when you place an order.</p>
                <a href="products.html" class="dark-link">Explore products</a>
            </div>
        `;
    return;
  }

  userOrders.forEach(function (order) {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";

    const heading = document.createElement("h3");
    heading.textContent = "Order #" + (order.id || order.orderId || "N/A");

    const date = document.createElement("p");
    date.textContent =
      "Date: " + (order.date || order.orderDate || "Not available");

    const status = document.createElement("span");
    status.className = "order-status";
    status.textContent = order.status || "Processing";

    const total = document.createElement("p");
    const amount = Number(order.total || order.totalAmount || 0);
    total.textContent = "Total: $" + amount.toFixed(2);

    orderCard.appendChild(heading);
    orderCard.appendChild(date);
    orderCard.appendChild(status);
    orderCard.appendChild(total);

    ordersContainer.appendChild(orderCard);
  });
}

// Update cart count
function updateCartCount() {
  const cart = getData("cart", []);

  let totalItems = 0;

  cart.forEach(function (item) {
    totalItems += Number(item.quantity) || 1;
  });

  cartCount.textContent = totalItems;
}

// Open cart page
cartLink.href = "cart.html";

cartLink.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "cart.html";
});

// Logout
logoutButton.addEventListener("click", function () {
  showMessage("Logout", "You have been logged out.");

  localStorage.removeItem("loggedInUser");

  setTimeout(function () {
    window.location.href = "home.html";
  }, 1000);
});

// Delete account
confirmDeleteAccount.addEventListener("click", function () {
  if (!currentUser) {
    return;
  }

  const users = getData("users", []);

  const updatedUsers = users.filter(function (user) {
    return user.email.toLowerCase() !== currentUser.email.toLowerCase();
  });

  saveData("users", updatedUsers);
  localStorage.removeItem("loggedInUser");

  const deleteModal = bootstrap.Modal.getInstance(
    document.getElementById("deleteAccountModal"),
  );

  if (deleteModal) {
    deleteModal.hide();
  }

  showMessage("Account deleted", "Your account has been deleted successfully.");

  setTimeout(function () {
    window.location.href = "home.html";
  }, 1200);
});

// Search products
const searchToggle = document.getElementById("searchToggle");
const searchModal = document.getElementById("searchModal");
const siteSearchInput = document.getElementById("siteSearchInput");
const searchResults = document.getElementById("searchResults");
const searchForm = document.getElementById("searchForm");
const closeSearch = document.getElementById("closeSearch");

let allProducts = [];

if (searchToggle && searchModal) {
  searchToggle.addEventListener("click", function () {
    searchModal.hidden = !searchModal.hidden;
    searchToggle.setAttribute("aria-expanded", !searchModal.hidden);

    if (!searchModal.hidden) {
      siteSearchInput.focus();
    }
  });
}

if (closeSearch) {
  closeSearch.addEventListener("click", function () {
    searchModal.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
  });
}

if (searchForm) {
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchProducts();
  });
}

if (siteSearchInput) {
  siteSearchInput.addEventListener("input", searchProducts);
}

function searchProducts() {
  if (!siteSearchInput || !searchResults) {
    return;
  }

  const searchText = siteSearchInput.value.trim().toLowerCase();

  if (!searchText) {
    searchResults.innerHTML = "<p>Search for something you love.</p>";
    return;
  }

  const matchingProducts = allProducts.filter(function (product) {
    return (
      product.title.toLowerCase().includes(searchText) ||
      (product.category || "").toLowerCase().includes(searchText)
    );
  });

  searchResults.innerHTML = "";

  if (matchingProducts.length === 0) {
    searchResults.textContent = "No products found.";
    return;
  }

  matchingProducts.slice(0, 6).forEach(function (product) {
    const link = document.createElement("a");

    link.href = "details.html?id=" + encodeURIComponent(product.id);
    link.className = "search-result-item";
    link.textContent = product.title;

    searchResults.appendChild(link);
  });
}

fetch("https://fakestoreapi.com/products")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Unable to load products.");
    }

    return response.json();
  })
  .then(function (products) {
    allProducts = products;
  })
  .catch(function () {
    allProducts = [];
  });

// Start the account page
if (checkLogin()) {
  loadProfile();
  loadOrders();
  updateCartCount();
}
