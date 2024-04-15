function handleLogin() {
  console.log("DOMContentLoaded event fired."); 
  
  const loginForm = document.getElementById("login-form2");
  
  const loginStatus = document.getElementById("login-status");
  
  if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
          console.log("Form submission intercepted.");
          e.preventDefault(); 
          
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
                if ('login' in data) {
                    localStorage.setItem("userLogin", data.login);
                }
                if ('nickname' in data) {
                    localStorage.setItem("userNickname", data.nickname);
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
                    window.location.href = "/";
                }, 1000);
            } else {
                console.error("Login failed:", data);
        
                if (data.hasOwnProperty('error')) {
                    loginStatus.textContent = data.error;
                } else {
                    loginStatus.textContent = "Login failed. Please check your credentials.";
                }
            }
          } catch (error) {
              
              loginStatus.textContent = "Error logging in. Please try again later.";
          }
          
          return false; 
      });
  } else {
      console.error("Login form not found."); 
  }
};

