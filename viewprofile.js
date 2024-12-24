document.getElementById("viewProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");
    const profileTable = document.getElementById("profileTable");
  
    errorMessage.textContent = "";
    profileTable.style.display = "none";
  
    try {
      const response = await fetch("http://localhost:3000/view-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        document.getElementById("username").textContent = data.username;
        document.getElementById("userPassword").textContent = data.password;
        document.getElementById("cnic").textContent = data.cnic;
        document.getElementById("role").textContent = data.role;
        document.getElementById("gender").textContent = data.gender;
        profileTable.style.display = "table";
      } else {
        const errorData = await response.json();
        errorMessage.textContent = errorData.error || "An unknown error occurred.";
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessage.textContent = "Failed to connect to the server.";
    }
  });
  