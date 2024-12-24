document.addEventListener("DOMContentLoaded", () => {
    const announcementList = document.getElementById("announcementList");
  
    // Fetch announcements from the server
    fetch("http://localhost:3000/get-announcements")
      .then(response => response.json())
      .then(announcements => {
        // Populate announcements dynamically
        announcements.forEach(announcement => {
          const card = document.createElement("div");
          card.classList.add("announcement-card");
  
          card.innerHTML = `
            <div class="announcement-date">${announcement.date}</div>
            <div class="announcement-text">${announcement.text}</div>
          `;
          announcementList.appendChild(card);
        });
      })
      .catch(error => {
        console.error("Error fetching announcements:", error);
        announcementList.innerHTML = `<p style="color: red;">Failed to load announcements.</p>`;
      });
  });
  document.getElementById("backToMenu").addEventListener("click", () => {
    window.location.href = "userDashboard.html"; // Replace with the actual menu page URL
  });
  