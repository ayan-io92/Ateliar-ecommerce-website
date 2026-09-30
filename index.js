const signupView = document.getElementById("signupView");
const loginView = document.getElementById("loginView");
const forgotView = document.getElementById("forgotView");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const forgotForm = document.getElementById("forgotForm");

const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");
const showForgot = document.getElementById("showForgot");
const backToLogin = document.getElementById("backToLogin");
let users = JSON.parse(localStorage.getItem("users")) || [];

function showForm(formName) {
  signupView.classList.add("d-none");
  loginView.classList.add("d-none");
  forgotView.classList.add("d-none");

  if (formName === "signup") {
    signupView.classList.remove("d-none");
  }

  if (formName === "login") {
    loginView.classList.remove("d-none");
  }

  if (formName === "forgot") {
    forgotView.classList.remove("d-none");
  }
}

showSignup.addEventListener("click", function (e) {
  e.preventDefault();
  showForm("signup");
});

showLogin.addEventListener("click", function (e) {
  e.preventDefault();
  showForm("login");
});

showForgot.addEventListener("click", function (e) {
  e.preventDefault();
  showForm("forgot");
});

backToLogin.addEventListener("click", function (e) {
  e.preventDefault();
  showForm("login");
});

document.querySelectorAll(".toggle-password").forEach(function (icon) {
  icon.addEventListener("click", function () {
    const inputId = icon.getAttribute("data-target");
    const input = document.getElementById(inputId);

    if (input.type === "password") {
      input.type = "text";

      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";

      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  users = JSON.parse(localStorage.getItem("users")) || [];

  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  const message = document.getElementById("signupMessage");

  if (username.length < 2) {
    message.textContent = "Please enter a valid name.";
    message.style.color = "#dc3545";
    return;
  }

  const existingUser = users.find(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  });

  if (existingUser) {
    message.textContent = "An account with this email already exists.";
    message.style.color = "#dc3545";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password must be at least 6 characters.";
    message.style.color = "#dc3545";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.style.color = "#dc3545";
    return;
  }

  const newUser = {
    username: username,
    email: email,
    password: password,
  };

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  message.textContent = "Account created successfully.";
  message.style.color = "#28a745";

  signupForm.reset();

  setTimeout(function () {
    message.textContent = "";
    showForm("login");

    document.getElementById("loginEmail").value = email;
  }, 1200);
});

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  users = JSON.parse(localStorage.getItem("users")) || [];

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const message = document.getElementById("loginMessage");

  const user = users.find(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  });

  if (!user) {
    message.textContent = "This email does not exist.";
    message.style.color = "#dc3545";
    return;
  }

  if (user.password !== password) {
    message.textContent = "Invalid email or password.";
    message.style.color = "#dc3545";
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));

  message.textContent = "Login successful.";
  message.style.color = "#28a745";

  loginForm.reset();

  setTimeout(function () {
    message.textContent = "";
    window.location.href = "style.html";
  }, 1000);
});

forgotForm.addEventListener("submit", function (e) {
  e.preventDefault();

  users = JSON.parse(localStorage.getItem("users")) || [];

  const email = document.getElementById("forgotEmail").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  const message = document.getElementById("forgotMessage");

  const userIndex = users.findIndex(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  });

  if (userIndex === -1) {
    message.textContent = "Email address not found.";
    message.style.color = "#dc3545";
    return;
  }

  if (newPassword.length < 6) {
    message.textContent = "Password must be at least 6 characters.";
    message.style.color = "#dc3545";
    return;
  }

  if (newPassword !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.style.color = "#dc3545";
    return;
  }

  users[userIndex].password = newPassword;

  localStorage.setItem("users", JSON.stringify(users));

  message.textContent = "Password reset successfully.";
  message.style.color = "#28a745";

  forgotForm.reset();

  setTimeout(function () {
    message.textContent = "";
    showForm("login");

    document.getElementById("loginEmail").value = email;
  }, 1200);
});
