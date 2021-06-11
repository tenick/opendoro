var username = document.getElementById('hidden-username').value;
var msgInput = document.getElementById('message');
var sendBtn = document.getElementById('send-msg');
var msgPanel = document.getElementsByClassName('msg-pnl')[0];
var usersPanel = document.getElementById('users-pnl');
var userCount = document.getElementById('user-count');

var socket = io.connect(window.location.origin, {query: {username: username}});

// add enter key event in message input
msgInput.addEventListener("keyup", (event) => {
    if (event.code == 'Enter' || event.code == 13)
        sendBtn.click();
});

sendBtn.addEventListener('click', () => {
    if (msgInput.value.length != 0) {
        socket.emit('chat', {
            message: msgInput.value,
            handle: username
        });
        msgInput.value = '';
    }
});

socket.on('chat', (data) => {
    msgPanel.innerHTML += '<div id="chat-msg-container"><span id="chat-handle">'+data.handle+': </span>'+'<span id="chat-msg">'+data.message+"</span>"+'</div>';
    msgPanel.scrollTop = msgPanel.scrollHeight;
});

// if a new user connected
socket.on('new-user-connection', (data) => {
    msgPanel.innerHTML += '<div id="chat-server-msg-container">'+'<span id="chat-server-msg">'+data.newUser+" joined the chat</span>"+'</div>'
});

// if a user disconnected
socket.on('user-disconnection', (data) => {
    msgPanel.innerHTML += '<div id="chat-server-msg-container">'+'<span id="chat-server-msg">'+data.user+" left the chat</span>"+'</div>'
});

socket.on('update-user-list', (data) => {
    let users = Object.keys(data).sort();
    userCount.innerHTML = users.length;
    
    let newUserList = '';
    users.forEach(user => {
        newUserList += "<div id='user'>"+user+"</div>";
    });
    usersPanel.innerHTML = newUserList;
});