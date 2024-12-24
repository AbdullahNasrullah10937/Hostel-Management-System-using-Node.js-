document.addEventListener('DOMContentLoaded', () => {
    const studentsDropdown = document.getElementById('students');
    const uploadFeeBtn = document.getElementById('uploadFeeBtn');
    const feeInput = document.getElementById('fee');
    const responseMessage = document.getElementById('responseMessage');
  
    // Fetch students and populate the dropdown
    async function fetchStudents() {
      try {
        const response = await fetch('http://localhost:3000/get-students');
        if (!response.ok) throw new Error('Failed to fetch students.');
        const data = await response.json();
        data.students.forEach(student => {
          const option = document.createElement('option');
          option.value = `${student.id},${student.name},${student.room}`;
          option.textContent = `${student.name} (Room: ${student.room})`;
          studentsDropdown.appendChild(option);
        });
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    }
  
    // Upload fee for the selected student
    async function uploadFee() {
      const student = studentsDropdown.value;
      const fee = feeInput.value;
  
      if (!student || !fee) {
        responseMessage.textContent = 'Please select a student and enter a valid fee amount.';
        responseMessage.style.color = 'red';
        return;
      }
  
      try {
        const response = await fetch('http://localhost:3000/update-fee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ student, fee }),
        });
  
        const result = await response.json();
        if (response.ok) {
          responseMessage.textContent = result.message;
          responseMessage.style.color = 'green';
          feeInput.value = '';
          studentsDropdown.value = '';
        } else {
          responseMessage.textContent = result.message || 'Error uploading fee.';
          responseMessage.style.color = 'red';
        }
      } catch (error) {
        console.error('Error uploading fee:', error);
        responseMessage.textContent = 'An unexpected error occurred.';
        responseMessage.style.color = 'red';
      }
    }
  
    // Event listener for the upload button
    uploadFeeBtn.addEventListener('click', uploadFee);
  
    // Fetch students on page load
    fetchStudents();
  });
  