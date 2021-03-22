console.log('js loaded');
function broadcastJoin() {
  socket.emit(
    'room-joined',
    document.getElementById('audioChannel1').getAttribute('data-room'),
    document.getElementById('audioChannel1').getAttribute('data-room')
  );
}
broadcastJoin();
