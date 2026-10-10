const signupView = document.getElementById("signupView");
const loginView = document.getElementById("loginView");
const forgotView = document.getElementById("forgotView");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const forgotForm = document.getElementById("forgotForm");

const signupMessage = document.getElementById("signupMessage");
const loginMessage = document.getElementById("loginMessage");
const forgotMessage = document.getElementById("forgotMessage");

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

function showForm(formName) {
  signupView.classList.add("d-none");
  loginView.classList.add("d-none");
  forgotView.classList.add("d-none");

  if (formName === "signup") {
    signupView.classList.remove("d-none");
    signupForm.reset();
    clearMessage(signupMessage);
  } else if (formName === "login") {
    loginView.classList.remove("d-none");
    loginForm.reset();
    clearMessage(loginMessage);
  } else if (formName === "forgot") {
    forgotView.classList.remove("d-none");
    forgotForm.reset();
    clearMessage(forgotMessage);
  }

  document.querySelectorAll(".show-password").forEach(function (button) {
    button.textContent = "Show";
  });

  document.querySelectorAll(".password-box input").forEach(function (input) {
    input.type = "password";
  });
}

function showPassword(inputId, button) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
  }
}

function displayMessage(element, message, type) {
  element.textContent = message;
  element.className =
    type === "success" ? "text-success mt-3" : "text-danger mt-3";
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "";
}

function validPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{12,}$/.test(
    password,
  );
}

function validName(name) {
  return /^[\p{L}][\p{L}\s'-]*$/u.test(name.trim());
}

document
  .getElementById("showLogin")
  .addEventListener("click", function (event) {
    event.preventDefault();
    showForm("login");
  });

document
  .getElementById("showSignup")
  .addEventListener("click", function (event) {
    event.preventDefault();
    showForm("signup");
  });

document
  .getElementById("showForgot")
  .addEventListener("click", function (event) {
    event.preventDefault();
    showForm("forgot");
  });

document
  .getElementById("backToLogin")
  .addEventListener("click", function (event) {
    event.preventDefault();
    showForm("login");
  });

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  users = getUsers();

  const username = document.getElementById("signupUsername").value.trim();
  const email = document
    .getElementById("signupEmail")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!validName(username)) {
    displayMessage(signupMessage, "Please enter a valid full name.", "error");
    return;
  }

  if (
    users.some(function (user) {
      return user.email.toLowerCase() === email;
    })
  ) {
    displayMessage(
      signupMessage,
      "An account with this email already exists.",
      "error",
    );
    return;
  }

  if (!validPassword(password)) {
    displayMessage(
      signupMessage,
      "Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.",
      "error",
    );
    return;
  }

  if (password !== confirmPassword) {
    displayMessage(signupMessage, "Passwords do not match.", "error");
    return;
  }

  users.push({
    username: username,
    email: email,
    password: password,
  });

  if (!saveUsers()) {
    users.pop();
    displayMessage(
      signupMessage,
      "Unable to save your account. Please try again.",
      "error",
    );
    return;
  }

  signupForm.reset();

  displayMessage(
    signupMessage,
    "Account created successfully! You can now sign in.",
    "success",
  );
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  users = getUsers();

  const email = document
    .getElementById("loginEmail")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("loginPassword").value;

  const user = users.find(function (item) {
    return item.email.toLowerCase() === email && item.password === password;
  });

  if (!user) {
    displayMessage(loginMessage, "Incorrect email or password.", "error");
    return;
  }

  try {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        username: user.username,
        email: user.email,
      }),
    );
  } catch (error) {
    displayMessage(
      loginMessage,
      "Unable to sign in. Please try again.",
      "error",
    );
    return;
  }

  displayMessage(
    loginMessage,
    "Welcome back, " + user.username + "!",
    "success",
  );

  loginForm.reset();

  setTimeout(function () {
    window.location.href = "home.html";
  }, 1000);
});

forgotForm.addEventListener("submit", function (event) {
  event.preventDefault();

  users = getUsers();

  const email = document
    .getElementById("forgotEmail")
    .value.trim()
    .toLowerCase();
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;

  const userIndex = users.findIndex(function (user) {
    return user.email.toLowerCase() === email;
  });

  if (userIndex === -1) {
    displayMessage(
      forgotMessage,
      "No account found with this email address.",
      "error",
    );
    return;
  }

  if (!validPassword(newPassword)) {
    displayMessage(
      forgotMessage,
      "Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.",
      "error",
    );
    return;
  }

  if (newPassword !== confirmNewPassword) {
    displayMessage(forgotMessage, "Passwords do not match.", "error");
    return;
  }

  if (users[userIndex].password === newPassword) {
    displayMessage(
      forgotMessage,
      "Please choose a different password.",
      "error",
    );
    return;
  }

  const oldPassword = users[userIndex].password;
  users[userIndex].password = newPassword;

  if (!saveUsers()) {
    users[userIndex].password = oldPassword;
    displayMessage(
      forgotMessage,
      "Unable to reset your password. Please try again.",
      "error",
    );
    return;
  }

  forgotForm.reset();

  displayMessage(
    forgotMessage,
    "Password reset successfully! You can now sign in.",
    "success",
  );

  setTimeout(function () {
    showForm("login");
  }, 1500);
});

showForm("login");
