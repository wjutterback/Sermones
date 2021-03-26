socket.on('create', (user) => {
  // heroku
  const peer = new Peer(undefined, {
    host: 'peerjs-isw.herokuapp.com',
  });

  //localhost
  // const peer = new Peer(undefined, {
  //   host: '/',
  //   path: '/peerjs',
  //   port: 3030,
  // });

  peer.on('open', function (id) {
    socket.emit('created', id, user);
  });

  peer.on('call', (incomingCall) => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        const myStream = stream;
        console.log(myStream);
        console.log('incoming stream triggered');
        incomingCall.answer(myStream);
        incomingCall.on('stream', (incomingStream) => {
          const audio = document.createElement('audio');

          audio.srcObject = incomingStream;
          audio.play();
          document.body.appendChild(audio);
        });
      });
  });

  socket.on('user-connected', (id, peers) => {
    peers.forEach((peerId) => {
      if (peerId !== id) {
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((stream) => {
            const myStream = stream;
            console.log(myStream);
            let call = peer.call(peerId, myStream);
            call.on('stream', function (incomingStream) {
              const audio = document.createElement('audio');
              audio.srcObject = incomingStream;
              audio.play();
              document.body.appendChild(audio);
            });
          });
      }
    });
  });
});

socket.on('addUser', (user) => {
  const children = document.querySelectorAll('.userName');
  audioUsers = [];
  children.forEach((child) => {
    audioUsers.push(child.innerHTML);
  });
  const filter = audioUsers.filter((i) => i === user);
  if (filter.length === 0) {
    $('#appendAudio').append(`<li class='userName'>${user}</li>`);
  }
});

socket.on('user-disconnected', async (user) => {
  try {
    const children = document.querySelectorAll('.userName');
    children.forEach((child) => {
      if (child.innerHTML === user.name) {
        child.remove();
      }
    });
  } catch (err) {
    console.log(err);
  }
});

socket.on('audioUsers', (users, roomID) => {
  users.forEach((user) => {
    if ((user.audio.channel = roomID)) {
      $('#appendAudio').append(`<li class='userName'>${user.name}</li>`);
    }
  });
});

socket.on('dmMessages', (messages) => {
  messages.forEach((message) => {
    console.log(message);
    const dm = $(document.createElement('div'));
    dm.html(`<div  class="row card mb-2 p-3 message-card">
      <div class="card-header p-1" style="background-color: transparent; border: none;">
        ${message.name} <small class="text-muted">${new Date(
      message.createdAt
    ).getMonth()}/${new Date(message.createdAt).getDate()}/${new Date(
      message.createdAt
    ).getFullYear()}
    </small>
      </div>
      <div class="card-body p-1">
        ${message.text}
      </div>
    </div>`);
    $('#directMessages').append(dm);
  });
});

const scrollToBottom = () => {
  const chatWindow = $('.chat-window');
  chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
};

socket.on('createMessage', (message, username) => {
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
  scrollToBottom();
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

const joinAudio = async (name) => {
  console.log('audio join fired');
  socket.emit('audio-joined', $('#audioChannel1').attr('data-audio'), name);
};

$('#logout').on('click', function (event) {
  event.preventDefault();
  localStorage.removeItem('username');
  logout();
});

$('#createAccount').on('click', function (event) {
  event.preventDefault();
  localStorage.setItem('username', $('#id').val());
  signup($('#id').val(), $('#pw').val());
});

$('#signIn').on('click', function (event) {
  event.preventDefault();
  localStorage.setItem('username', $('#id').val());
  login($('#id').val(), $('#pw').val());
});

$('#chat-message').keydown(function (e) {
  if (e.which === 13 && $('#chat-message').val().length !== 0) {
    const text = $('#chat-message').val().trim();
    const id = $('#room').attr('data-room');
    const response = fetch(`/room/${id}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' },
    });
    socket.emit(
      'message',
      $('#chat-message').val(),
      localStorage.getItem('username')
    );
    $('#chat-message').val('');
    if (response.ok) {
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
  const children = document.querySelectorAll('.userName');
  if (children.length === 0) {
    $('#appendAudio').append(`<li class='userName'>${userName}</li>`);
    joinAudio(userName);
  } else {
    children.forEach((child) => {
      if (child.innerHTML !== userName) {
        socket.emit(
          'userJoin',
          userName,
          $('#audioChannel1').attr('data-room')
        );
        joinAudio(userName);
      }
    });
  }
});

$('#dm-input').keydown(function (e) {
  if (e.which === 13 && $('#dm-input').val().length !== 0) {
    socket.emit(
      'dm-message',
      $('#dm-name').val(),
      $('#dm-input').val(),
      localStorage.getItem('username')
    );
    $('#dm-input').val('');
  }
});

$('#makeRoom').on('click', async () => {
  const title = $('#roomTitle').val().trim();
  if (title) {
    const response = await fetch('/rooms', {
      method: 'POST',
      body: JSON.stringify({ title }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      location.reload();
    } else {
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

const copyRoom = (btn) => {
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
