document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission
  
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const cnic = document.getElementById("cnic").value.trim();
  const gender = document.getElementById("gender").value;

  if (!username || !password || !cnic || !gender) {
    alert("Please fill in all fields.");
    return;
  }

  console.log("Sending data:", { username, password, cnic, gender });

  // Send data to server
  fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, cnic, gender }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Signup successful");
        alert("Signup successful. Redirecting to login...");
        window.location.href = "login.html"; // Redirect to login page
      } else {
        response.text().then((text) => {
          console.error("Error response:", text);
          alert(`Signup failed: ${text}`);
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred during signup. Please try again.");
    });
});
