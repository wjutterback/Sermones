const PORT = 3030;

socket.on('create', () => {
  const peer = new Peer(undefined, {
    host: '/',
    path: '/peerjs',
    port: PORT,
  });
  console.log('peer', peer);

  peer.on('open', function (id) {
    socket.emit('created', id);
  });

  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      peer.on('call', (incomingCall) => {
        console.log('incoming stream triggered');
        incomingCall.answer(stream);
        incomingCall.on('stream', (incomingStream) => {
          console.log(incomingStream);
          $('audio')[0].srcObject = incomingStream;
        });
      });
    });

  //TODO: Figure out how to get the stream from navigator - connection works but calling microphone twice (not sure if that will)
  socket.on('user-connected', (id) => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        peer.call(id, stream);
        console.log('peerId: script', id);
        console.log('user connected stream', stream);
      });
  });
  socket.on('user-disconnected', (id) => {
    console.log(id);
  });
});

socket.on('createMessage', (message) => {
  const messageBody = $('<div>')
    .attr('class', 'card-body')
    .attr('style', 'color:#d8d7df')
    .append(`<p>${message}</p>`);
  $('#chatCards').append(messageBody);
});

async function signup(name, password) {
  try {
    const response = await fetch('/sign-up', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const responseMessage = await response.json();
      $('#message').text(responseMessage.message);
      document.location.replace('/');
    }
  } catch (err) {
    console.log(err);
  }
}

async function login(name, password) {
  try {
    const response = await fetch('/sign-in', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const responseMessage = await response.json();
      $('#error').text('');
      $('#message').text(responseMessage.message);
      document.location.replace('/');
    }
    const responseMessage = await response.json();
    $('#error').text(responseMessage.message);
  } catch (err) {
    console.log(err);
  }
}

const logout = async () => {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      document.location.replace('/');
    }
    const responseMessage = await response.json();
    $('#message').text(responseMessage.message);
  } catch (err) {
    console.log(err);
  }
};

const joinAudio = async (user) => {
  console.log('audio join fired');
  socket.emit('audio-joined', user);
};

$('#logout').on('click', function (event) {
  event.preventDefault();
  logout();
});

$('#createAccount').on('click', function (event) {
  event.preventDefault();
  signup($('#id').val(), $('#pw').val());
});

$('#signIn').on('click', function (event) {
  event.preventDefault();
  login($('#id').val(), $('#pw').val());
});

$('#chat-message').keydown(function (e) {
  if (e.which === 13 && $('#chat-message').val().length !== 0) {
    socket.emit('message', $('#chat-message').val());
    $('#chat-message').val('');
  }
});

$('#audioChannel1').on('click', () => {
  const userName = $('#audioChannel1').attr('data-name');
  $('#appendAudio').append(`<li>${userName}</li>`);
  joinAudio(userName);
});
