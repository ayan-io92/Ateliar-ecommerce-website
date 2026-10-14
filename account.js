let users = getUsers();

function getUsers() {
  try {
    const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
    return Array.isArray(savedUsers) ? savedUsers : [];
  } catch (error) {
    return [];
  }
}

function saveUsers() {
  try {
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  } catch (error) {
    return false;
  }
}

function displayMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = "status-message mt-3";

  element.classList.add(type === "success" ? "text-success" : "text-danger");
}

function validPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{12,}$/.test(
    password,
  );
}

// Check logged-in user

let loggedInUser;

try {
  loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
} catch (error) {
  loggedInUser = null;
}

if (!loggedInUser || typeof loggedInUser.email !== "string") {
  window.location.href = "index.html";
}

let currentUser = users.find(function (user) {
  return (
    user.email && user.email.toLowerCase() === loggedInUser.email.toLowerCase()
  );
});

if (!currentUser) {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// Profile elements

const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileMessage = document.getElementById("profileMessage");

const imageUpload = document.getElementById("imageUpload");
const profilePicture = document.getElementById("profilePicture");

const passwordForm = document.getElementById("passwordForm");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const passwordMessage = document.getElementById("passwordMessage");

const logoutButton = document.getElementById("logoutButton");
const deleteButton = document.getElementById("deleteButton");

// Load profile information

function loadProfile() {
  profileName.value = currentUser.username || "";
  profileEmail.value = currentUser.email || "";

  if (currentUser.profilePicture) {
    profilePicture.innerHTML = "";

    const image = document.createElement("img");
    image.src = currentUser.profilePicture;
    image.alt = "Profile picture";

    profilePicture.appendChild(image);
  } else {
    profilePicture.innerHTML = '<span id="plusIcon">+</span>';
  }
}

loadProfile();

// Save profile information

profileForm.addEventListener("submit", function (event) {
  event.preventDefault();

  users = getUsers();

  currentUser = users.find(function (user) {
    return user.email.toLowerCase() === loggedInUser.email.toLowerCase();
  });

  if (!currentUser) {
    displayMessage(profileMessage, "Please sign in again.", "error");
    return;
  }

  const username = profileName.value.trim();
  const email = profileEmail.value.trim().toLowerCase();

  if (!username || !email) {
    displayMessage(profileMessage, "Please fill in all fields.", "error");
    return;
  }

  if (!/^[\p{L}][\p{L}\s'-]*$/u.test(username)) {
    displayMessage(profileMessage, "Please enter a valid name.", "error");
    return;
  }

  const emailExists = users.some(function (user) {
    return (
      user.email.toLowerCase() === email &&
      user.email.toLowerCase() !== currentUser.email.toLowerCase()
    );
  });

  if (emailExists) {
    displayMessage(
      profileMessage,
      "This email is already registered.",
      "error",
    );
    return;
  }

  const oldUsername = currentUser.username;
  const oldEmail = currentUser.email;

  currentUser.username = username;
  currentUser.email = email;

  if (!saveUsers()) {
    currentUser.username = oldUsername;
    currentUser.email = oldEmail;

    displayMessage(
      profileMessage,
      "Unable to save changes. Please try again.",
      "error",
    );
    return;
  }

  loggedInUser.username = username;
  loggedInUser.email = email;

  try {
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
  } catch (error) {
    displayMessage(
      profileMessage,
      "Profile saved, but session details could not be updated.",
      "error",
    );
    return;
  }

  displayMessage(
    profileMessage,
    "Your profile has been updated successfully.",
    "success",
  );
});

// Upload profile picture

imageUpload.addEventListener("change", function () {
  const file = imageUpload.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image.");
    imageUpload.value = "";
    return;
  }

  if (file.size > 1024 * 1024) {
    alert("Please select an image smaller than 1 MB.");
    imageUpload.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    const oldPicture = currentUser.profilePicture;

    currentUser.profilePicture = event.target.result;

    if (!saveUsers()) {
      currentUser.profilePicture = oldPicture;

      displayMessage(
        profileMessage,
        "Unable to save the profile picture.",
        "error",
      );
      return;
    }

    profilePicture.innerHTML = "";

    const image = document.createElement("img");
    image.src = event.target.result;
    image.alt = "Profile picture";

    profilePicture.appendChild(image);

    displayMessage(
      profileMessage,
      "Profile picture updated successfully.",
      "success",
    );
  };

  reader.readAsDataURL(file);
});

// Show and hide password

function togglePassword(inputId, button) {
  const passwordBox = button.closest(".password-field");

  const input = passwordBox
    ? passwordBox.querySelector("input")
    : document.getElementById(inputId);

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
  }
}

// Change password

passwordForm.addEventListener("submit", function (event) {
  event.preventDefault();

  users = getUsers();

  currentUser = users.find(function (user) {
    return user.email.toLowerCase() === loggedInUser.email.toLowerCase();
  });

  if (!currentUser) {
    displayMessage(passwordMessage, "Please sign in again.", "error");
    return;
  }

  const oldPassword = currentPassword.value;
  const updatedPassword = newPassword.value;
  const confirmedPassword = confirmPassword.value;

  if (oldPassword !== currentUser.password) {
    displayMessage(
      passwordMessage,
      "Your current password is incorrect.",
      "error",
    );
    return;
  }

  if (!validPassword(updatedPassword)) {
    displayMessage(
      passwordMessage,
      "Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.",
      "error",
    );
    return;
  }

  if (updatedPassword === oldPassword) {
    displayMessage(
      passwordMessage,
      "Choose a password different from your current password.",
      "error",
    );
    return;
  }

  if (updatedPassword !== confirmedPassword) {
    displayMessage(
      passwordMessage,
      "New password and confirmation do not match.",
      "error",
    );
    return;
  }

  const oldSavedPassword = currentUser.password;

  currentUser.password = updatedPassword;

  if (!saveUsers()) {
    currentUser.password = oldSavedPassword;

    displayMessage(
      passwordMessage,
      "Unable to change your password. Please try again.",
      "error",
    );
    return;
  }

  passwordForm.reset();

  document.querySelectorAll(".password-field").forEach(function (field) {
    const input = field.querySelector("input");
    const button = field.querySelector(".show-password");

    if (input) input.type = "password";
    if (button) button.textContent = "Show";
  });

  displayMessage(
    passwordMessage,
    "Your password has been changed successfully.",
    "success",
  );
});

// Logout

logoutButton.addEventListener("click", function () {
  const confirmed = confirm("Are you sure you want to log out?");

  if (!confirmed) return;

  localStorage.removeItem("loggedInUser");

  window.location.href = "index.html";
});

// Delete account

deleteButton.addEventListener("click", function () {
  const confirmed = confirm("Are you sure you want to delete your account?");

  if (!confirmed) return;

  users = getUsers();

  const updatedUsers = users.filter(function (user) {
    return user.email.toLowerCase() !== loggedInUser.email.toLowerCase();
  });

  try {
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.removeItem("loggedInUser");

    window.location.href = "index.html";
  } catch (error) {
    alert("Unable to delete your account. Please try again.");
  }
});
