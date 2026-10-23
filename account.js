let users = getUsers();
let loggedInUser = null;
let currentUser = null;

// Get saved users
function getUsers() {
  try {
    const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
    return Array.isArray(savedUsers) ? savedUsers : [];
  } catch (error) {
    return [];
  }
}

// Save users
function saveUsers() {
  try {
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  } catch (error) {
    return false;
  }
}

// Display messages
function displayMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = "status-message mt-3";

  element.classList.add(type === "success" ? "text-success" : "text-danger");
}

// Validate password
function validPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{12,}$/.test(
    password,
  );
}

// Check logged-in user
try {
  loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
} catch (error) {
  loggedInUser = null;
}

if (!loggedInUser || typeof loggedInUser.email !== "string") {
  window.location.href = "index.html";
} else {
  currentUser = users.find(function (user) {
    return (
      user &&
      typeof user.email === "string" &&
      user.email.toLowerCase() === loggedInUser.email.toLowerCase()
    );
  });

  if (!currentUser) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  }
}

// Stop running the remaining code if the session is invalid
if (loggedInUser && currentUser) {
  initializeProfile();
}

function initializeProfile() {
  // Profile elements
  const profileForm = document.getElementById("profileForm");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileMessage = document.getElementById("profileMessage");

  const imageUpload = document.getElementById("imageUpload");
  const profilePicture = document.getElementById("profilePicture");

  // Password elements
  const passwordForm = document.getElementById("passwordForm");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordMessage = document.getElementById("passwordMessage");

  const logoutButton = document.getElementById("logoutButton");
  const deleteButton = document.getElementById("deleteButton");

  // Keep password fields empty and prevent unwanted autofill
  if (passwordForm) {
    passwordForm.setAttribute("autocomplete", "off");

    [currentPassword, newPassword, confirmPassword].forEach(function (input) {
      if (!input) return;

      input.value = "";
      input.setAttribute("autocomplete", "new-password");
    });
  }

  // Load profile information
  function loadProfile() {
    if (profileName) {
      profileName.value = currentUser.username || "";
    }

    if (profileEmail) {
      profileEmail.value = currentUser.email || "";
    }

    if (!profilePicture) return;

    profilePicture.innerHTML = "";

    if (currentUser.profilePicture) {
      const image = document.createElement("img");
      image.src = currentUser.profilePicture;
      image.alt = "Profile picture";

      profilePicture.appendChild(image);
    } else {
      const plusIcon = document.createElement("span");
      plusIcon.id = "plusIcon";
      plusIcon.textContent = "+";

      profilePicture.appendChild(plusIcon);
    }
  }

  loadProfile();

  // Save profile information
  if (profileForm) {
    profileForm.addEventListener("submit", function (event) {
      event.preventDefault();

      users = getUsers();

      currentUser = users.find(function (user) {
        return (
          user &&
          typeof user.email === "string" &&
          user.email.toLowerCase() === loggedInUser.email.toLowerCase()
        );
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
          user &&
          typeof user.email === "string" &&
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
  }

  // Upload profile picture
  if (imageUpload) {
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

        loadProfile();

        displayMessage(
          profileMessage,
          "Profile picture updated successfully.",
          "success",
        );
      };

      reader.readAsDataURL(file);
    });
  }

  // Show and hide password
  window.togglePassword = function (inputId, button) {
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
  };

  // Reset password fields and Show/Hide buttons
  function clearPasswordFields() {
    if (passwordForm) {
      passwordForm.reset();
    }

    document.querySelectorAll(".password-field").forEach(function (field) {
      const input = field.querySelector("input");
      const button = field.querySelector(".show-password");

      if (input) {
        input.value = "";
        input.type = "password";
      }

      if (button) {
        button.textContent = "Show";
      }
    });
  }

  // Change password
  if (passwordForm) {
    passwordForm.addEventListener("submit", function (event) {
      event.preventDefault();

      users = getUsers();

      currentUser = users.find(function (user) {
        return (
          user &&
          typeof user.email === "string" &&
          user.email.toLowerCase() === loggedInUser.email.toLowerCase()
        );
      });

      if (!currentUser) {
        displayMessage(passwordMessage, "Please sign in again.", "error");
        return;
      }

      const oldPassword = currentPassword.value;
      const updatedPassword = newPassword.value;
      const confirmedPassword = confirmPassword.value;

      if (!oldPassword) {
        displayMessage(
          passwordMessage,
          "Please enter your current password.",
          "error",
        );
        return;
      }

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

      clearPasswordFields();

      displayMessage(
        passwordMessage,
        "Your password has been changed successfully.",
        "success",
      );
    });
  }

  // Also clear password fields when the page is loaded
  clearPasswordFields();

  // Logout
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      const confirmed = confirm("Are you sure you want to log out?");

      if (!confirmed) return;

      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    });
  }

  // Delete account
  if (deleteButton) {
    deleteButton.addEventListener("click", function () {
      const confirmed = confirm(
        "Are you sure you want to delete your account?",
      );

      if (!confirmed) return;

      users = getUsers();

      const updatedUsers = users.filter(function (user) {
        return (
          user &&
          typeof user.email === "string" &&
          user.email.toLowerCase() !== loggedInUser.email.toLowerCase()
        );
      });
      ("use strict");

      // Get saved users
      function getUsers() {
        try {
          const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
          return Array.isArray(savedUsers) ? savedUsers : [];
        } catch (error) {
          return [];
        }
      }

      // Save users
      function saveUsers() {
        try {
          localStorage.setItem("users", JSON.stringify(users));
          return true;
        } catch (error) {
          return false;
        }
      }

      // Get HTML elements
      const profileForm = document.getElementById("profileForm");
      const profileName = document.getElementById("profileName");
      const profileEmail = document.getElementById("profileEmail");
      const profilePicture = document.getElementById("profilePicture");
      const imageUpload = document.getElementById("imageUpload");
      const profileMessage = document.getElementById("profileMessage");

      const passwordForm = document.getElementById("passwordForm");
      const currentPassword = document.getElementById("currentPassword");
      const newPassword = document.getElementById("newPassword");
      const confirmPassword = document.getElementById("confirmPassword");
      const passwordMessage = document.getElementById("passwordMessage");

      const logoutButton = document.getElementById("logoutButton");
      const deleteButton = document.getElementById("deleteButton");

      const deleteModal = document.getElementById("deleteModal");
      const cancelDeleteButton = document.getElementById("cancelDeleteButton");
      const confirmDeleteButton = document.getElementById(
        "confirmDeleteButton",
      );

      // Load users and logged-in user
      let users = getUsers();
      let loggedInUser = null;

      try {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      } catch (error) {
        loggedInUser = null;
      }

      // Check whether a user is logged in
      if (!loggedInUser || !loggedInUser.email) {
        window.location.href = "index.html";
      }

      // Find the current user
      function getCurrentUser() {
        return users.find(function (user) {
          return (
            user &&
            user.email &&
            user.email.toLowerCase() === loggedInUser.email.toLowerCase()
          );
        });
      }

      let currentUser = getCurrentUser();

      // If the saved account does not exist, return to login
      if (!currentUser) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
      }

      // Display a message
      function displayMessage(element, message, color) {
        if (!element) {
          return;
        }

        element.textContent = message;
        element.style.color = color;
      }

      // Check password strength
      function validPassword(password) {
        const passwordPattern =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{12,}$/;

        return passwordPattern.test(password);
      }

      // Update the saved login information
      function updateLoggedInUser() {
        const sessionUser = {
          username: currentUser.username,
          email: currentUser.email,
        };

        if (currentUser.profilePicture) {
          sessionUser.profilePicture = currentUser.profilePicture;
        }

        localStorage.setItem("loggedInUser", JSON.stringify(sessionUser));
      }

      // Show or hide a password
      function togglePassword(inputId, button) {
        const passwordInput = document.getElementById(inputId);

        if (!passwordInput || !button) {
          return;
        }

        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          button.textContent = "Hide";
        } else {
          passwordInput.type = "password";
          button.textContent = "Show";
        }
      }

      // Make the function available to the HTML Show buttons
      window.togglePassword = togglePassword;

      // Load profile information
      function loadProfile() {
        if (!currentUser) {
          return;
        }

        if (profileName) {
          profileName.value = currentUser.username || currentUser.name || "";
        }

        if (profileEmail) {
          profileEmail.value = currentUser.email || "";
        }

        if (currentUser.profilePicture && profilePicture) {
          profilePicture.style.backgroundImage =
            'url("' + currentUser.profilePicture + '")';

          profilePicture.style.backgroundSize = "cover";
          profilePicture.style.backgroundPosition = "center";

          const plusIcon = document.getElementById("plusIcon");

          if (plusIcon) {
            plusIcon.style.display = "none";
          }
        }
      }

      loadProfile();

      // Save profile changes
      if (profileForm) {
        profileForm.addEventListener("submit", function (event) {
          event.preventDefault();

          const name = profileName.value.trim();
          const email = profileEmail.value.trim().toLowerCase();

          if (!name || !email) {
            displayMessage(
              profileMessage,
              "Please enter your name and email.",
              "#b76565",
            );
            return;
          }

          const emailExists = users.some(function (user) {
            return (
              user &&
              user.email &&
              user.email.toLowerCase() === email &&
              user.email.toLowerCase() !== currentUser.email.toLowerCase()
            );
          });

          if (emailExists) {
            displayMessage(
              profileMessage,
              "This email is already used by another account.",
              "#b76565",
            );
            return;
          }

          currentUser.username = name;
          currentUser.name = name;
          currentUser.email = email;

          if (!saveUsers()) {
            displayMessage(
              profileMessage,
              "Unable to save your changes. Please try again.",
              "#b76565",
            );
            return;
          }

          loggedInUser = {
            username: name,
            email: email,
          };

          updateLoggedInUser();

          displayMessage(
            profileMessage,
            "Your profile has been updated successfully.",
            "#467653",
          );
        });
      }

      // Upload profile picture
      if (imageUpload) {
        imageUpload.addEventListener("change", function () {
          const file = imageUpload.files[0];

          if (!file) {
            return;
          }

          if (!file.type.startsWith("image/")) {
            displayMessage(
              profileMessage,
              "Please choose an image file.",
              "#b76565",
            );
            imageUpload.value = "";
            return;
          }

          const reader = new FileReader();

          reader.onload = function (event) {
            currentUser.profilePicture = event.target.result;

            if (!saveUsers()) {
              displayMessage(
                profileMessage,
                "Unable to save the profile picture.",
                "#b76565",
              );
              return;
            }

            updateLoggedInUser();

            if (profilePicture) {
              profilePicture.style.backgroundImage =
                'url("' + event.target.result + '")';

              profilePicture.style.backgroundSize = "cover";
              profilePicture.style.backgroundPosition = "center";
            }

            const plusIcon = document.getElementById("plusIcon");

            if (plusIcon) {
              plusIcon.style.display = "none";
            }

            displayMessage(
              profileMessage,
              "Profile picture updated successfully.",
              "#467653",
            );
          };

          reader.onerror = function () {
            displayMessage(
              profileMessage,
              "Unable to read this image. Please try another one.",
              "#b76565",
            );
          };

          reader.readAsDataURL(file);
        });
      }

      // Change password
      if (passwordForm) {
        passwordForm.addEventListener("submit", function (event) {
          event.preventDefault();

          const oldPassword = currentPassword.value;
          const newPass = newPassword.value;
          const confirmPass = confirmPassword.value;

          if (oldPassword !== currentUser.password) {
            displayMessage(
              passwordMessage,
              "Your current password is incorrect.",
              "#b76565",
            );
            return;
          }

          if (!validPassword(newPass)) {
            displayMessage(
              passwordMessage,
              "Use at least 12 characters, including uppercase, lowercase, a number and a special character. Do not use spaces.",
              "#b76565",
            );
            return;
          }

          if (newPass !== confirmPass) {
            displayMessage(
              passwordMessage,
              "The new passwords do not match.",
              "#b76565",
            );
            return;
          }

          if (oldPassword === newPass) {
            displayMessage(
              passwordMessage,
              "Your new password must be different.",
              "#b76565",
            );
            return;
          }

          currentUser.password = newPass;

          if (!saveUsers()) {
            currentUser.password = oldPassword;

            displayMessage(
              passwordMessage,
              "Unable to change your password. Please try again.",
              "#b76565",
            );
            return;
          }

          passwordForm.reset();

          displayMessage(
            passwordMessage,
            "Your password has been changed successfully.",
            "#467653",
          );
        });
      }

      // Log out
      if (logoutButton) {
        logoutButton.addEventListener("click", function () {
          localStorage.removeItem("loggedInUser");
          window.location.href = "index.html";
        });
      }

      // Open the delete account modal
      if (deleteButton && deleteModal) {
        deleteButton.addEventListener("click", function () {
          deleteModal.hidden = false;

          if (cancelDeleteButton) {
            cancelDeleteButton.focus();
          }
        });
      }

      // Close modal with Cancel
      if (cancelDeleteButton && deleteModal) {
        cancelDeleteButton.addEventListener("click", function () {
          deleteModal.hidden = true;
          deleteButton.focus();
        });
      }

      // Close modal by clicking outside it
      if (deleteModal) {
        deleteModal.addEventListener("click", function (event) {
          if (event.target === deleteModal) {
            deleteModal.hidden = true;

            if (deleteButton) {
              deleteButton.focus();
            }
          }
        });
      }

      // Confirm account deletion
      if (confirmDeleteButton && deleteModal) {
        confirmDeleteButton.addEventListener("click", function () {
          users = getUsers();

          const updatedUsers = users.filter(function (user) {
            return (
              user &&
              typeof user.email === "string" &&
              user.email.toLowerCase() !== loggedInUser.email.toLowerCase()
            );
          });

          try {
            localStorage.setItem("users", JSON.stringify(updatedUsers));
            localStorage.removeItem("loggedInUser");

            window.location.href = "index.html";
          } catch (error) {
            deleteModal.hidden = true;

            displayMessage(
              profileMessage,
              "Unable to delete your account. Please try again.",
              "#b76565",
            );
          }
        });
      }

      try {
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        localStorage.removeItem("loggedInUser");

        window.location.href = "index.html";
      } catch (error) {
        alert("Unable to delete your account. Please try again.");
      }
    });
  }
}

const deleteButton = document.getElementById("confirmDeleteAccount");

deleteButton.addEventListener("click", function () {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser) {
    return;
  }

  users = users.filter(function (user) {
    return user.email !== loggedInUser.email;
  });

  localStorage.setItem("users", JSON.stringify(users));

  localStorage.removeItem("loggedInUser");

  const modalElement = document.getElementById("deleteAccountModal");
  const modal = bootstrap.Modal.getInstance(modalElement);

  modal.hide();

  window.location.href = "index.html";
});
