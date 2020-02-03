const ws = new WebSocket('ws://192.168.0.127:8080')

ws.onopen = () => {
  console.log('Connected to the signaling server')
}

ws.onerror = err => {
  console.error(err)
}

ws.onmessage = msg => {
  console.log('Got message', msg.data)

  const data = JSON.parse(msg.data)

  switch (data.type) {
    case 'login':
      handleLogin(data.success)
      break
    case 'offer':
      handleOffer(data.offer, data.username)
      break
    case 'answer':
      handleAnswer(data.answer)
      break
    case 'candidate':
      handleCandidate(data.candidate)
      break
    case 'close':
      handleClose()
      break
    default:
      break
  }
}

let connection = null
let name = null
let otherUsername = null
let sendChannel;
let receiveChannel;

// const dataChannelSend = document.querySelector('textarea#dataChannelSend');
const dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
const sendButton = document.querySelector('button#sendButton');
const bpButton = document.querySelector('#bpDevice');
const pulseButton = document.querySelector('#pulseDevice');
const tempButton = document.querySelector('#tempDevice');
const sugarButton = document.querySelector('#sugarDevice');
const stethButton = document.querySelector('#stethDevice');
const ecgButton = document.querySelector('#ecgDevice');
const torchButton = document.querySelector('#torch');
const cancleButton = document.querySelector('#cancel');

//sendButton.onclick = sendData;
bpButton.onclick = sendBPCommand;
pulseButton.onclick = sendPulseCommand;
tempButton.onclick = sendTempCommand;
sugarButton.onclick = sendSugarCommand;
stethButton.onclick = sendStethCommand;
ecgButton.onclick = sendECGCommand;
torchButton.onclick = sendTorchCommand;
cancleButton.onclick = sendCancleCommand;

function disableSendButton() {
  sendButton.disabled = true;
}

const sendMessage = message => {
  if (otherUsername) {
    message.otherUsername = otherUsername
  }

  ws.send(JSON.stringify(message))
}

document.querySelector('div#call').style.display = 'none'

document.querySelector('button#login').addEventListener('click', event => {
  username = document.querySelector('input#username').value

  if (username.length < 0) {
    alert('Please enter a username 🙂')
    return
  }

  sendMessage({
    type: 'login',
    username: username
  })
})

const handleLogin = async success => {
  if (success === false) {
    alert('😞 Username already taken')
  } else {
    document.querySelector('div#login').style.display = 'none'
    document.querySelector('div#call').style.display = 'block'

    let localStream
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
    } catch (error) {
      alert(`${error.name}`)
      console.error(error)
    }

    document.querySelector('video#local').srcObject = localStream

    const configuration = {
      iceServers: [{ url: 'stun:stun2.1.google.com:19302' }]
    }

    connection = new RTCPeerConnection(configuration)
    sendChannel = connection.createDataChannel('sendDataChannel');

    connection.addStream(localStream)

    connection.onaddstream = event => {
      document.querySelector('video#remote').srcObject = event.stream
    }
    // onSendChannelStateChange();
    connection.ondatachannel = receiveChannelCallback;

    connection.onicecandidate = event => {
      if (event.candidate) {
        sendMessage({
          type: 'candidate',
          candidate: event.candidate
        })
      }
    }
  }
}

document.querySelector('button#call').addEventListener('click', () => {
  const callToUsername = document.querySelector('input#username-to-call').value

  if (callToUsername.length === 0) {
    alert('Enter a username 😉')
    return
  }

  otherUsername = callToUsername

  connection.createOffer(
    offer => {
      sendMessage({
        type: 'offer',
        offer: offer
      })

      connection.setLocalDescription(offer)
    },
    error => {
      alert('Error when creating an offer')
      console.error(error)
    }
  )
})

const handleOffer = (offer, username) => {
  otherUsername = username
  connection.setRemoteDescription(new RTCSessionDescription(offer))
  connection.createAnswer(
    answer => {
      connection.setLocalDescription(answer)
      sendMessage({
        type: 'answer',
        answer: answer
      })
    },
    error => {
      alert('Error when creating an answer')
      console.error(error)
    }
  )
}

const handleAnswer = answer => {
  connection.setRemoteDescription(new RTCSessionDescription(answer))
}

const handleCandidate = candidate => {
  connection.addIceCandidate(new RTCIceCandidate(candidate))
}

// function sendData() {
//   const data = dataChannelSend.value;
//   sendChannel.send(data);
//   console.log('Sent Data: ' + data);
// }

function sendBPCommand() {
  const data = 'b';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function sendPulseCommand() {
  const data = 'p';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function sendSugarCommand() {
  const data = 'g';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function sendStethCommand() {
  const data = 's';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function sendECGCommand() {
  const data = 'e';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function sendTempCommand() {
  const data = 'm';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function sendTorchCommand() {
  const data = 't';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function sendCancleCommand() {
  const data = 'x';
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}


document.querySelector('button#close-call').addEventListener('click', () => {
  sendMessage({
    type: 'close'
  })
  handleClose()
})

const handleClose = () => {
  otherUsername = null
  document.querySelector('video#remote').src = null
  connection.close()
  connection.onicecandidate = null
  connection.onaddstream = null
}

function receiveChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log('Received Message');
  dataChannelReceive.value = event.data;
}

// function onSendChannelStateChange() {
//     dataChannelSend.disabled = false;
//     dataChannelSend.focus();
//     sendButton.disabled = false;
// }

function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  console.log(`Receive channel state is: ${readyState}`);
}