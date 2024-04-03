function handleLogin() {
  console.log("DOMContentLoaded event fired."); 
  
  const loginForm = document.getElementById("login-form2");
  // login-status
  const loginStatus = document.getElementById("login-status");
  
  if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
          console.log("Form submission intercepted.");
          e.preventDefault(); 
          
          const formData = new FormData(loginForm);
      
          try {
              const response = await fetch(`${backendURL}/login/`, {
                  method: "POST",
                  body: formData,
              });
                    
              const data = await response.text();
              console.log("Login Response:", data); 
              
              if (data.trim() === "Login successful") {
                  localStorage.setItem("isLoggedIn","true");
                  window.location.href = "/";
              } else {
                  console.error("Login failed:", data);
                  // Update loginStatus to show login failed message
                  loginStatus.textContent = "Login failed. Please check your credentials.";
              }
          } catch (error) {
              console.error("Error logging in:", error);
              // Update loginStatus to show error message
              loginStatus.textContent = "Error logging in. Please try again later.";
          }
          
          return false; 
      });
  } else {
      console.error("Login form not found."); 
  }
};

