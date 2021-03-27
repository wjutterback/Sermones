function broadcastJoin() {
  socket.emit('update-messages', localStorage.getItem('username'));
}
broadcastJoin();
