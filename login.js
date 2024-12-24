const adminCredentials = {
  username: "Abdullah",
  password: "123",
};

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (role === "admin") {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      window.location.href = "adminDashboard.html";
    } else {
      alert("Invalid Admin Credentials");
    }
  } else if (role === "user") {
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "userDashboard.html";
        } else {
          alert("Invalid User Credentials");
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Please select a role");
  }
});
