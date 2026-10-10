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
        signupMessage.textContent = "";
    }

    if (formName === "login") {
        loginView.classList.remove("d-none");
        loginForm.reset();
        loginMessage.textContent = "";
    }

    if (formName === "forgot") {
        forgotView.classList.remove("d-none");
        forgotForm.reset();
        forgotMessage.textContent = "";
    }

    window.scrollTo(0, 0);
}

function showPassword(inputId, button) {
    const passwordInput = document.getElementById(inputId);

    if (!passwordInput) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        button.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        button.textContent = "Show";
    }
}

function displayMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.className = type === "success"
        ? "text-success mt-3"
        : "text-danger mt-3";
}

function validName(name) {
    return /^[\p{L}][\p{L}\s'-]*$/u.test(name.trim());
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{12,}$/.test(password);
}

function passwordMessage() {
    return "Password must contain at least 12 characters, an uppercase letter, a lowercase letter, a number, and a special character.";
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function findUserByEmail(email) {
    return users.find(function (user) {
        return normalizeEmail(user.email) === normalizeEmail(email);
    });
}

function connectLink(id, formName) {
    const link = document.getElementById(id);

    if (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showForm(formName);
        });
    }
}

connectLink("showLogin", "login");
connectLink("showSignup", "signup");
connectLink("showForgot", "forgot");
connectLink("backToLogin", "login");

// CREATE ACCOUNT
signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    users = getUsers();

    const username = document.getElementById("signupUsername").value.trim();
    const email = normalizeEmail(
        document.getElementById("signupEmail").value
    );
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!validName(username)) {
        displayMessage(signupMessage, "Please enter a valid full name.", "error");
        return;
    }

    if (!validEmail(email)) {
        displayMessage(signupMessage, "Please enter a valid email address.", "error");
        return;
    }

    if (findUserByEmail(email)) {
        displayMessage(
            signupMessage,
            "An account with this email already exists. Please sign in.",
            "error"
        );
        return;
    }

    if (!validPassword(password)) {
        displayMessage(signupMessage, passwordMessage(), "error");
        return;
    }

    if (password !== confirmPassword) {
        displayMessage(signupMessage, "Passwords do not match.", "error");
        return;
    }

    const newUser = {
        username: username,
        email: email,
        password: password
    };

    users.push(newUser);

    if (!saveUsers()) {
        users.pop();

        displayMessage(
            signupMessage,
            "Unable to save your account. Please check your browser storage.",
            "error"
        );
        return;
    }

    signupForm.reset();

    displayMessage(
        signupMessage,
        "Account created successfully! Opening Sign In...",
        "success"
    );

    setTimeout(function () {
        showForm("login");

        const loginEmail = document.getElementById("loginEmail");

        if (loginEmail) {
            loginEmail.value = email;
        }

        displayMessage(
            loginMessage,
            "Your account was created successfully. Please sign in.",
            "success"
        );
    }, 1500);
});

// SIGN IN
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    users = getUsers();

    const email = normalizeEmail(
        document.getElementById("loginEmail").value
    );
    const password = document.getElementById("loginPassword").value;

    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
        displayMessage(loginMessage, "Incorrect email or password.", "error");
        return;
    }

    try {
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify({
                username: user.username,
                email: user.email
            })
        );
    } catch (error) {
        displayMessage(
            loginMessage,
            "Unable to complete sign in. Please try again.",
            "error"
        );
        return;
    }

    displayMessage(
        loginMessage,
        "Sign in successful! Welcome, " + user.username + ".",
        "success"
    );

    loginForm.reset();

    setTimeout(function () {
        window.location.href = "home.html";
    }, 1000);
});

// FORGOT PASSWORD
forgotForm.addEventListener("submit", function (event) {
    event.preventDefault();

    users = getUsers();

    const email = normalizeEmail(
        document.getElementById("forgotEmail").value
    );
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    const userIndex = users.findIndex(function (user) {
        return normalizeEmail(user.email) === email;
    });

    if (userIndex === -1) {
        displayMessage(
            forgotMessage,
            "No account was found with this email address.",
            "error"
        );
        return;
    }

    if (!validPassword(newPassword)) {
        displayMessage(forgotMessage, passwordMessage(), "error");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        displayMessage(forgotMessage, "Passwords do not match.", "error");
        return;
    }

    if (users[userIndex].password === newPassword) {
        displayMessage(
            forgotMessage,
            "Please choose a password different from your current password.",
            "error"
        );
        return;
    }

    const oldPassword = users[userIndex].password;

    users[userIndex].password = newPassword;

    if (!saveUsers()) {
        users[userIndex].password = oldPassword;

        displayMessage(
            forgotMessage,
            "Unable to update your password. Please try again.",
            "error"
        );
        return;
    }

    forgotForm.reset();

    displayMessage(
        forgotMessage,
        "Password updated successfully! Opening Sign In...",
        "success"
    );

    setTimeout(function () {
        showForm("login");

        const loginEmail = document.getElementById("loginEmail");

        if (loginEmail) {
            loginEmail.value = email;
        }

        displayMessage(
            loginMessage,
            "Your password has been updated. Please sign in.",
            "success"
        );
    }, 1500);
});

// SHOW SIGN IN WHEN THE WEBSITE FIRST OPENS
showForm("login");