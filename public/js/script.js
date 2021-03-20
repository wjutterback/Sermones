const socket = io('/');
const PORT = 3030;
socket.on('hello', (emit) => {
  console.log(emit);
});

socket.on('create', () => {
  const peer = new Peer(undefined, {
    host: '/',
    path: '/peerjs',
    port: PORT,
  });
  console.log(peer);
  socket.emit('created');
});

socket.on('createMessage', (message) => {
  const messageBody = $('<div>')
    .attr('class', 'card-body')
    .attr('style', 'color:#d8d7df')
    .append(`<p>${message}</p>`);
  $('#chatCards').append(messageBody);
});

$('#chat-message').keydown(function (e) {
  if (e.which === 13 && $('#chat-message').val().length !== 0) {
    console.log(e);
    console.log($('#chat-message').val());
    socket.emit('message', $('#chat-message').val());
    $('#chat-message').val('');
  }
});
