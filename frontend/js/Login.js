function handleLogin() {
  
    const loginForm = document.getElementById("login-form2");
    const loginStatus = document.getElementById("login-status");
    const submitButton = loginForm.querySelector('[type="submit"]');
  
    if (loginForm) {
      const handleSubmit = async (e) => {
        e.preventDefault();
  
        // Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;
  
        const formData = new FormData(loginForm);
  
        try {
          const response = await fetch(`${getBackendURL()}/login/`, {
            method: "POST",
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch login');
          }
  
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
            if ('email' in data) {
              localStorage.setItem("userEmail", data.email);
            }
            if ('score' in data) {
              localStorage.setItem("userScore", data.score);
            }
            if ('image_link' in data) {
              localStorage.setItem("userImage", data.image_link);
            }
  
            setTimeout(() => {
              // Re-enable the submit button after a delay
              submitButton.disabled = false;
              window.location.href = "/";
            }, 5000); // Enable after 5 seconds
  
          } else {
            console.error("Login failed:", data);
  
            if (data.hasOwnProperty('error')) {
              loginStatus.textContent = data.error;
            } else {
              loginStatus.textContent = "Login failed. Please check your credentials.";
            }
            
            // Re-enable the submit button immediately in case of failure
            submitButton.disabled = false;
          }
        } catch (error) {
          console.error("Error logging in:", error);
          loginStatus.textContent = "Error logging in. Please try again later.";
  
          // Re-enable the submit button immediately in case of error
          submitButton.disabled = false;
        }
  
        return false;
      };
  
      loginForm.addEventListener("submit", handleSubmit);
    } else {
      console.error("Login form not found.");
    }
  }
  