function handleLogin() {
  
    const loginForm = document.getElementById("login-form2");
    const loginStatus = document.getElementById("login-status");
    const submitButton = loginForm.querySelector('[type="submit"]');
  
    if (loginForm) {
      const handleSubmit = async (e) => {
        e.preventDefault();
  
        // Disable the submit button to prevent multiple submissions
        
        const formData = new FormData(loginForm);
        if (submitButton)
            submitButton.disabled = true;
  
        try {
          const response = await fetch(`${getBackendURL()}/login/`, {
            method: "POST",
            body: formData,
          });
  
        //   if (!response.ok) {
        //     throw new Error('Failed to fetch login');
        //   }
  
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
              if (submitButton)
                submitButton.disabled = false;
              window.location.href = "/";
            }, 5000); // Enable after 5 seconds
  
          } else {
  
            if (data.hasOwnProperty('error')) {
              loginStatus.textContent = data.error;
              loginStatus.style.color = "red";
            } else {
              loginStatus.textContent = "Login failed. Please check your credentials.";
              loginStatus.style.color = "red";
            }
            
            // Re-enable the submit button immediately in case of failure
            if (submitButton)
                submitButton.disabled = false;
          }
        } catch (error) {
          console.error("Error logging in:", error);
          loginStatus.textContent = "Error logging in. Please try again later.";
          loginStatus.style.color = "red";
  
          // Re-enable the submit button immediately in case of error
          if (submitButton)
            submitButton.disabled = false;
        }
  
        return false;
      };
  
      loginForm.addEventListener("submit", handleSubmit);
    } else {
      console.error("Login form not found.");
    }
  }
  