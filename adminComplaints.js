const apiUrl = 'http://localhost:3000'; // Update if needed

// Function to load complaints from the server
async function loadComplaints() {
  try {
    const response = await fetch(`${apiUrl}/get-complaints`);
    if (!response.ok) throw new Error('Failed to fetch complaints.');

    const complaints = await response.json();
    const tableBody = document.querySelector('#complaintTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    complaints.forEach((complaint) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${complaint.id}</td>
        <td>${complaint.text}</td>
        <td>
          <button class="respond-btn" data-id="${complaint.id}">Respond</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners to respond buttons
    document.querySelectorAll('.respond-btn').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('complaintId').value = button.getAttribute('data-id');
      });
    });
  } catch (error) {
    console.error('Error while loading complaints:', error);
    alert('Failed to load complaints. Please try again.');
  }
}

// Submit response
document.getElementById('responseForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('complaintId').value.trim();
  const responseText = document.getElementById('responseText').value.trim();

  if (!id || !responseText) {
    alert('Please fill in both Complaint ID and Response text.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/respond-to-complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, responseText }),
    });

    if (response.ok) {
      alert('Response submitted successfully!');
      document.getElementById('responseForm').reset(); // Clear form
      await loadComplaints(); // Reload complaints table
    } else {
      const errorText = await response.text();
      console.error('Failed to submit response:', errorText);
      alert(`Error: ${errorText}`);
    }
  } catch (error) {
    console.error('Error while submitting response:', error);
    alert('Failed to submit response. Please try again.');
  }
});

// Load complaints on page load
loadComplaints();
