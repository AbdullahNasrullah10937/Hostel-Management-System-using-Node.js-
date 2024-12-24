const studentTable = document.getElementById("studentTable");
const allotForm = document.getElementById("allotForm");
const capacityPanel = document.querySelector(".capacity-panel");
const roomDropdown = document.getElementById("roomNumber");
const loadingIndicator = document.getElementById("loadingIndicator");

let students = [];
let maxCapacity = 50; // Maximum hostel capacity

// Function to render the student table
function renderTable(students) {
  studentTable.innerHTML = ""; // Clear previous table rows
  students.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.room}</td>
      <td>
        <button onclick="confirmRemoveStudent(${index})">Remove</button>
      </td>
    `;
    studentTable.appendChild(row);
  });

  // Update the capacity panel
  updateCapacityPanel();
  populateRoomDropdown();
}

// Function to update the capacity panel
function updateCapacityPanel() {
  const allottedRooms = students.length;
  const availableRooms = maxCapacity - allottedRooms;
  capacityPanel.innerHTML = `
    <p>Max Capacity: <span>${maxCapacity}</span></p>
    <p>Allotted Rooms: <span>${allottedRooms}</span></p>
    <p>Available Rooms: <span>${availableRooms}</span></p>
  `;
}

// Function to populate the room dropdown with available rooms
function populateRoomDropdown() {
  const allottedRoomNumbers = students.map(student => student.room);
  roomDropdown.innerHTML = ""; // Clear previous options

  for (let i = 1; i <= maxCapacity; i++) {
    if (!allottedRoomNumbers.includes(i.toString())) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Room ${i}`;
      roomDropdown.appendChild(option);
    }
  }
}

// Function to show a confirmation box before removing a student
function confirmRemoveStudent(index) {
  const studentId = students[index].id;
  const studentName = students[index].name;

  // Show confirmation box
  if (confirm(`Are you sure you want to remove ${studentName} from the hostel?`)) {
    removeStudent(studentId);
  }
}

// Function to remove a student allotment
function removeStudent(studentId) {
  toggleLoadingIndicator(true); // Show loading indicator
  fetch(`http://localhost:3000/admin/remove-allotment/${studentId}`, { method: "DELETE" })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      fetchAllotedStudents();
    })
    .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while removing the student.");
    })
    .finally(() => toggleLoadingIndicator(false)); // Hide loading indicator
}

// Fetch the allotted students from the server
function fetchAllotedStudents() {
  toggleLoadingIndicator(true); // Show loading indicator
  fetch("http://localhost:3000/admin/view-alloted-students")
    .then(response => response.json())
    .then(data => {
      students = data.students;
      renderTable(students);
    })
    .catch(error => {
      console.error("Error fetching students:", error);
      alert("An error occurred while fetching student data.");
    })
    .finally(() => toggleLoadingIndicator(false)); // Hide loading indicator
}

// Handle allotting a room
allotForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const studentId = document.getElementById("studentId").value.trim();
  const studentName = document.getElementById("studentName").value.trim();
  const roomNumber = document.getElementById("roomNumber").value.trim();

  if (!studentId || !studentName || !roomNumber) {
    alert("Please fill all fields.");
    return;
  }

  // Check if the hostel has reached its capacity
  if (students.length >= maxCapacity) {
    alert("Hostel capacity has been reached. No more rooms available.");
    return;
  }

  const student = { id: studentId, name: studentName, room: roomNumber };

  toggleLoadingIndicator(true); // Show loading indicator
  fetch("http://localhost:3000/admin/allot-room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      fetchAllotedStudents();
      allotForm.reset();
    })
    .catch(error => {
      console.error("Error allotting room:", error);
      alert("An error occurred while allotting the room.");
    })
    .finally(() => toggleLoadingIndicator(false)); // Hide loading indicator
});

// Function to toggle the loading indicator visibility
function toggleLoadingIndicator(show) {
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? "block" : "none";
  }
}

// Initial data fetch
fetchAllotedStudents();
