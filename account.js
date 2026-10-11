const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePicture = document.getElementById("profilePicture");
const profileMessage = document.getElementById("profileMessage");
const passwordMessage = document.getElementById("passwordMessage");

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

function showMessage(element, message, success) {
  element.textContent = message;
  element.style.color = success ? "#32804a" : "#b76565";
}

function getCurrentUser() {
  users = getUsers();

  let loggedInUser;

  try {
    loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  } catch (error) {
    loggedInUser = null;
  }

  if (!loggedInUser || !loggedInUser.email) {
    return null;
  }

  return (
    users.find(function (user) {
      return user.email.toLowerCase() === loggedInUser.email.toLowerCase();
    }) || null
  );
}

function updateLoggedInUser(user) {
  try {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        username: user.username || user.name,
        name: user.name || user.username,
        email: user.email,
      }),
    );

    return true;
  } catch (error) {
    return false;
  }
}

function loadProfile() {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  profileName.value = user.name || user.username || "";
  profileEmail.value = user.email || "";

  profilePicture.replaceChildren();

  if (user.profilePicture) {
    const image = document.createElement("img");
    image.src = user.profilePicture;
    image.alt = "Profile picture";
    profilePicture.appendChild(image);
  } else {
    const plusIcon = document.createElement("span");
    plusIcon.id = "plusIcon";
    plusIcon.textContent = "+";
    profilePicture.appendChild(plusIcon);
  }
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
  }
}

function validPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{12,}$/.test(
    password,
  );
}

// Upload profile picture

document.getElementById("imageUpload").addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showMessage(profileMessage, "Please select a valid image.", false);
    this.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showMessage(
      profileMessage,
      "Please select an image smaller than 2 MB.",
      false,
    );
    this.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    const user = getCurrentUser();

    if (!user) {
      showMessage(profileMessage, "Please log in again.", false);
      return;
    }

    const oldPicture = user.profilePicture;
    user.profilePicture = event.target.result;

    if (!saveUsers()) {
      user.profilePicture = oldPicture;
      showMessage(
        profileMessage,
        "Unable to save the image. Try a smaller image.",
        false,
      );
      return;
    }

    loadProfile();
    showMessage(profileMessage, "Profile picture updated successfully.", true);
  };

  reader.onerror = function () {
    showMessage(profileMessage, "Unable to read this image.", false);
  };

  reader.readAsDataURL(file);
});

// Save profile information

document
  .getElementById("profileForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const name = profileName.value.trim();
    const email = profileEmail.value.trim().toLowerCase();

    if (!name || !email) {
      showMessage(profileMessage, "Please fill in all fields.", false);
      return;
    }

    if (!/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
      showMessage(profileMessage, "Please enter a valid name.", false);
      return;
    }

    const emailExists = users.some(function (item) {
      return (
        item.email.toLowerCase() === email &&
        item.email.toLowerCase() !== user.email.toLowerCase()
      );
    });

    if (emailExists) {
      showMessage(profileMessage, "This email is already registered.", false);
      return;
    }

    const oldUsers = JSON.stringify(users);
    const oldEmail = user.email;

    user.name = name;
    user.username = name;
    user.email = email;

    if (!saveUsers()) {
      users = JSON.parse(oldUsers);
      showMessage(profileMessage, "Unable to save your changes.", false);
      return;
    }

    if (!updateLoggedInUser(user)) {
      users = JSON.parse(oldUsers);
      localStorage.setItem("users", oldUsers);
      showMessage(profileMessage, "Unable to update your session.", false);
      return;
    }

    showMessage(profileMessage, "Your information has been saved.", true);
  });

// Change password

document
  .getElementById("passwordForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (currentPassword !== user.password) {
      showMessage(
        passwordMessage,
        "Your current password is incorrect.",
        false,
      );
      return;
    }

    if (!validPassword(newPassword)) {
      showMessage(
        passwordMessage,
        "Use at least 12 characters, including uppercase, lowercase, a number and a special character.",
        false,
      );
      return;
    }

    if (newPassword === currentPassword) {
      showMessage(
        passwordMessage,
        "Your new password must be different.",
        false,
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(passwordMessage, "The new passwords do not match.", false);
      return;
    }

    const oldPassword = user.password;
    user.password = newPassword;

    if (!saveUsers()) {
      user.password = oldPassword;
      showMessage(passwordMessage, "Unable to change your password.", false);
      return;
    }

    document.getElementById("passwordForm").reset();

    document.querySelectorAll(".show-password").forEach(function (button) {
      button.textContent = "Show";
    });

    document.querySelectorAll(".password-input").forEach(function (input) {
      input.type = "password";
    });

    showMessage(
      passwordMessage,
      "Your password has been changed successfully.",
      true,
    );
  });

// Logout

document.getElementById("logoutButton").addEventListener("click", function () {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  }
});

// Delete account

document.getElementById("deleteButton").addEventListener("click", function () {
  const user = getCurrentUser();

  if (!user) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete your account? This action cannot be undone.",
  );

  if (!confirmed) return;

  const oldUsers = JSON.stringify(users);

  users = users.filter(function (item) {
    return item.email.toLowerCase() !== user.email.toLowerCase();
  });

  if (!saveUsers()) {
    users = JSON.parse(oldUsers);
    alert("Unable to delete your account. Please try again.");
    return;
  }

  localStorage.removeItem("loggedInUser");

  alert("Your account has been deleted successfully.");

  window.location.href = "index.html";
});

loadProfile();
