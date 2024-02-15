'use strict';

/*
* Wrapper for web rtc to handle offer/answer stages and management
* */

import {createAnswering, createOffering, setOfferRemote} from "./webRtcConnection.js";

// for now, going with simple scenario - only one connection type (offer/answer) can be
// outstanding at a given time
const pendingOffer = {
  state: null,
  offering: null,
  payload: null,
  url: null
}

const pendingAnswer = {
  state: null,
  answering: null,
  payload: null
}

const connectionHandler = {
  onDataChannelOpen: null,
  dataChannel: null
}

// determine which connection type is being used and send msg in dataChannel if open
export function sendMsg(msg) {
  if (connectionHandler.dataChannel) {
    console.log('SendMsg', msg);
    connectionHandler.dataChannel.send(msg);
  } else {
    throw new Error('No connection established.');
  }
}

export function onDataChannelOpen(fn) {
  console.log('setting onDataChannelOpen', fn);
  connectionHandler.onDataChannelOpen = () => {
    // save the active data channel for quick reference
    if (pendingOffer.state === 'generated' && pendingOffer.offering.dataChannel) {
      if (pendingOffer.offering.dataChannel.readyState === 'open') {
        connectionHandler.dataChannel = pendingOffer.offering.dataChannel;
      }
    } else if (pendingAnswer.state === 'generated' && pendingAnswer.answering.dataChannel) {
      if (pendingAnswer.answering.dataChannel.readyState === 'open') {
        connectionHandler.dataChannel = pendingAnswer.answering.dataChannel;
      }
    }

    fn();
  };
}

export function isPendingAnswerGenerating() {
  return pendingAnswer.state !== null;
}

export function getPendingAnswerResponse() {
  console.log('get pending response', pendingAnswer.payload, pendingAnswer);
  if (pendingAnswer.state === 'generated') return pendingAnswer.payload;
  return null;
}

export async function processConnectionText(text) {
  console.log('processing text');
  if (pendingOffer.state === 'generated') {
    //  offer already exists, so this should be the answer
    await processTextForAnswer(text);
  } else {
    //  offer doesn't exist, so this is likely the offer but was pasted instead of handled in window
    await processTextForOffer(text);
  }
}

// create an offer and build the url so it can be shared
export async function getOfferUrlAsync(cb) {
  if (pendingOffer.state !== null) {
    throw new Error('Offer already generated, only allowing one open offer at a time.');
  }

  const offering = await createOffering(connectionHandler);
  pendingOffer.offering = offering;
  pendingOffer.state = 'generating';

  offering.peerConnection.addEventListener('icecandidate', (event) => {
    if (event.candidate === null) {
      //  final event since icecandidate is called multiple times
      const url = new URL(window.location);
      url.searchParams.set('type', offering.peerConnection.localDescription.type);
      url.searchParams.set('sdp', offering.peerConnection.localDescription.sdp);
      console.log('url', url.toString().length);

      pendingOffer.url = url;
      pendingOffer.payload = JSON.stringify(offering.peerConnection.localDescription);
      pendingOffer.state = 'generated';

      if (cb) cb(pendingOffer);
    }
  });
}

// the answer is a json so that player isn't confused on what to do
export async function processTextForAnswer(text) {
  const connectionDescription = JSON.parse(text);
  if (connectionDescription.type !== 'answer' || connectionDescription.sdp === undefined) {
    throw new Error('Must paste connection answer from other player.');
  }
  if (pendingOffer.state !== 'generated') throw new Error('Pending offer not in correct state to respond');
  setOfferRemote(pendingOffer.offering.peerConnection, connectionDescription).then();
}

// for when the offer URL is pasted instead of sent to URL
// returns true if valid offer url
export async function processTextForOffer(textURL, cb) {
  const urlParams = new URL(textURL);
  const type = urlParams.searchParams.get('type');
  const sdp = urlParams.searchParams.get('sdp');

  if (type !== 'offer' || sdp === undefined) {
    console.info('Invalid connection offer URL');
    return false;
  }

  if (pendingAnswer.state !== null) throw new Error('Pending Answer already in progress');

  const answering = await createAnswering({type, sdp}, connectionHandler);
  pendingAnswer.answering = answering;
  pendingAnswer.state = 'generating';

  answering.peerConnection.addEventListener('icecandidate', async (event) => {
    if (event.candidate === null) {
      console.log(answering.peerConnection.localDescription.type, answering.peerConnection.localDescription.sdp);
      pendingAnswer.payload = JSON.stringify(answering.peerConnection.localDescription);
      pendingAnswer.state = 'generated';
      console.log('answering built, please send this back to host', pendingAnswer.payload);

      if (cb) cb(pendingAnswer.payload);
    }
  });

  return true;
}

// returns true if the Window contained webRTC offer
export async function processWindowForOffer(cb) {
  const isValidUrl = await processTextForOffer(window.location, cb);
  if (isValidUrl) console.log('ROUTED WITH WEB RTC OFFER');
  return isValidUrl;
}
