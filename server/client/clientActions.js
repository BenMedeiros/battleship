'use strict';

/*
* Client actions that call the server api after validating alittle on the user
* side if it's ok.  On local server, they call the api directly, but for remote server
* the router converts them to a REST POST call.
*
* */

// this player id
import clientApiRouter from "./clientApiRouter.js";
import {bindCommonFunctions} from "../shared/sharedFunctions.js";
import validations from "./validations.js";
import userMessage from "../../html/components/userMessage.js";

let deviceId = Number(localStorage.getItem('words-with-friends.deviceId'));
console.log(deviceId, typeof deviceId);
let gameState = {};
let lastPoll = null;

export default {
  getCachedGameState: () => gameState,
  // since we're faking different devices, need to rerun processResponse with the new deviceId
  // shouldn't need to use this except during testing
  bindDeviceId: (spoofId) => {
    deviceId = spoofId;
    poll(true).then();
  },
  poll,
  newGame,
  clearPlayers,
  updatePlayer,
  changePlayerTeam,
  startGame,
  submitClue,
  markGuesses,
  submitGuesses,
}

function throwAndDisplayErrorIfMsg(validationFn) {
  const msg = validationFn(gameState);
  if (msg) {
    userMessage.errorMsg(msg);
    throw new Error(msg);
  }
}

function processResponse(response) {
  if (!response) return;

  gameState = JSON.parse(JSON.stringify(response));
  console.log(gameState);
  lastPoll = new Date();

  if (!deviceId) {
    if (response.thisPlayer && response.thisPlayer.deviceId) {
      deviceId = response.thisPlayer.deviceId;
      localStorage.setItem('words-with-friends.deviceId', deviceId);
    }
  }

  bindCommonFunctions(gameState);
  document.dispatchEvent(new Event('new-server-response'));
}

// polls the server for gameState, will prevent polling if gameState is <15s old
async function poll(forcePoll = false) {
  // only poll if the data is likely stale
  if (forcePoll || !lastPoll || new Date() - lastPoll > 10 * 1000) {
    const response = await clientApiRouter.poll({deviceId});
    processResponse(response);
  } else {
    console.log('Skipping this polling.');
  }
}

async function newGame(wordKey) {
  const response = await clientApiRouter.newGame({deviceId, wordKey});
  processResponse(response);
}

async function clearPlayers() {
  throwAndDisplayErrorIfMsg(validations.updatePlayer);

  const response = await clientApiRouter.clearPlayers({deviceId});
  processResponse(response);
}

// allow anyone to change any player's team
async function changePlayerTeam(player) {
  throwAndDisplayErrorIfMsg(validations.updatePlayer);

  const response = await clientApiRouter.updatePlayer({
    deviceId: player.deviceId,
    name: player.name,
    team: player.team === 'red' ? 'blue' : 'red'
  });
  processResponse(response);
}

async function updatePlayer(name, team) {
  throwAndDisplayErrorIfMsg(validations.updatePlayer);

  const response = await clientApiRouter.updatePlayer({deviceId, name, team});
  processResponse(response);
}

async function startGame() {
  throwAndDisplayErrorIfMsg(validations.startGame);

  const response = await clientApiRouter.startGame({deviceId})
  processResponse(response);
}

async function submitClue(clue, count) {
  throwAndDisplayErrorIfMsg(validations.submitClue);
  // this one's localStorage local actually would work fine
  const response = await clientApiRouter.submitClue({deviceId, clue, count});
  processResponse(response);
}

async function markGuesses(guessIndexes) {
  throwAndDisplayErrorIfMsg(validations.markGuesses);

  const response = await clientApiRouter.markGuesses({deviceId, guessIndexes});
  processResponse(response);
}

async function submitGuesses() {
  throwAndDisplayErrorIfMsg(validations.submitGuesses);

  const response = await clientApiRouter.submitGuesses({deviceId});
  processResponse(response);
}
