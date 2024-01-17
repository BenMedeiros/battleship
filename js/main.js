'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";

import gameConfigScreen from "./app/gameConfigScreen.js";

import {getGlobalLobby} from "../server/server/Lobby.js";
import {createAnswering, createOffering, setOfferRemote} from "./webRTC/offering.js";


const gameConfigI = new ButtonType('game-config', 'Game Config',
  gameConfigScreen.createWinScreen, false, null,
  document.getElementById("navigation-bar"));


const lobby = getGlobalLobby();
const player1 = lobby.newPlayer('tom');
const player2 = lobby.newPlayer('ben');

console.log(lobby);


let offering = null;
let answering = null;

offering = createOffering();

setTimeout(() => {
  answering = createAnswering(offering.peerConnection.localDescription);
}, 1000);

setTimeout(() => {
  setOfferRemote(offering.peerConnection, answering.peerConnection.localDescription);
}, 3000);


setTimeout(() => {
  console.log(offering);
  console.log(answering);

  // setInterval(()=> {
  //   console.log('sending msgs');
  //   offering.dataChannel.send('foo');
  //   answering.dataChannel.send('bar');
  // }, 2000);

}, 5000);
