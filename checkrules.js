document.addEventListener("DOMContentLoaded", () => {
    const rulesList = document.getElementById("rulesList");
  
    // Fetch rules from the server
    fetch("http://localhost:3000/get-rules")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch rules.");
        }
        return response.json();
      })
      .then(rules => {
        if (rules.length === 0) {
          rulesList.innerHTML = "<p>No rules found.</p>";
          return;
        }
  
        rules.forEach(rule => {
          const ruleElement = document.createElement("p");
          ruleElement.textContent = `${rule.id}. ${rule.text}`;
          rulesList.appendChild(ruleElement);
        });
      })
      .catch(error => {
        console.error(error);
        rulesList.innerHTML = "<p>Failed to load rules. Please try again later.</p>";
      });
  
    // Back to Menu button
    document.getElementById("backToMenu").addEventListener("click", () => {
      window.location.href = "userDashboard.html"; // Replace with the actual menu page URL
    });
  });
  