const apiUrl = 'http://localhost:3000';

document.getElementById('ruleForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('ruleId').value;
  const text = document.getElementById('ruleText').value;

  try {
    const response = await fetch(`${apiUrl}/save-rule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text }),
    });

    if (response.ok) {
      loadRules();
      document.getElementById('ruleForm').reset();
    } else {
      console.error('Failed to add rule:', await response.text());
    }
  } catch (error) {
    console.error('Error while adding rule:', error);
  }
});

// Function to load rules from the server
async function loadRules() {
  try {
    const response = await fetch(`${apiUrl}/get-rules`);
    const rules = await response.json();

    const tableBody = document.querySelector('#ruleTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    rules.forEach((rule) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${rule.id}</td>
        <td>${rule.text}</td>
        <td>
          <button class="remove-btn" data-id="${rule.id}">Remove</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-id');
        try {
          const response = await fetch(`${apiUrl}/delete-rule/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            loadRules();
          } else {
            console.error('Failed to remove rule:', await response.text());
          }
        } catch (error) {
          console.error('Error while removing rule:', error);
        }
      });
    });
  } catch (error) {
    console.error('Error while loading rules:', error);
  }
}

// Load rules when the page loads
loadRules();
