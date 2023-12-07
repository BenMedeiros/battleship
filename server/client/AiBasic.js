'use strict';

/*
* Basic AI that will make a move when user says to.
*
* */


import {GamePhase, PlayerStatus} from "../server/statuses.js";
import {planPlaceShips} from "./ai/aiShipPlacer.js";
import {analyzeCurrentState} from "./ai/aiAttacker.js";

export class AiBasic {
  constructor(gameProxy) {
    this.gameProxy = gameProxy;
    this.plannedMove = {
      name: 'place ship',
      action: 'placeShip',
      ship: null,
      x: null,
      y: null,
      rotationDeg: null
    }
  }

  performMove() {
    console.log(this);
    const gamePhase = this.gameProxy.gameState.phase;
    const playerStatus = this.gameProxy.getPlayer().status;

    if (gamePhase === GamePhase.place_ships) {
      const plannedMove = planPlaceShips(this.gameProxy.getGameConfig(), this.gameProxy.getPlayer());
      if (plannedMove === null) {
        this.gameProxy.shipsReady();
      } else {
        this.gameProxy.placeShip(plannedMove.ship, plannedMove.x, plannedMove.y, plannedMove.rotationDeg);
      }

    } else if (gamePhase === GamePhase.fight) {
      if (playerStatus === PlayerStatus.planning_attack) {
        const plannedAttack = analyzeCurrentState(this.gameProxy.getBoard(), this.gameProxy.getOpponent());
        if (plannedAttack) {
          this.gameProxy.attackLocation(plannedAttack.x, plannedAttack.y);
        } else {
          this.gameProxy.userMessage.error('Could not determine attack');
        }

      } else if (playerStatus === PlayerStatus.reloading) {
        this.gameProxy.userMessage.error('Reloading, waiting on opponent to take their turn.');
      } else {
        this.gameProxy.userMessage.error('Unhandled player phase: ' + playerStatus);
      }
    } else {
      this.gameProxy.userMessage.error('AI doesnt work for phase ' + gamePhase);
    }
  }

}
