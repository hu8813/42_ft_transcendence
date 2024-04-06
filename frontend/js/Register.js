function handleRegister(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Check if passwords match
    if (password !== confirmPassword) {
        document.getElementById("password-mismatch-feedback").style.display = "block";
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
        if (data.includes("Error occurred")) {
            const errorMessage = data.substring(data.indexOf(":") + 1).trim();
            if (errorMessage.includes("already exists")) {
                document.getElementById("register-status").textContent = "Username already exists. Please choose a different one.";
            } else {
                document.getElementById("register-status").textContent = errorMessage;
            }
        } else {
            document.getElementById("register-status").textContent = data.trim();
            localStorage.setItem("isLoggedIn", true);
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("confirm-password").value = "";
            document.getElementById("password-mismatch-feedback").style.display = "none";
            document.querySelector(".register-container").innerHTML = `
                <div class="register-success text-center">
                    <h3>Registration Successful!</h3>
                    <p>Redirecting to login page...</p>
                </div>
            `;
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        }
    })
    .catch(error => {
        console.error("Error registering:", error);
        document.getElementById("register-status").textContent = "Error registering";
    });
}
