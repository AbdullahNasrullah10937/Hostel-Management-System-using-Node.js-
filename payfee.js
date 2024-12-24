document.getElementById("checkFee").addEventListener("click", () => {
    const userId = document.getElementById("userId").value.trim();
    const userName = document.getElementById("userName").value.trim();
  
    if (!userId || !userName) {
      alert("Please enter both User ID and Name.");
      return;
    }
  
    fetch(`http://localhost:3000/get-fee/${userId}/${userName}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          document.getElementById("statusMessage").textContent = data.error;
          document.getElementById("feeDetails").style.display = "none";
        } else {
          document.getElementById("feeAmount").textContent = `Rs. ${data.fee}`;
          document.getElementById("feeDetails").style.display = "block";
          document.getElementById("statusMessage").textContent = "";
        }
      })
      .catch((error) => {
        console.error("Error fetching fee:", error);
      });
  });
  
  document.getElementById("payFee").addEventListener("click", () => {
    const userId = document.getElementById("userId").value.trim();
    const userName = document.getElementById("userName").value.trim();
    const accountNumber = document.getElementById("accountNumber").value.trim();
  
    if (!accountNumber) {
      alert("Please enter your Account Number.");
      return;
    }
  
    fetch(`http://localhost:3000/pay-fee/${userId}/${userName}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("statusMessage").textContent = data.message;
        document.getElementById("feeDetails").style.display = "none";
      })
      .catch((error) => {
        console.error("Error paying fee:", error);
      });
  });
  