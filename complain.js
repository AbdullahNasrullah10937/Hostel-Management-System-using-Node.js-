const apiUrl = 'http://localhost:3000';

// Load complaints
async function loadComplaints() {
  try {
    const response = await fetch(`${apiUrl}/get-complaints`);
    const complaints = await response.json();

    const tableBody = document.getElementById('complaintTable');
    tableBody.innerHTML = ''; // Clear existing rows

    if (complaints.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3">No complaints found.</td></tr>';
      return;
    }

    complaints.forEach(({ id, text }) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${id}</td>
        <td>${text}</td>
        <td>
          <button class="delete-btn" data-id="${id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-id');
        await deleteComplaint(id);
        loadComplaints();
      });
    });
  } catch (error) {
    console.error('Error loading complaints:', error);
  }
}

// Submit complaint
document.getElementById('complaintForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('userId').value.trim();
  const text = document.getElementById('userComplaint').value.trim();

  try {
    const response = await fetch(`${apiUrl}/submit-complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text }),
    });

    if (response.ok) {
      alert('Complaint submitted successfully!');
      document.getElementById('complaintForm').reset();
      loadComplaints();
    } else {
      alert('Error submitting complaint.');
    }
  } catch (error) {
    console.error('Error submitting complaint:', error);
  }
});

// Delete complaint
async function deleteComplaint(id) {
  try {
    const response = await fetch(`${apiUrl}/delete-complaint/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      alert('Error deleting complaint.');
    }
  } catch (error) {
    console.error('Error deleting complaint:', error);
  }
}

// Load complaints on page load
loadComplaints();
