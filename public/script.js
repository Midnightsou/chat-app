const socket = io();
const username = localStorage.getItem("username");
const avatar = localStorage.getItem("avatar");

// Set user details
document.getElementById("userName").textContent = username;
document.getElementById("userAvatar").src = avatar;

socket.on('chat message', (msg) => {
  const li = document.createElement("li");
  li.innerHTML = `<img src="${msg.avatar}" class="avatar"> <strong>${msg.username}</strong>: ${msg.message}`;
  document.getElementById("messages").appendChild(li);
});

socket.on('update users', (count) => {
  document.getElementById("userCount").textContent = `Online: ${count}`;
});

// Send message
document.getElementById("messageForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("m");
  const message = input.value.trim();
  if (message) {
    socket.emit("chat message", {
      username: username,
      avatar: avatar,
      message: message
    });
    input.value = "";
  }
});
