async function handleLogin(msg) {
    translate(currentLanguage);
    if (msgReg && msgReg === "oauth")
        msgReg = "Error: User already exists. Oauth login is not allowed.";
    if (msgReg && msgReg === "success")
        msgReg = "Registration successful. You can now login.";
    if (msg && msg === "oauth")
        msg = "Error: User already exists. Oauth login is not allowed.";
    if (msg && msg === "success")
        msg = "Registration successful. You can now login.";

    async function check2FACode(username, code) {
        try {
            const csrfToken = await getCSRFCookie();

            const response = await fetch(`/api/check-2fa-code?username=${username}&code=${code}`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check 2FA code');
            }

            const data = await response.json();
            //console.log("2fa code valid", data.valid);
            return data.valid;
        } catch (error) {
            console.error('Error checking 2FA code:', error);
            return false;
        }
    }

    async function check2FAStatus(username) {
        try {

            const csrfToken = await getCSRFCookie();
            //console.log("username", username);
            const response = await fetch(`/api/2fa-status?username=${username}`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch 2FA status');
            }

            const data = await response.json();
            //console.log("2fa enabled", data.enabled);
            return data.enabled;
        } catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    }

    const loginForm = document.getElementById("login-form2");
    const loginStatus = document.getElementById("login-status");
    const submitButton = loginForm.querySelector('[type="submit"]');
    const twoFactorCodeContainer = document.getElementById("2fa-code-container");
    const twoFactorCodeInput = document.getElementById("twoFactorCode");
    if (twoFactorCodeInput)
        twoFactorCodeInput.style.display = "none";
    if (twoFactorCodeContainer)
        twoFactorCodeContainer.style.display = "none";
    if (loginForm) {
        const handleSubmit = async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const username = formData.get("username");

            
            for (const [key, value] of formData.entries()) {
                if (value.length > 50) {
                    loginStatus.textContent = `${key} cannot exceed 50 characters.`;
                    loginStatus.style.color = "red";
                    return;
                }
            }
            const is2FAEnabled = await check2FAStatus(username);
            
            if (is2FAEnabled) {
                if (twoFactorCodeContainer)
                twoFactorCodeContainer.style.display = "block";
                const twoFactorCodeInput = document.getElementById("twoFactorCode");
                if (twoFactorCodeInput)
                    twoFactorCodeInput.style.display = "block";
    
                const twoFactorCode = twoFactorCodeInput.value.trim();

                if (!twoFactorCode) {
                    loginStatus.textContent = "2FA code is required.";
                    loginStatus.style.color = "red";
                    return;
                }

                const is2FACodeValid = await check2FACode(username, twoFactorCode);
                if (!is2FACodeValid) {
                    loginStatus.textContent = "Invalid 2FA code.";
                    loginStatus.style.color = "red";
                    return;
                }
            } else {
                if (twoFactorCodeContainer)
                    twoFactorCodeContainer.style.display = "none";
                if (twoFactorCodeInput)
                    twoFactorCodeInput.style.display = "none";
                loginStatus.textContent = "Check ok.";
                loginStatus.style.color = "green";
            }

            if (submitButton)
                submitButton.disabled = true;

            let csrfToken = await getCSRFCookie();
            try {
                const response = await fetch(`/api/login/`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                });

                const data = await response.json();

                if ('message' in data && data.message === "Login successful") {
                    localStorage.setItem("isLoggedIn", "true");
                    if ('jwt_token' in data) {
                        localStorage.setItem("jwtToken", data.jwt_token);
                    }
                    if ('userLogin' in data) {
                        localStorage.setItem("userLogin", data.userLogin);
                    }
                    if ('userNickname' in data) {
                        localStorage.setItem("userNickname", data.userLogin);
                    }

                    setTimeout(() => {
                        if (submitButton)
                            submitButton.disabled = false;
                        window.location.href = "/#profile";
                    }, 2000);

                } else {

                    if (data.hasOwnProperty('error')) {
                        loginStatus.textContent = data.error;
                        loginStatus.style.color = "red";
                    } else {
                        loginStatus.textContent = "Login failed. Please check your credentials.";
                        loginStatus.style.color = "red";
                    }

                    if (submitButton)
                        submitButton.disabled = false;
                }
            } catch (error) {
                console.error("Error logging in:", error);
                loginStatus.textContent = "Error logging in. Please try again later.";
                loginStatus.style.color = "red";

                if (submitButton)
                    submitButton.disabled = false;
            }

            return false;
        };

        loginForm.addEventListener("submit", handleSubmit);
        if (loginStatus && msgReg && msgReg !== null)
            loginStatus.textContent = msgReg;
        else if (loginStatus && msg)
            loginStatus.textContent = msg;
        setTimeout(() => {
            msgReg = null;
            msg = null;
        }, 5000);
    } else {
        //console.error("Login form not found.");
    }
}
