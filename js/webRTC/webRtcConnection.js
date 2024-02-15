'use strict';

/*
* Handle creation of RTC offering and answer
* */

export function createPeerConnection() {
  try {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        // {urls: "stun:stun.stunprotocol.org"}
        {urls: 'stun:stun.l.google.com:19302'}
      ]
    });

    peerConnection.onicecandidate = (event) => {
      // this runs 3 times and event.candidate is null on last for some reason
      // the offer seems the same regardless.  weird.
      console.log('onicecandidate', event, event.candidate, JSON.stringify(peerConnection.localDescription));
    };

    peerConnection.onconnectionstatechange = (event) => {
      console.log('handleconnectionstatechange', event);
    };

    peerConnection.oniceconnectionstatechange = (event) => {
      console.log('ice connection state: ', event.target)
    };

    return peerConnection;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

// root create offering, note that the peer ice candidate is async so you need to
// handle peerConnection.onicecandidate
export async function createOffering(connectionHandler) {
  const offering = {};
  const peerConnection = createPeerConnection();

  offering.peerConnection = peerConnection;

  const dataChannel = peerConnection.createDataChannel('chat');
  offering.dataChannel = dataChannel;
  dataChannel.onopen = (event) => {
    console.log('dataChannel open offering', event);
    connectionHandler.onDataChannelOpen();
  };
  dataChannel.onmessage = (event) => {
    console.log('dataChannel message offering', event);
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  return offering;
}

// creates answering peerConnection and channel using the offerer's localDescription
export async function createAnswering(remoteDescription, connectionHandler) {
  const answering = {};
  const peerConnection = await createPeerConnection();
  answering.peerConnection = peerConnection;

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;
    answering.dataChannel = dataChannel;

    dataChannel.onopen = (event) => {
      console.log('dataChannel open answering', event);
      connectionHandler.onDataChannelOpen();
    };
    dataChannel.onmessage = (event) => {
      console.log('dataChannel message answering', event);
    };
  }

  await peerConnection.setRemoteDescription(remoteDescription);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  return answering;
}

export async function setOfferRemote(offerPeerConnection, answerDescription) {
  await offerPeerConnection.setRemoteDescription(answerDescription);
}

function close(peerConnection) {
  peerConnection.close();
}

// pass the offering.dataChannel or answering.dataChannel to call send
// not intended for use, just reference
function sendText(dataChannel, msg) {
  dataChannel.send(msg);
}
