function handleRegister() {
    // Get translated placeholder values
    Promise.all([
        translateKey('auth.email'),
        translateKey('auth.username'),
        translateKey('auth.password'),
        translateKey('auth.confirmPassword'),
        translateKey('auth.passwordMismatch'), // Translation for password mismatch error message
    ]).then(([emailPlaceholderTranslation, usernamePlaceholderTranslation, passwordPlaceholderTranslation, confirmPasswordPlaceholderTranslation, passwordMismatchTranslation]) => {
        document.getElementById("enterEmail").setAttribute('placeholder', emailPlaceholderTranslation);
        document.getElementById("enterUsername").setAttribute('placeholder', usernamePlaceholderTranslation);
        document.getElementById("enterPassword").setAttribute('placeholder', passwordPlaceholderTranslation);
        document.getElementById("confirmPasswordP").setAttribute('placeholder', confirmPasswordPlaceholderTranslation);

        document.getElementById("email").setAttribute('for', 'enterEmail');
        document.getElementById("username").setAttribute('for', 'enterUsername');
        document.getElementById("password").setAttribute('for', 'enterPassword');
        document.getElementById("confirmPassword").setAttribute('for', 'confirmPasswordP');

        document.getElementById("register-form").addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default form submission
    
            // Get form field values
            const email = document.getElementById("enterEmail").value;
            const username = document.getElementById("enterUsername").value;
            const password = document.getElementById("enterPassword").value;
            const confirmPassword = document.getElementById("confirmPasswordP").value;
            
            // Check if passwords match
            if (password !== confirmPassword) {
                document.getElementById("password-mismatch-feedback").style.display = "block";
                document.getElementById("password-mismatch-feedback").textContent = "Passwords do not match.";
                return;
            } else {
                document.getElementById("password-mismatch-feedback").style.display = "none";
            }
    

            const formData = new FormData();
formData.append("email", email);
formData.append("username", username);
formData.append("password", password);
formData.append("confirm_password", confirmPassword);


fetch(`${getBackendURL()}/register/`, {
    method: "POST",
    body: formData,
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    document.getElementById("register-status").textContent = data.message;
    setTimeout(() => {
        window.location.href = "/login";
    }, 2000);
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
