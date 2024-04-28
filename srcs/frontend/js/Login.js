async function handleLogin(msg) {
    translate(currentLanguage);
    let translatedOauthError = await translateKey("oauthError");
    let translatedSuccessMsg = await translateKey("successMsg");
    let max50chars = await translateKey("max50chars");
    let invalidUsername = await translateKey("invalidUsername");
    let invalidPass = await translateKey("invalidPass");
    let need2fa = await translateKey("need2fa");
    let invalid2fa = await translateKey("invalid2fa");
    let loginFailed = await translateKey("loginFailed");
    let errorLogin = await translateKey("errorLogin");

    if (msgReg && msgReg === "oauth")
        msgReg = translatedOauthError;
    if (msgReg && msgReg === "success")
        msgReg = translatedSuccessMsg;
    if (msg && msg === "oauth")
        msg = translatedOauthError;
    if (msg && msg === "success")
        msg = translatedSuccessMsg;

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
            const password = formData.get("password");
            
            
            for (const [key, value] of formData.entries()) {
                if (value.length > 50) {
                    loginStatus.textContent = `${key} ${max50chars}`;
                    loginStatus.style.color = "red";
                    return;
                }
            }
            
            if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
                loginStatus.textContent = `${invalidUsername}`;
                loginStatus.style.color = "red";
                return;
            }
            
            if (!password || /\s/.test(password) || /["'`]/.test(password)) {
                loginStatus.textContent = `${invalidPass}`;
                loginStatus.style.color = "red";
                return;
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
                    loginStatus.textContent = `${need2fa}`;
                    loginStatus.style.color = "red";
                    return;
                }
                
                const is2FACodeValid = await check2FACode(username, twoFactorCode);
                if (!is2FACodeValid) {
                    loginStatus.textContent = `${invalid2fa}`;
                    loginStatus.style.color = "red";
                    return;
                }
                
            } else {
                if (twoFactorCodeContainer)
                    twoFactorCodeContainer.style.display = "none";
                if (twoFactorCodeInput)
                    twoFactorCodeInput.style.display = "none";
                loginStatus.textContent = " ";
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
                        localStorage.setItem("userNickname", data.userNickname);
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
                        loginStatus.textContent = `${loginFailed}`;
                        loginStatus.style.color = "red";
                    }

                    if (submitButton)
                        submitButton.disabled = false;
                }
            } catch (error) {
                console.error("Error logging in:", error);
                loginStatus.textContent = `${errorLogin}`;
                loginStatus.style.color = "red";

                if (submitButton)
                    submitButton.disabled = false;
            }

            return false;
        };
        const usernameElement = document.getElementById("userName");
        const passwordElement = document.getElementById("pwd");
        const usernameTrans = await translateKey("username")
        const passwordTrans = await translateKey("password")
        if (usernameElement)
            usernameElement.placeholder = usernameTrans;
        if (passwordElement)
            passwordElement.placeholder = passwordTrans;
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
