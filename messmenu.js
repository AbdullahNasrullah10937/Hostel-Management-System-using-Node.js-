document.addEventListener("DOMContentLoaded", () => {
    const foodMenuTableBody = document.querySelector("#foodMenuTable tbody");
  
    // Fetch food menu from the server
    fetch("http://localhost:3000/get-food-menu")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch food menu.");
        }
        return response.json();
      })
      .then(menu => {
        if (menu.length === 0) {
          foodMenuTableBody.innerHTML = "<tr><td colspan='3'>No food menu available.</td></tr>";
          return;
        }
  
        menu.forEach(dayMenu => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${dayMenu.day}</td>
            <td>${dayMenu.lunch.name} (Rs. ${dayMenu.lunch.price})</td>
            <td>${dayMenu.dinner.name} (Rs. ${dayMenu.dinner.price})</td>
          `;
          foodMenuTableBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error(error);
        foodMenuTableBody.innerHTML = "<tr><td colspan='3'>Failed to load food menu. Please try again later.</td></tr>";
      });
  
    // Back to Menu button
    document.getElementById("backToMenu").addEventListener("click", () => {
      window.location.href = "userDashboard.html"; // Replace with the actual menu page URL
    });
  });
  