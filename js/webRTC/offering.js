'use strict';

/*
* Handle creation of RTC offering
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
      if (event.candidate != null) {
        console.log('new ice candidate');
      } else {
        console.log('all ice candidates');
        // peerConnectiono.localDescription should be the offereing json that gets
        // given to user
        console.log('old lasticecandidate', peerConnection.localDescription);
      }
    };

    peerConnection.onconnectionstatechange = (event) => {
      console.log('handleconnectionstatechange');
      console.log(event);
    };

    peerConnection.oniceconnectionstatechange = (event) => {
      console.log('ice connection state: ' + event.target.iceConnectionState)
    };

    return peerConnection;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

// root create offering
export function createOffering() {
  const offering = {};

  offering.peerConnection = createPeerConnection();

  offering.dataChannel = offering.peerConnection.createDataChannel('chat');
  offering.dataChannel.onopen = (event) => {
    console.log('dataChannel open offering', event);
  };
  offering.dataChannel.onmessage = (event) => {
    console.log('dataChannel message offering', event);
  };

  const createOfferPromise = offering.peerConnection.createOffer();
  createOfferPromise.then((offer) => {
    offering.peerConnection.setLocalDescription(offer)
      .then(resMsg('setLocalPromise'), rejMsg('setLocalPromise'));
  }, rejMsg('createOffer'));

  return offering;
}

export function createAnswering(remoteDescription) {
  const answering = {};

  answering.peerConnection = createPeerConnection();

  answering.peerConnection.ondatachannel = (event) => {
    answering.dataChannel = event.channel;
    answering.dataChannel.onopen = (event) => {
      console.log('dataChannel open answering', event);
    };
    answering.dataChannel.onmessage = (event) => {
      console.log('dataChannel message answering', event);
    };
  }

  answering.peerConnection.setRemoteDescription(remoteDescription).then(() => {
      const createAnswerPromise = answering.peerConnection.createAnswer();
      createAnswerPromise.then((answer) => {
          answering.peerConnection.setLocalDescription(answer)
            .then(resMsg('setLocalPromise'), rejMsg('setLocalPromise'));
        }, rejMsg('createAnswer')
      );
    }, rejMsg('setRemote')
  );

  return answering;
}

export function setOfferRemote(offerPeerConnection, answerDescription) {
  offerPeerConnection.setRemoteDescription(answerDescription)
    .then(resMsg('offer set remote'), rejMsg('offer set remote'));
}

export function resMsg(msg) {
  return () => console.log(msg + ' done');
}

export function rejMsg(msg) {
  return (reason) => console.error(msg + ' failed', reason);
}
