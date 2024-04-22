async function handleRegister() {
    const jwtToken = localStorage.getItem('jwtToken');
    const csrfToken = await getCSRFCookie(); 

    Promise.all([
        translateKey('email'),
        translateKey('username'),
        translateKey('password'),
        translateKey('confirmPassword'),
        translateKey('register-status'), 
    ]).then(([emailPlaceholderTranslation, usernamePlaceholderTranslation, passwordPlaceholderTranslation, confirmPasswordPlaceholderTranslation, registerStatusTranslation]) => {
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
            
            
            if (username.length > 50 || email.length > 50 || password.length > 50 || confirmPassword.length > 50) {
                alert('One or more input values exceed the maximum allowed length of 50 characters.');
                return;
            }

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

            fetch(`/api/register/`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRFToken': csrfToken
                },
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
                        window.location.href = "/#login?m=success";
                    }, 1000);
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
