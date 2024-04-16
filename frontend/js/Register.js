function handleRegister() {
    
    Promise.all([
        translateKey('auth.email'),
        translateKey('auth.username'),
        translateKey('auth.password'),
        translateKey('auth.confirmPassword'),
        translateKey('auth.passwordMismatch'),
        translateKey('auth.register-status'), 
    ]).then(([emailPlaceholderTranslation, usernamePlaceholderTranslation, passwordPlaceholderTranslation, confirmPasswordPlaceholderTranslation, passwordMismatchTranslation, registerStatusTranslation]) => {
        document.getElementById("enterEmail").setAttribute('placeholder', emailPlaceholderTranslation);
        document.getElementById("enterUsername").setAttribute('placeholder', usernamePlaceholderTranslation);
        document.getElementById("enterPassword").setAttribute('placeholder', passwordPlaceholderTranslation);
        document.getElementById("confirmPasswordP").setAttribute('placeholder', confirmPasswordPlaceholderTranslation);
        document.getElementById("register-status").textContent = registerStatusTranslation;
        document.getElementById("email").setAttribute('for', 'enterEmail');
        document.getElementById("username").setAttribute('for', 'enterUsername');
        document.getElementById("password").setAttribute('for', 'enterPassword');
        document.getElementById("confirmPassword").setAttribute('for', 'confirmPasswordP');

        document.getElementById("register-form").addEventListener("submit", function(event) {
            event.preventDefault(); 
    
            
            const email = document.getElementById("enterEmail").value;
            const username = document.getElementById("enterUsername").value;
            const password = document.getElementById("enterPassword").value;
            const confirmPassword = document.getElementById("confirmPasswordP").value;
            
            
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
    return response.json();
})
.then(data => {
    if (data.hasOwnProperty('error')) {
    document.getElementById("register-status").textContent = data.error;
    document.getElementById("register-status").style.color = "red";
 
} else if (data.hasOwnProperty('message')) {
            document.getElementById("register-status").textContent = data.message;  
            document.getElementById("register-status").style.color = "green";
            setTimeout(() => {
            window.location.href = "/#login";
            }, 2000);
        }  
})
            .catch(error => {
                console.error("Error registering:", error);
                document.getElementById("register-status").textContent = "Error registering "+error;
            });
        });
    }).catch(error => {
        console.error("Error fetching translations:", error);
    });
}
