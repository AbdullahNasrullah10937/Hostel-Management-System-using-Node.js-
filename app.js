const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

const cors = require('cors');
app.use(cors());

// Maximum capacity of the hostel
const MAX_CAPACITY = 50;

// Helper function to read a file and parse its contents
function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return resolve(''); // Return empty string if file doesn't exist
        }
        return reject(err);
      }
      resolve(data);
    });
  });
}

// Helper function to append data to a file
function appendToFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, data, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Existing Signup Route
app.post('/signup', (req, res) => {
  const { username, password, cnic, gender } = req.body;

  console.log("Signup request received with data:", req.body);

  // Validate input
  if (!username || !password || !cnic || !gender) {
    console.error("Missing fields in signup data");
    return res.status(400).send('All fields are required.');
  }

  // Check if username already exists
  readFile('data.txt')
    .then((data) => {
      const users = data ? data.split('\n').filter(Boolean) : [];
      const userExists = users.some((user) => {
        const [savedUsername] = user.split(',');
        return savedUsername === username;
      });

      if (userExists) {
        console.error("Username already exists:", username);
        return res.status(400).send('Username already exists.');
      }

      const userData = `${username},${password},${cnic},user,${gender}\n`;
      return appendToFile('data.txt', userData);
    })
    .then(() => {
      console.log("User registered successfully:", username);
      res.status(201).send('Signup successful');
    })
    .catch((err) => {
      console.error('Error processing signup:', err);
      res.status(500).send('Server error');
    });
});

// Existing Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  readFile('data.txt')
    .then((data) => {
      const users = data ? data.split('\n').filter(Boolean) : [];
      const userFound = users.some((user) => {
        const [savedUsername, savedPassword] = user.split(',');
        return savedUsername === username && savedPassword === password;
      });

      if (userFound) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    })
    .catch((err) => {
      console.error('Error processing login:', err);
      res.status(500).send('Server error');
    });
});

// Admin-Specific Endpoints
app.get('/admin/announcement', (req, res) => {
  res.send('<h1>Announcement</h1><p>Admin can make announcements here.</p>');
});

app.get('/admin/define-rules', (req, res) => {
  res.send('<h1>Define Rules</h1><p>Admin can define hostel rules here.</p>');
});

app.get('/admin/view-student-details', (req, res) => {
  readFile('data.txt')
    .then((data) => {
      const users = data ? data.split('\n').filter(Boolean) : [];
      const studentDetails = users
        .map((user) => {
          const [username, , cnic, role, gender] = user.split(',');
          if (role === 'user') {
            return `<p>Username: ${username}, CNIC: ${cnic}, Gender: ${gender}</p>`;
          }
        })
        .filter(Boolean)
        .join('');

      res.send(`<h1>Student Details</h1>${studentDetails || '<p>No students found.</p>'}`);
    })
    .catch((err) => {
      console.error('Error fetching student details:', err);
      res.status(500).send('Server error');
    });
});

// **Hostel Management Routes**

let allottedStudents = [];

// Endpoint to get all allotted students
app.get('/admin/view-alloted-students', (req, res) => {
  readFile('allot.txt')
    .then((data) => {
      allottedStudents = data ? data.split('\n').filter(Boolean).map(line => {
        const [id, name, room] = line.split(',');
        return { id, name, room };
      }) : [];

      res.json({ students: allottedStudents });
    })
    .catch((err) => {
      console.error('Error reading allotments:', err);
      res.status(500).send('Server error');
    });
});





// Endpoint to allot room to a student
app.post('/admin/allot-room', async (req, res) => {
  const { id, name, room } = req.body;

  // Validate input
  if (!id || !name || !room) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    // Reload allottedStudents from the file
    const data = await readFile('allot.txt');
    allottedStudents = data
      ? data.split('\n').filter(Boolean).map(line => {
          const [studentId, studentName, studentRoom] = line.split(',');
          return { id: studentId, name: studentName, room: studentRoom };
        })
      : [];

    // Check if the hostel is at maximum capacity
    if (allottedStudents.length >= MAX_CAPACITY) {
      return res.status(400).send({ message: 'Hostel is at maximum capacity' });
    }

    // Check if room or student ID is already allotted
    const roomAlreadyAllotted = allottedStudents.some(student => student.room === room);
    const idAlreadyExists = allottedStudents.some(student => student.id === id);

    if (roomAlreadyAllotted) {
      return res.status(400).send({ message: 'Room is already allotted to another student' });
    }

    if (idAlreadyExists) {
      return res.status(400).send({ message: 'Student ID already exists' });
    }

    // Append new allotment
    const newAllotment = `${id},${name},${room}\n`;
    await appendToFile('allot.txt', newAllotment);

    allottedStudents.push({ id, name, room });
    res.status(201).send({ message: 'Room allotted successfully' });
  } catch (err) {
    console.error('Error allotting room:', err);
    res.status(500).send('Server error');
  }
});



// Endpoint to remove a student allotment
app.delete('/admin/remove-allotment/:studentId', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // Reload allottedStudents from the file
    const data = await readFile('allot.txt');
    allottedStudents = data
      ? data.split('\n').filter(Boolean).map(line => {
          const [id, name, room] = line.split(',');
          return { id, name, room };
        })
      : [];

    // Filter out the student to remove
    const updatedAllotments = allottedStudents.filter(student => student.id !== studentId);

    if (updatedAllotments.length === allottedStudents.length) {
      return res.status(404).send({ message: 'Student not found' });
    }

    // Write updated allotments to the file
    const updatedData = updatedAllotments.map(student => `${student.id},${student.name},${student.room}`).join('\n');
    await fs.promises.writeFile('allot.txt', updatedData);

    allottedStudents = updatedAllotments;
    res.status(200).send({ message: 'Allotment removed successfully' });
  } catch (err) {
    console.error('Error removing allotment:', err);
    res.status(500).send('Server error');
  }
});







// **Update Fee Functionality**

app.get('/get-students', async (req, res) => {
  try {
    const data = await readFile('allot.txt');
    const students = data
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [id, name, room] = line.split(',');
        return { id, name, room };
      });
    res.json({ students });
  } catch (error) {
    console.error('Error reading allot.txt:', error);
    res.status(500).json({ error: 'Failed to load students.' });
  }
});

app.post('/update-fee', async (req, res) => {
  const { student, fee } = req.body;

  if (!student || !fee) {
    return res.status(400).json({ message: 'Student and Fee are required.' });
  }

  const [id, name, room] = student.split(',');

  try {
    const feeData = `${id},${name},${room},${fee}\n`;
    await appendToFile('updatefee.txt', feeData);
    res.json({ message: 'Fee updated successfully.' });
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({ message: 'Failed to update fee.' });
  }
});




//Announcements data storing

const announcementsFile = path.join(__dirname, 'announcements.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to read and write announcements to file
const readAnnouncements = () => {
  if (!fs.existsSync(announcementsFile)) {
    fs.writeFileSync(announcementsFile, JSON.stringify([]));
  }
  const data = fs.readFileSync(announcementsFile, 'utf-8');
  return JSON.parse(data);
};

const writeAnnouncements = (data) => {
  fs.writeFileSync(announcementsFile, JSON.stringify(data, null, 2));
};

// Route: Get all announcements
app.get('/get-announcements', (req, res) => {
  const announcements = readAnnouncements();
  res.json(announcements);
});

// Route: Save an announcement
app.post('/save-announcement', (req, res) => {
  const { id, text, date } = req.body;
  if (!id || !text || !date) {
    return res.status(400).send('All fields are required.');
  }

  const announcements = readAnnouncements();
  if (announcements.find((a) => a.id === id)) {
    return res.status(400).send('Announcement ID already exists.');
  }

  announcements.push({ id, text, date });
  writeAnnouncements(announcements);
  res.status(201).send('Announcement added successfully.');
});

// Route: Delete an announcement
app.delete('/delete-announcement/:id', (req, res) => {
  const { id } = req.params;
  const announcements = readAnnouncements();
  const newAnnouncements = announcements.filter((a) => a.id !== id);

  if (announcements.length === newAnnouncements.length) {
    return res.status(404).send('Announcement not found.');
  }

  writeAnnouncements(newAnnouncements);
  res.send('Announcement deleted successfully.');
});




// Generate total rooms (Room1 to Room50)

app.use(express.static('public'));

app.get('/rooms', (req, res) => {
  const totalRooms = 50; // Total rooms
  const allRooms = Array.from({ length: totalRooms }, (_, i) => `Room${i + 1}`);
  const roomStatus = [];

  fs.readFile(path.join(__dirname, 'allot.txt'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading file');
    }

    const occupiedRooms = [];
    const lines = data.split('\n').filter(line => line.trim()); // Remove empty lines

    // Parse allot.txt data and collect occupied room numbers
    lines.forEach(line => {
      const match = line.match(/\((\d+),([^,]+),(\d+)\)/); // Match (id,name,roomnumber)
      if (match) {
        const id = match[1];
        const name = match[2].trim();
        const roomNumber = `Room${match[3]}`;
        occupiedRooms.push(roomNumber);

        roomStatus.push({ id, name, room: roomNumber, status: 'Unavailable' });
      } else {
        // If parsing fails, log and include raw line in data
        roomStatus.push({ id: 'N/A', name: 'Invalid', room: line, status: 'Unavailable' });
      }
    });

    // Add remaining available rooms
    allRooms.forEach(room => {
      if (!occupiedRooms.includes(room)) {
        roomStatus.push({ id: 'N/A', name: 'N/A', room, status: 'Available' });
      }
    });

    // Sort by room number
    roomStatus.sort((a, b) => a.room.localeCompare(b.room));
    res.json(roomStatus);
  });
});




//Rules page code
const rulesFile = path.join(__dirname, 'rules.txt');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to read and write rules to file
const readRules = () => {
  if (!fs.existsSync(rulesFile)) {
    fs.writeFileSync(rulesFile, '');
  }
  const data = fs.readFileSync(rulesFile, 'utf-8');
  return data
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [id, text] = line.split(',');
      return { id, text };
    });
};

const writeRules = (rules) => {
  const data = rules.map(rule => `${rule.id},${rule.text}`).join('\n');
  fs.writeFileSync(rulesFile, data);
};

// Route: Get all rules
app.get('/get-rules', (req, res) => {
  const rules = readRules();
  res.json(rules);
});

// Route: Save a rule
app.post('/save-rule', (req, res) => {
  const { id, text } = req.body;
  if (!id || !text) {
    return res.status(400).send('All fields are required.');
  }

  const rules = readRules();
  if (rules.find(rule => rule.id === id)) {
    return res.status(400).send('Rule ID already exists.');
  }

  rules.push({ id, text });
  writeRules(rules);
  res.status(201).send('Rule added successfully.');
});

// Route: Delete a rule
app.delete('/delete-rule/:id', (req, res) => {
  const { id } = req.params;
  const rules = readRules();
  const newRules = rules.filter(rule => rule.id !== id);

  if (rules.length === newRules.length) {
    return res.status(404).send('Rule not found.');
  }

  writeRules(newRules);
  res.send('Rule deleted successfully.');
});




//Complain page code

const complaintsFile = 'complain.txt';
const responsesFile = 'complain_response.txt';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to read data from a text file
const readDataFromTextFile = (file) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, ''); // Create file if it doesn't exist
  }
  const data = fs.readFileSync(file, 'utf-8').trim();
  if (!data) return [];
  return data.split('\n').map((line) => {
    const [id, text] = line.split(',');
    return { id, text };
  });
};

// Helper function to write data to a text file
const writeDataToTextFile = (file, data) => {
  const textData = data.map(({ id, text }) => `${id},${text}`).join('\n');
  fs.writeFileSync(file, textData);
};

// Route: Get complaints
app.get('/get-complaints', (req, res) => {
  const complaints = readDataFromTextFile(complaintsFile);
  res.json(complaints); // Return complaints as JSON for easier client-side processing
});

// Route: Respond to a complaint and remove it from the complaints file
app.post('/respond-to-complaint', (req, res) => {
  const { id, responseText } = req.body;

  if (!id || !responseText) {
    return res.status(400).send('Complaint ID and response text are required.');
  }

  const complaints = readDataFromTextFile(complaintsFile);
  const complaintIndex = complaints.findIndex((c) => c.id === id);

  if (complaintIndex === -1) {
    return res.status(404).send('Complaint not found.');
  }

  // Record the response
  const responses = readDataFromTextFile(responsesFile);
  responses.push({ id, text: responseText });
  writeDataToTextFile(responsesFile, responses);

  // Remove the complaint from the complaints file
  complaints.splice(complaintIndex, 1);
  writeDataToTextFile(complaintsFile, complaints);

  res.send('Response recorded and complaint removed successfully.');
});



//Now from here Userside is stating


//complain 
const complainFile = path.join(__dirname, 'complain.txt');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper functions
const readComplaints = () => {
  if (!fs.existsSync(complainFile)) {
    fs.writeFileSync(complainFile, '');
  }
  const data = fs.readFileSync(complainFile, 'utf-8');
  return data
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [id, text] = line.split(',');
      return { id, text };
    });
};

const writeComplaints = (complaints) => {
  const data = complaints.map(({ id, text }) => `${id},${text}`).join('\n');
  fs.writeFileSync(complainFile, data);
};

// Routes
app.get('/get-complaints', (req, res) => {
  const complaints = readComplaints();
  res.json(complaints);
});

app.post('/submit-complaint', (req, res) => {
  const { id, text } = req.body;

  if (!id || !text) {
    return res.status(400).send('Both ID and complaint text are required.');
  }

  const complaints = readComplaints();
  complaints.push({ id, text });
  writeComplaints(complaints);

  res.status(201).send('Complaint submitted successfully.');
});

app.delete('/delete-complaint/:id', (req, res) => {
  const { id } = req.params;

  const complaints = readComplaints();
  const filteredComplaints = complaints.filter(complaint => complaint.id !== id);

  if (filteredComplaints.length === complaints.length) {
    return res.status(404).send('Complaint not found.');
  }

  writeComplaints(filteredComplaints);
  res.send('Complaint deleted successfully.');
});

//check announcements
// Middleware
app.use(cors());
app.use(express.json());

// Path to the announcements file (renaming the variable to announcementsPath)
const announcementsPath = path.join(__dirname, "announcements.json");

// Endpoint to get announcements
app.get("/get-announcements", (req, res) => {
  if (!fs.existsSync(announcementsPath)) {
    return res.status(404).json({ error: "Announcements file not found." });
  }

  const data = fs.readFileSync(announcementsPath, "utf-8");
  const announcements = JSON.parse(data);
  res.json(announcements);
});


//check rules
// Middleware
app.use(cors());
app.use(express.json());

// Path to the rules file
const rulesFilePath = path.join(__dirname, "rules.txt");

// Endpoint to get rules
app.get("/get-rules", (req, res) => {
  if (!fs.existsSync(rulesFilePath)) {
    return res.status(404).json({ error: "Rules file not found." });
  }

  const data = fs.readFileSync(rulesFilePath, "utf-8");
  const rules = data
    .split("\n")
    .filter(Boolean)
    .map(line => {
      const [id, text] = line.split(",");
      return { id: id.trim(), text: text.trim() };
    });

  res.json(rules);
});

//menu of mess

app.use(cors());

// Endpoint to fetch the food menu
app.get("/get-food-menu", (req, res) => {
  fs.readFile("messmenu.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to read the food menu file.");
      return;
    }

    // Split the file into lines and filter out empty lines
    const menuLines = data.split("\n").filter(line => line.trim() !== "");

    // Parse the data
    const foodMenu = menuLines.map(line => {
      const parts = line.split(",");
      return {
        day: parts[0]?.trim() || "Unknown",
        lunch: {
          name: parts[2]?.trim() || "N/A",
          price: parts[3]?.trim() || "N/A",
        },
        dinner: {
          name: parts[5]?.trim() || "N/A",
          price: parts[6]?.trim() || "N/A",
        },
      };
    });

    res.json(foodMenu);
  });
});

app.use(cors());
app.use(express.json());

// File path
const feeFilePath = path.join(__dirname, "updatefee.txt");

// Endpoint to get fee details
app.get("/get-fee/:userId/:userName", (req, res) => {
  const { userId, userName } = req.params;

  if (!fs.existsSync(feeFilePath)) {
    return res.status(404).json({ error: "Fee file not found." });
  }

  const data = fs.readFileSync(feeFilePath, "utf-8").split("\n").filter(line => line);
  const record = data.find(line => {
    const [id, name] = line.split(",");
    return id === userId && name === userName;
  });

  if (!record) {
    return res.json({ error: "No fee record found for this user." });
  }

  const [, , , fee] = record.split(",");
  res.json({ fee });
});

// Endpoint to pay fee
app.delete("/pay-fee/:userId/:userName", (req, res) => {
  const { userId, userName } = req.params;

  if (!fs.existsSync(feeFilePath)) {
    return res.status(404).json({ error: "Fee file not found." });
  }

  let data = fs.readFileSync(feeFilePath, "utf-8").split("\n").filter(line => line);
  const index = data.findIndex(line => {
    const [id, name] = line.split(",");
    return id === userId && name === userName;
  });

  if (index === -1) {
    return res.json({ error: "No fee record found for this user." });
  }

  data.splice(index, 1); // Remove the fee record
  fs.writeFileSync(feeFilePath, data.join("\n"), "utf-8");

  res.json({ message: "Fee paid successfully and record removed." });
});



app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/view-profile", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  fs.readFile("data.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: "Server error while reading file" });
    }

    const lines = data.split("\n");
    for (const line of lines) {
      const [username, storedPassword, cnic, role, gender] = line.split(",");
      if (storedPassword && storedPassword.trim() === password.trim()) {
        return res.json({
          username: username.trim(),
          password: storedPassword.trim(),
          cnic: cnic.trim(),
          role: role.trim(),
          gender: gender.trim(),
        });
      }
    }

    return res.status(404).json({ error: "Password not found" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
