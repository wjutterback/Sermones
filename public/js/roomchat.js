function broadcastJoin() {
  socket.emit('update-socket', localStorage.getItem('username'));
  socket.emit(
    'room-joined',
    document.getElementById('audioChannel1').getAttribute('data-room')
  );
}
broadcastJoin();
