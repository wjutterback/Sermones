let myStream;
const peers = [];

socket.on('create', () => {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      myStream = stream;
    });

  // heroku - potentially need to enable secure
  const peer = new Peer(undefined, {
    host: 'peerjs-isw.herokuapp.com',
  });

  //localhost
//   const peer = new Peer(undefined, {
//     host: '/',
//     path: '/peerjs',
//     port: 3030,
//   });

  peer.on('open', function (id) {
    socket.emit('created', id);
    peers.push(id);
  });

  peer.on('call', (incomingCall) => {
    console.log('incoming stream triggered');
    incomingCall.answer(myStream);
    incomingCall.on('stream', (incomingStream) => {
      console.log(incomingStream);
      $('audio')[0].srcObject = incomingStream;
    });
  });

  socket.on('user-connected', (id) => {
    peers.forEach((peerId) => {
      if (peerId !== id) {
        peer.call(peerId, myStream);
      }
    });
  });
  socket.on('user-disconnected', (id) => {
    console.log(id);
  });
});

socket.on('createMessage', (message) => {
  const username = localStorage.getItem('username');
  const messageBody = $('<div>');
  messageBody.html(`<div  class="row card mb-2 p-3 message-card">
  <div class="card-header p-1" style="background-color: transparent; border: none;">
    ${username} <small class="text-muted">${new Date().toLocaleString()}</small>
  </div>
  <div class="card-body p-1">
    ${message}
  </div>
</div>`);
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

const joinAudio = async () => {
  console.log('audio join fired');
  socket.emit('audio-joined', $('#audioChannel1').attr('data-channel'));
};

$('#logout').on('click', function (event) {
  event.preventDefault();
  localStorage.removeItem('username');
  logout();
});

$('#createAccount').on('click', function (event) {
  event.preventDefault();
  localStorage.setItem('username',$('#id').val());
  signup($('#id').val(), $('#pw').val());
});

$('#signIn').on('click', function (event) {
  event.preventDefault();
  localStorage.setItem('username',$('#id').val());
  login($('#id').val(), $('#pw').val());
});

$('#chat-message').keydown(function (e) {
  if (e.which === 13 && $('#chat-message').val().length !== 0) {
    const text = $('#chat-message').val().trim();
    const id = $('#room').attr('data-room');
    const response = fetch(`/room/${id}`, {
      method: 'POST',
      body: JSON.stringify({text}),
      headers: { 'Content-Type': 'application/json' },
    });
    socket.emit('message', $('#chat-message').val());
    $('#chat-message').val('');
    if (response.ok){
      console.log(response);
    }
  }
});
//TODO: Get the user id added to json attribute in the Room object
// $('#addCode').keydown (async function (e) {
//   const code = $('#addCode').val().trim();
//   if (e.which === 13 && $('#addCode').val().length !== 0) {
//     const response = await fetch('/rooms', {
//       method: 'PUT',
//       body: JSON.stringify({ code}),
//       headers: {'Content-Type': 'application/json',},
//     });
//     console.log(response);
//     if (response.ok){
//       location.reload();
//     }else{
//       alert('FAIL');
//     }
//   }
// });

$('#audioChannel1').on('click', () => {
  const userName = $('#audioChannel1').attr('data-name');
  $('#appendAudio').append(`<li>${userName}</li>`);
  joinAudio();
});

$('#makeRoom').on('click', async () => {
  const title = $('#roomTitle').val().trim();
  if(title){
    const response = await fetch('/rooms', {
      method: 'POST',
      body: JSON.stringify({title}),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok){
      location.reload();
    }else{
      return;
    }
  }
});

$('#addBtn').on('click', () => {
  $('#modalBg').fadeIn();
});

$('#closeModal').on('click', () => {
  $('#roomTitle').val('');
  $('#addCode').val('');
  $('#modalBg').fadeOut();
});

const copyRoom = (btn) =>{
  const code = $(btn).attr('data-code');
  const el = $('<textarea>');
  $(el).val(code);
  $(el).css('position', 'absolute');
  $(el).css('left', '-99999px');
  $('body').append(el);
  el.select();
  document.execCommand('copy');
  $(el).remove();

};