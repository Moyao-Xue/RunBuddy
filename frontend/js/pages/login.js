const loginForm = document.getElementById("loginForm");
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const errorMessage = document.getElementById("errorMessage");
        const fillDemoBtn = document.getElementById("fillDemoBtn");
        const guestBtn = document.getElementById("guestBtn");

        const DEMO_PASSWORD = "123456";

        function saveSession(username, mode) {
            localStorage.setItem("runbuddyUser", username);
            localStorage.setItem("runbuddyAuthMode", mode);
            localStorage.setItem("runbuddyLoggedInAt", new Date().toISOString());
        }

        function goHome() {
            window.location.href = "home.html";
        }

        fillDemoBtn.addEventListener("click", () => {
            usernameInput.value = "runner_mia";
            passwordInput.value = DEMO_PASSWORD;
            errorMessage.textContent = "";
            usernameInput.focus();
        });

        guestBtn.addEventListener("click", () => {
            saveSession("Guest Runner", "guest");
            goHome();
        });

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username) {
                errorMessage.textContent = "Please enter a username.";
                usernameInput.focus();
                return;
            }

            if (!password) {
                errorMessage.textContent = "Please enter a password.";
                passwordInput.focus();
                return;
            }

            if (password !== DEMO_PASSWORD) {
                errorMessage.textContent = "Demo login failed. Try password 123456.";
                passwordInput.focus();
                passwordInput.select();
                return;
            }

            errorMessage.textContent = "";
            saveSession(username, "demo");
            goHome();
        });
