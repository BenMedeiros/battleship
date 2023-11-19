'use strict';

/*
* Client interface for server maintained game state.
* Server may be another client but still operates like server
*
* */


import userMessage from "../../html/components/userMessage.js";
import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import {GamePhase, PlayerStatus} from "../server/statuses.js";
import {GridSystem} from "../../js/app/GridSystem.js";

export class GameProxy {
  constructor(gameAPI, lobbyPlayer) {
    this.isLocalServer = true;
    this.gameAPI = gameAPI;
    this.lobbyPlayer = lobbyPlayer;
    this.playerId = lobbyPlayer.id;
    this.gameState = null;
    this.controls = null;
    this.pollIntervalId = null;

    this.start().then();
  }

  destroy() {
    clearInterval(this.pollIntervalId);
    this.controls.shipsReady.destroy();
    this.controls.playerStatusEl.remove();
    this.gridSystem.destroy();
    delete this.gameAPI;
  }

  bindGridSystem(gridSystem) {
    this.gridSystem = gridSystem;
  }

  getGameConfig() {
    return this.gameState.gameConfig;
  }

  getPlayers() {
    return this.gameState.players;
  }

  getPhase() {
    return this.gameState.phase;
  }

  isGameStarted() {
    return [GamePhase.game_over, GamePhase.waiting_for_players].indexOf(this.gameState.phase) === -1;
  }

  getPlayer() {
    return this.gameState.players.find(ply => ply.id === this.playerId);
  }

  getOpponent() {
    return this.gameState.players.find(ply => ply.id !== this.playerId);
  }

  getBoard() {
    return this.gameState.board;
  }

  async start() {
    this.controls = {
      shipsReady: new ButtonType('ships-ready', 'Ships Ready',
        this.shipsReady.bind(this), true, null,
        document.getElementById("controls-bar")),
      playerStatusEl: createPlayerStatusText(this.playerId)
    };
    this.pollIntervalId = setInterval(this.syncGameState.bind(this), 4000);

    this.syncGameState().then(async () => {
      this.gridSystem = new GridSystem(this);
      this.gridSystem.setupCanvas();
    });
  }

  async syncGameState() {
    const newGameState = await this.gameAPI.getGameState(this.playerId);
    //  would be better to not redraw everything but check for diffs
    // but for now just redrawing everything
    this.gameState = newGameState;
    if (this.gridSystem) this.gridSystem.redrawPlayerShips();

    // when sync, player status may change so update btns accordingly
    this.controls.shipsReady.disableIf(this.getPlayer().status !== PlayerStatus.ships_placed);
    this.controls.playerStatusEl.innerText = Object.keys(PlayerStatus)[this.getPlayer().status];
    if (this.gameState.phase === GamePhase.fight) {
      this.gridSystem.shipSidebar.hideSidebar();
    }
  }

  async placeShip(ship, x, y, rotationDeg) {
    try {
      const response = await this.gameAPI.placeShip(this.playerId, ship, x, y, rotationDeg);
      userMessage.msg(response);
    } catch (e) {
      userMessage.errorMsg(e);
    }

    //   pretend we got a response from the server, and technically
    //   anything could have occurred
    await this.syncGameState();
  }

  async shipsReady() {
    try {
      const response = await this.gameAPI.shipsReady(this.playerId);
      userMessage.msg(response);
    } catch (e) {
      userMessage.errorMsg(e);
    }

    await this.syncGameState();
  }

  async attackLocation(x, y) {
    try {
      const response = await this.gameAPI.attackLocation(this.playerId, x, y);
      userMessage.msg(response);
    } catch (e) {
      userMessage.errorMsg(e);
    }

    await this.syncGameState();
  }
}


function createPlayerStatusText(playerId) {
  const el = document.createElement('span');
  el.id = 'player-status-' + playerId;
  const parentEl = document.getElementById('team-msg-wrapper');
  parentEl.appendChild(el);
  return el;
}
