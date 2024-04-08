function handleRegister() {
    // Get translated placeholder values
    Promise.all([
        translateKey('auth.email'),
        translateKey('auth.username'),
        translateKey('auth.password'),
        translateKey('auth.confirmPassword'),
        translateKey('auth.passwordMismatch'), // Translation for password mismatch error message
    ]).then(([emailPlaceholderTranslation, usernamePlaceholderTranslation, passwordPlaceholderTranslation, confirmPasswordPlaceholderTranslation, passwordMismatchTranslation]) => {
        // Set translated placeholder values to respective fields
        document.getElementById("enterEmail").setAttribute('placeholder', emailPlaceholderTranslation);
        document.getElementById("enterUsername").setAttribute('placeholder', usernamePlaceholderTranslation);
        document.getElementById("enterPassword").setAttribute('placeholder', passwordPlaceholderTranslation);
        document.getElementById("confirmPasswordP").setAttribute('placeholder', confirmPasswordPlaceholderTranslation);

        // Update label's for attribute dynamically
        document.getElementById("email").setAttribute('for', 'enterEmail');
        document.getElementById("username").setAttribute('for', 'enterUsername');
        document.getElementById("password").setAttribute('for', 'enterPassword');
        document.getElementById("confirmPassword").setAttribute('for', 'confirmPasswordP');

        // Add event listener to handle form submission
        document.getElementById("register-form").addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default form submission

            // Get form field values
            const email = document.getElementById("enterEmail").value;
            const username = document.getElementById("username").value;
            const password = document.getElementById("enterPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Check if passwords match
            if (password !== confirmPassword) {
                document.getElementById("password-mismatch-feedback").style.display = "block";
                document.getElementById("password-mismatch-feedback").textContent = passwordMismatchTranslation;
                return;
            } else {
                document.getElementById("password-mismatch-feedback").style.display = "none";
            }

            // Perform registration process
            const formData = new FormData();
            formData.append("email", email);
            formData.append("username", username);
            formData.append("password", password);
            formData.append("confirm_password", password);

            fetch(`${getBackendURL()}/register/`, {
                method: "POST",
                body: formData,
            })
            .then(response => response.text())
            .then(data => {
                // Handle response
            })
            .catch(error => {
                console.error("Error registering:", error);
                document.getElementById("register-status").textContent = "Error registering";
            });
        });
    }).catch(error => {
        console.error("Error fetching translations:", error);
    });
}
