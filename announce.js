const apiUrl = 'http://localhost:3000'; // Change if needed

document.getElementById('announcementForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('announcementId').value;
  const text = document.getElementById('announcementText').value;
  const date = document.getElementById('announcementDate').value;

  try {
    const response = await fetch(`${apiUrl}/save-announcement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text, date }),
    });

    if (response.ok) {
      loadAnnouncements();
      document.getElementById('announcementForm').reset();
    } else {
      console.error('Failed to add announcement:', await response.text());
    }
  } catch (error) {
    console.error('Error while adding announcement:', error);
  }
});

// Function to load announcements from the server
async function loadAnnouncements() {
  try {
    const response = await fetch(`${apiUrl}/get-announcements`);
    const announcements = await response.json();

    const tableBody = document.querySelector('#announcementTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    announcements.forEach((announcement) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${announcement.id}</td>
        <td>${announcement.text}</td>
        <td>${announcement.date}</td>
        <td>
          <button class="remove-btn" data-id="${announcement.id}">Remove</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-id');
        try {
          const response = await fetch(`${apiUrl}/delete-announcement/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            loadAnnouncements();
          } else {
            console.error('Failed to remove announcement:', await response.text());
          }
        } catch (error) {
          console.error('Error while removing announcement:', error);
        }
      });
    });
  } catch (error) {
    console.error('Error while loading announcements:', error);
  }
}

// Load announcements when the page loads
loadAnnouncements();