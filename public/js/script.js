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

  // navigator.mediaDevices
  //   .getUserMedia({ video: false, audio: true })
  //   .then((stream) => {
  //     peer.on('call', (incomingCall) => {
  //       console.log('incoming stream triggered');
  //       incomingCall.answer(stream);
  //       incomingCall.on('stream', (incomingStream) => {
  //         console.log(incomingStream);
  //         $('audio')[0].srcObject = incomingStream;
  //       });
  //     });
  //   });

  //TODO: Figure out how to get the stream from navigator - connection works but calling microphone twice (not sure if that will)
  socket.on('user-connected', (id) => {
    // navigator.mediaDevices
    //   .getUserMedia({ video: false, audio: true })
    //   .then((stream) => {
    //     peer.call(id, stream);
    //     console.log('peerId: script', id);
    //     console.log('user connected stream', stream);
    //   });

    console.log('starting call...');

    getAudio(
        function(MediaStream,id){

            console.log('now calling ' + id);
            var call = peer.call(id, MediaStream);
            call.on('stream', onReceiveStream);
        },
        function(err){
            console.log('an error occured while getting the audio');
            console.log(err);
        }
    );
  });
  socket.on('user-disconnected', (id) => {
    console.log(id);
  });
});

//Function to get audio from device without audio, takes in a success and an error callback as parameters
function getAudio(successCallback, errorCallback){
  navigator.getUserMedia({
      audio: true,
      video: false
  }, successCallback, errorCallback);
}

//Receives call object from (Peer), and eventually attaches it to page
function onReceiveCall(call){

  //Notify user peer is calling
  console.log('peer is calling...');
  //Console log call object
  console.log(call);

  //Call getAudio with inline success and error callbacks
  getAudio(
      function(MediaStream){
        //Use built-in answer function to call to provided MediaStream
          call.answer(MediaStream);
          //Notify user call is being answered
          console.log('answering call started...');
      },
      function(err){
        //Notify user if error occurred
          console.log('an error occured while getting the audio');
          //Console log error
          console.log(err);
      }
  );

  //Send the stream to the browser
  call.on('stream', onReceiveStream);
}

//On receiving stream, attach it to page
function onReceiveStream(stream){
  //Find audio container on page
  var audio = document.querySelector('audio');
  //Attach stream to audio src
  audio.src = window.URL.createObjectURL(stream);
  //Load duration and text tracks for audio data
  audio.onloadedmetadata = function(e){
    //Notify user audio is playing
      console.log('now playing the audio');
      //Play the audio
      audio.play();
  }
}

$('#start-call').click(function(){

  console.log('starting call...');

  getAudio(
      function(MediaStream){

          console.log('now calling ' + to);
          var call = peer.call(to, MediaStream);
          call.on('stream', onReceiveStream);
      },
      function(err){
          console.log('an error occured while getting the audio');
          console.log(err);
      }
  );

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
