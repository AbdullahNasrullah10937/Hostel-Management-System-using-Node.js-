document.addEventListener('DOMContentLoaded', () => {
    const roomsTable = document.getElementById('roomsTable').getElementsByTagName('tbody')[0];
  
    // Fetch data from the server and populate the table
    async function fetchRooms() {
      try {
        const response = await fetch('http://localhost:3000/get-students');
        if (!response.ok) throw new Error('Failed to fetch room data.');
        const data = await response.json();
  
        data.students.forEach(student => {
          const row = roomsTable.insertRow();
          const idCell = row.insertCell(0);
          const nameCell = row.insertCell(1);
          const roomCell = row.insertCell(2);
  
          idCell.textContent = student.id;
          nameCell.textContent = student.name;
          roomCell.textContent = student.room;
        });
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    }
  
    // Fetch and display rooms on page load
    fetchRooms();
  });
  