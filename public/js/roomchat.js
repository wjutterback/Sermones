function broadcastJoin() {
  socket.emit(
    'room-joined',
    document.getElementById('audioChannel1').getAttribute('data-room'),
    document.getElementById('select').getAttribute('data-name')
  );
  const chatWindow = document.getElementById('chat-window');
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

broadcastJoin();
