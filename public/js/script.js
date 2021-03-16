const socket = io('/');

socket.on('hello', (emit) => {
  console.log(emit); //
});
