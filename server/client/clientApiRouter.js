'use strict';

/*
* Routes the api called to local.api.js OR converts to REST POST to hit remote server
*
* */

// controls whether to use local server api or remote server api
// import api from "../server/api.js";
const api = {};
import userMessage from "../../html/components/userMessage.js";

const isLocal = true;

export default {
  newGame: (isLocal ? localCall : post).bind(null, 'newGame'),
  clearPlayers: (isLocal ? localCall : post).bind(null, 'clearPlayers'),
  updatePlayer: (isLocal ? localCall : post).bind(null, 'updatePlayer'),
  startGame: (isLocal ? localCall : post).bind(null, 'startGame'),
  submitClue: (isLocal ? localCall : post).bind(null, 'submitClue'),
  markGuesses: (isLocal ? localCall : post).bind(null, 'markGuesses'),
  submitGuesses: (isLocal ? localCall : post).bind(null, 'submitGuesses'),
  poll: (isLocal ? localCall : post).bind(null, 'poll'),
}

async function localCall(method, params) {
  try {
    console.log('bypassing call');
    return null;
    // return await api[method](...Object.values(params));
  } catch (e) {
    userMessage.errorMsg(e);
    throw e;
  }
}

async function post(method, params) {
  try {
    const response = await fetch(
      "https://zs6x8tlo5a.execute-api.us-west-2.amazonaws.com/default/words-with-friends", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({method, params})
      }
    );

    const result = await response.json();
    console.log("Success:", response);
    if (response.status === 400) throw result;
    return result;

  } catch (error) {
    userMessage.errorMsg(error);
    throw error;
  }
}
