'use strict';

/*
* Contains all validation messages based on game state
* */

function isTurn(gameState, deviceId) {
  if (!gameState.isGameStarted) return 'Game not started';
  if (gameState.winner) return 'Game over, winner is ' + gameState.winner;
  if (!gameState.isTeamTurn(deviceId)) return 'Not your turn';
  return null;
}


export default {
  updatePlayer: (gameState) => {
    if (gameState.isGameStarted) return 'Cant update player during game';
    return null;
  },
  startGame: (gameState) => {
    if (gameState.isGameStarted) return 'Game already started.';
    if (gameState.getRedPlayers().length < 2) return 'Red team needs more players';
    if (gameState.getBluePlayers().length < 2) return 'Blue team needs more players';
    return null;
  },
  submitClue: (gameState) => {
    const deviceId = gameState.getThisDeviceId();
    if (gameState.turn.clue) return 'Clue already submitted for this turn';
    if (!gameState.isSpymaster(deviceId)) return 'You are not a spymaster ' + deviceId;
    return isTurn(gameState, deviceId);
  },
  markGuesses: (gameState) => {
    const deviceId = gameState.getThisDeviceId();
    if (gameState.isSpymaster(deviceId)) return 'Spymasters cant guess..';
    return isTurn(gameState, deviceId);
  },
  submitGuesses: (gameState) => {
    const deviceId = gameState.getThisDeviceId();
    if (gameState.isSpymaster(deviceId)) return 'Spymasters cant guess..';
    return isTurn(gameState, deviceId);
  },
  clickWordBox: (gameState, wordIndex) => {
    if (['red', 'blue', 'death', 'neutral'].indexOf(gameState.wordsStates[wordIndex]) !== -1) {
      return 'Word already marked';
    }
    if (!gameState.thisPlayer) return 'No player assigned.';
    if (gameState.isSpymaster(gameState.thisPlayer.deviceId)) return 'Spymasters cant guess..';
    return isTurn(gameState, gameState.thisPlayer.deviceId);
  }
}
