'use strict';

/*
* Functions used by the client and server
* */


// simple common functions for the gameState
export function bindCommonFunctions(gs) {
  gs.getThisDeviceId = () => gs.thisPlayer ? gs.thisPlayer.deviceId : null;
  gs.getPlayerById = (deviceId) => gs.players.find(el => el.deviceId === deviceId);
  gs.isSpymaster = (deviceId) => (gs.spymasterRed && gs.spymasterRed.deviceId === deviceId)
    || (gs.spymasterBlue && gs.spymasterBlue.deviceId === deviceId);

  gs.getRedPlayers = () => gs.players.filter(el => el.team === 'red');
  gs.getBluePlayers = () => gs.players.filter(el => el.team === 'blue');
  gs.getTeamLessPlayers = () => gs.getRedPlayers().length < gs.getBluePlayers().length ? 'red' : 'blue';

  gs.getCountRedGoal = () => gs.wordsGoal.filter(el => el === 'red').length;
  gs.getCountBlueGoal = () => gs.wordsGoal.filter(el => el === 'blue').length;
  gs.getCountRedCurrent = () => gs.wordsStates.filter(el => el === 'red').length;
  gs.getCountBlueCurrent = () => gs.wordsStates.filter(el => el === 'blue').length;

  gs.getTurnTeam = () => gs.turn.isRedTurn ? 'red' : 'blue';
  gs.isTeamTurn = (deviceId) => {
    const player = gs.getPlayerById(deviceId);
    return player && player.team === gs.getTurnTeam();
  };
  gs.isThisTeamTurn = () => gs.isTeamTurn(gs.getThisDeviceId());
}
