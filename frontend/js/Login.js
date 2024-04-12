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
                    
              const data = await response.text();
              console.log("Login Response:", data); 
              
              if (data.trim() === "Login successful") {
                  localStorage.setItem("isLoggedIn","true");
                  window.location.href = "/";
              } else {
                  console.error("Login failed:", data);
                  
                  loginStatus.textContent = "Login failed. Please check your credentials.";
              }
          } catch (error) {
              console.error("Error logging in:", error);
              
              loginStatus.textContent = "Error logging in. Please try again later.";
          }
          
          return false; 
      });
  } else {
      console.error("Login form not found."); 
  }
};

