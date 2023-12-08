'use strict';

/*
* Client interface for server maintained game state.
* Server may be another client but still operates like server
*
* */


import {UserMessage} from "../../html/components/userMessage.js";
import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import {GamePhase, PlayerStatus} from "../server/statuses.js";
import {GridSystem} from "../../js/app/GridSystem.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";
import {AiBasic} from "./AiBasic.js";

export class GameProxy {
  constructor(gameAPI, lobbyPlayer) {
    this.isLocalServer = true;
    this.gameAPI = gameAPI;
    this.lobbyPlayer = lobbyPlayer;
    this.playerId = lobbyPlayer.id;
    this.gameState = null;
    this.controls = null;
    this.pollIntervalId = null;
    this.userMessage = new UserMessage();

    this.start().then();
  }

  destroy() {
    clearInterval(this.pollIntervalId);
    this.controls.shipsReady.destroy();
    this.controls.playerStatus.destroy();
    this.gridSystem.destroy();
    delete this.gameAPI;
  }

  bindGridSystem(gridSystem) {
    this.gridSystem = gridSystem;
  }

  bindAI() {
    if (this.ai) throw new Error('GameProxy already has an AI.');
    this.ai = new AiBasic(this);
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

  isPlayerShipPlaced(shipId) {
    shipId = Number(shipId);
    return this.getPlayer().playerShips.findIndex(ps => ps.ship.id === shipId) !== -1;
  }

  async start() {
    this.controls = {
      shipsReady: new ButtonType('ships-ready', 'Ships Ready',
        this.shipsReady.bind(this), true, null),
      playerStatus: new LabelInputType('player-status', 'string',
        null, null, '(player_status)', true),
      aiMove: new ButtonType('ai-move', 'AI Move',
        () => this.ai.performMove(), false, null),
    };

    // polling for when two-way comm isn't allowed
    // this.pollIntervalId = setInterval(this.syncGameState.bind(this), 4000);

    // webhook callbacks
    this.gameAPI.subscribeToGameState(this.playerId, (newGameState) => this.consumeGameState(newGameState));

    this.syncGameState().then(async () => {
      this.gridSystem = new GridSystem(this);
      this.gridSystem.setupCanvas();
    });
  }

  async syncGameState() {
    const newGameState = await this.gameAPI.getGameState(this.playerId);
    this.consumeGameState(newGameState);
  }

  // endpoint for gameState to be pushed from server
  consumeGameState(newGameState) {
    console.log(newGameState);
    //  would be better to not redraw everything but check for diffs
    // but for now just redrawing everything
    this.gameState = newGameState;
    if (this.gridSystem) this.gridSystem.redrawPlayerShips();

    // when sync, player status may change so update btns accordingly
    this.controls.shipsReady.disableIf(this.getPlayer().status !== PlayerStatus.ships_placed);
    this.controls.playerStatus.setValue(Object.keys(PlayerStatus)[this.getPlayer().status]);
    // update side bar state
    if (this.gameState.phase === GamePhase.fight) {
      this.gridSystem.shipSidebar.hideSidebar();
    } else if (this.gridSystem) {
      this.gridSystem.shipSidebar.updateAssetsPlacedStates();
    }
  }

  async placeShip(ship, x, y, rotationDeg) {
    try {
      const response = await this.gameAPI.placeShip(this.playerId, ship, x, y, rotationDeg);
      this.userMessage.message(response);
      this.gridSystem.shipSidebar.clearSelected();
    } catch (e) {
      console.error(e);
      this.userMessage.error(e);
    }

    //   pretend we got a response from the server, and technically
    //   anything could have occurred
    await this.syncGameState();
  }

  async shipsReady() {
    try {
      const response = await this.gameAPI.shipsReady(this.playerId);
      this.userMessage.message(response);
    } catch (e) {
      this.userMessage.error(e);
    }

    await this.syncGameState();
  }

  async attackLocation(x, y) {
    try {
      const response = await this.gameAPI.attackLocation(this.playerId, x, y);
      this.userMessage.message(response);
    } catch (e) {
      this.userMessage.error(e);
    }

    await this.syncGameState();
  }
}
