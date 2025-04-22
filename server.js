const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const sanitizeFilename = require('sanitize-filename');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.static('public'));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('update users', onlineUsers);

  socket.on('disconnect', () => {
    onlineUsers--;
    io.emit('update users', onlineUsers);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('file upload', (fileUrl) => {
    io.emit('file upload', fileUrl);
  });
});

app.post('/upload', (req, res) => {
  if (!req.files || !req.files.file) return res.status(400).send('No file uploaded.');

  let file = req.files.file;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).send('Unsupported file type.');
  }

  const sanitizedName = sanitizeFilename(file.name);
  const uploadPath = path.join(uploadDir, sanitizedName);

  file.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ fileUrl: '/uploads/' + sanitizedName });
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
