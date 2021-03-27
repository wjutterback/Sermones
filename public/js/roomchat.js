function broadcastJoin() {
  socket.emit(
    'room-joined',
    document.getElementById('audioChannel1').getAttribute('data-room')
  );
  //scrolls to bottom of text window
  const chatWindow = document.getElementById('chat-window');
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

broadcastJoin();
