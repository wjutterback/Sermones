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

  socket.on('destroyConnect', () => {
    peer.destroy();
  });

  peer.on('open', function (id) {
    socket.emit('created', id, user);
  });

  peer.on('call', (incomingCall) => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        incomingCall.answer(stream);
        incomingCall.on('stream', (incomingStream) => {
          const audio = document.createElement('audio');
          document.body.appendChild(audio);
          audio.srcObject = incomingStream;
          audio.play();
        });
        peer.on('disconnected', function () {
          peer.reconnect();
        });
      });
  });

  socket.on('user-connected', (id, peers) => {
    peers.forEach((peerId) => {
      if (peerId !== id) {
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((stream) => {
            let call = peer.call(peerId, stream);
            call.on('stream', function (incomingStream) {
              const audio = document.createElement('audio');
              document.body.appendChild(audio);
              audio.srcObject = incomingStream;
              audio.play();
            });
            peer.on('disconnected', function () {
              peer.reconnect();
            });
          });
      }
    });
  });
});

const scrollToBottom = () => {
  const chatWindow = $('.chat-window');
  chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
};

socket.on('addUser', (user) => {
  const children = document.querySelectorAll('.userName');
  audioUsers = [];
  children.forEach((child) => {
    audioUsers.push(child.innerHTML);
  });
  const filter = audioUsers.filter((i) => i === user);
  if (filter.length === 0) {
    $('#appendAudio').append(`<li class='userName'>${user}</li>`);

    const dm = $(document.createElement('div'));
    dm.html(
      `<div class="userPos" id="userPos_${user}" userPosx="0" userPosy="0" userPosz="0"  style="display:none"></div>`
    );
    $('#allUserPos').append(dm);
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

socket.on('newDM', (message, senderName) => {
  if (
    window.location.pathname === '/messages' &&
    $('#chatter').text() === senderName
  ) {
    const dm = $(document.createElement('div'));
    dm.html(`<div  class="row card mb-2 p-3 message-card">
    <div id="dmReceiver" class="card-header p-1" style="background-color: transparent; border: none;">
    ${senderName}<small class="text-muted">${new Date(
      message.createdAt
    ).toLocaleString()}
        </small><div class="card-body p-1"> ${message.text}</div>
        </div>
        </div>`);
    console.log(dm);
    $('#chatCards').append(dm);
    scrollToBottom();
  }
});

// add: to id="msgName" onClick="atName(this)
// const atName = (button) => {
//   console.log(button);
//   if ($('#dmSender').text() !== button.innerText) {
//     $('#chatCards').empty();
//     socket.emit('getDM', button.innerText, localStorage.getItem('username'));
//   }
// };

socket.on('dmMessages', (messages) => {
  const messageArr = [];
  messages.forEach((message) => {
    messageArr.push(message.name);
  });
  let uniqueSender = [...new Set(messageArr)];
  uniqueSender.forEach((user) => {
    const dm = $(document.createElement('div'));
    dm.html(`<div  class="row card mb-2 p-3 message-card">
    <div class="card-header p-1" style="background-color: transparent; border: none;"><div><span style="border-radius: 50%; border:solid red 1px; padding-right: 8.5px; padding-left: 8.5px" id="notifyUnread${user}"></span><button id="msgName" class="btn text-light">${user}</button></div>
    </div>
    </div>`);
    $('#directMessages').append(dm);
  });
  let lastPullDateStorage = localStorage.getItem('userLastCheckedMessages');
  let lastPullDate = new Date(lastPullDateStorage);
  let messagesUnchecked = 0;
  messages.forEach((message) => {
    let dateMessageCreatedAt = new Date(message.createdAt);
    if (dateMessageCreatedAt >= lastPullDate === true) {
      messagesUnchecked = messagesUnchecked + 1;
    }
    var unnotifiedSpan = $(`#notifyUnread${message.name}`);
    unnotifiedSpan.text(`${messagesUnchecked}`);
  });
});

socket.on('populateDM', (messages) => {
  let localDatePull = new Date();
  messages.forEach((message) => {
    const dm = $(document.createElement('div'));
    dm.html(`<div  class="row card mb-2 p-3 message-card">
    <div id="dmSender" class="card-header p-1" style="background-color: transparent; border: none;">
    ${message.name} <small class="text-muted"> ${new Date(
      message.createdAt
    ).toLocaleString()}
        </small> </div><div class="card-body p-1"> ${message.text}</div>
        </div>`);
    $('#chatCards').append(dm);
    scrollToBottom();
    localStorage.setItem('userLastCheckedMessages', localDatePull);
  });
});

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
      document.location.replace('/homepage');
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
  socket.emit('audio-joined', $('#audioChannel1').attr('data-audio'), name);
};

$('#logout').on('click', function (event) {
  event.preventDefault();
  localStorage.removeItem('username');
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

$('#makeRoomCode').on('click', async function () {
  const code = $('#addCode').val().trim();
  if (code) {
    const response = await fetch('/roomscode', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      document.location.replace('/rooms');
    } else {
      alert('FAIL');
    }
  }
});

$('#audioChannel1').on('click', () => {
  const userName = localStorage.getItem('username');
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
    const username = localStorage.getItem('username');
    const message = $('#dm-input').val();
    socket.emit('dm-message', $('#dm-name').val(), message, username);
    const dm = $(document.createElement('div'));
    dm.html(`<div  class="row card mb-2 p-3 message-card">
    <div id="dmSender" class="card-header p-1" style="background-color: transparent; border: none;">
    ${username}<small class="text-muted"> ${new Date().toLocaleString()}
          </small><div class="card-body p-1"> ${message}</div>
          </div>
          </div>`);
    $('#chatCards').append(dm);
    $('#dm-input').val('');
    scrollToBottom();
  }
});

document.addEventListener('click', function (e) {
  if (e.target.id === 'msgName') {
    if ($('#dmSender').text() !== e.target.innerText) {
      $('#chatCards').empty();
      $('#chatter').text(`${e.target.innerText}`);
      $('#dm-name').val(`${e.target.innerText}`);
      socket.emit(
        'getDM',
        e.target.innerText,
        localStorage.getItem('username')
      );
    }
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

const updateLocalStorage = () => {
  const name = $('#select').attr('data-name');
  localStorage.setItem('username', name);
  socket.emit('update-socket', localStorage.getItem('username'));
};

updateLocalStorage();

$('#leaveRoom').on('click', async () => {
  const user_id = $('#user').attr('data-user');
  const room_id = $('#audioChannel1').attr('data-room');
  const response = await fetch(`/room/${room_id}`, {
    method: 'DELETE',
    body: JSON.stringify({ user_id, room_id }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    document.location.replace('/rooms');
  } else {
    alert('something went wrong!');
  }
});

socket.on('removeUser', (user) => {
  const children = document.querySelectorAll('.userName');
  children.forEach((child) => {
    if (child.innerHTML === user) {
      child.remove();
    }
  });
});

$('#leaveVoice').on('click', async () => {
  const userName = localStorage.getItem('username');
  socket.emit('userLeft', userName, $('#audioChannel1').attr('data-room'));
  socket.emit('peerDestroy', userName);
});

const notif = (text, sender) => {
  const div = $('<div>');
  $(div).css('display', 'none');
  $(div).html(`<div id="alert" class="alert alert-dark" role="alert">
  <h4 class="alert-heading">${sender}
  <small class="text-dark text-muted">${new Date().toLocaleString()}</small></h4>
  <hr>
  <p class="text-primary">${text}</p>
  </div>`);
  $('body').append(div);
  $(div).fadeIn();
  setTimeout(function () {
    $(div).fadeOut();
  }, 5000);
};

socket.on('notification', (text, sender) => {
  notif(text, sender);
});
