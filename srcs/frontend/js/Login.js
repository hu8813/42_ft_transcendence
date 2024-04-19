function handleLogin() {
  const loginForm = document.getElementById("login-form2");
  const loginStatus = document.getElementById("login-status");
  const submitButton = loginForm.querySelector('[type="submit"]');

  if (loginForm) {
      const handleSubmit = async (e) => {
          e.preventDefault();

          const formData = new FormData(loginForm);

          for (const [key, value] of formData.entries()) {
              if (value.length > 50) {
                  loginStatus.textContent = `${key} cannot exceed 50 characters.`;
                  loginStatus.style.color = "red";
                  return;
              }
          }

          if (submitButton)
              submitButton.disabled = true;
          let csrfToken = await getCSRFCookie();
          try {
              const response = await fetch(`${getBackendURL()}/login/`, {
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
  } else {
      console.error("Login form not found.");
  }
}
