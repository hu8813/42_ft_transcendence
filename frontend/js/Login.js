
function handleLogin() {
    console.log("DOMContentLoaded event fired."); 
    

    const loginForm = document.getElementById("login-form2");
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

          }
        } catch (error) {
          console.error("Error logging in:", error);

        }
        
        return false; 
      });
    } else {
      console.error("Login form not found."); 
    }
  };
  