function broadcastJoin() {
  socket.emit(
    'room-joined',
    document.getElementById('audioChannel1').getAttribute('data-room')
  );
}
broadcastJoin();
