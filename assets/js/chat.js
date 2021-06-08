var username = document.getElementById('hidden-username').value;
var msgInput = document.getElementById('message');
var sendBtn = document.getElementById('send-msg');
var msgPanel = document.getElementsByClassName('msg-pnl')[0];

var socket = io.connect(window.location.origin, {query: {username: username}});

sendBtn.addEventListener('click', () => {
    console.log('yo');
    socket.emit('chat', {
        message: msgInput.value,
        handle: username
    })
});

socket.on('chat', (data) => {
    msgPanel.innerHTML += '<p><strong>'+data.handle+': </strong>'+data.message+'</p>';
});