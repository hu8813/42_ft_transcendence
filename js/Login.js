
function handleLogin() {
    console.log("DOMContentLoaded event fired."); // Log to check if DOMContentLoaded event fires
    
    // Add event listener to login form
    const loginForm = document.getElementById("login-form2");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        console.log("Form submission intercepted.");
        e.preventDefault(); // Prevent default form submission behavior
        
        const formData = new FormData(loginForm);
    
        try {
          const response = await fetch("https://pong42.azurewebsites.net/login/", {
            method: "POST",
            body: formData,
          });
        
          const data = await response.text();
          console.log("Login Response:", data); // Log response data
        
          // Handle response accordingly
          if (data.trim() === "Login successful") {
            // Redirect or perform any action on successful login
            localStorage.setItem("isLoggedIn","true");
            window.location.href = "/";
          } else {
            // Handle failed login
            console.error("Login failed:", data);
            // Display an error message or perform any other action
          }
        } catch (error) {
          console.error("Error logging in:", error);
          // Handle error
        }
        
        return false; // Prevent form submission
      });
    } else {
      console.error("Login form not found."); // Log error if login form is not found
    }
  };
  