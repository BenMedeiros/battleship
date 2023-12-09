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
  }

  performMove() {
    const gamePhase = this.gameProxy.gameState.phase;
    const playerStatus = this.gameProxy.getPlayer().status;
    const opponentStatus = this.gameProxy.getOpponent().status;

    if (gamePhase === GamePhase.place_ships) {
      if (playerStatus === PlayerStatus.placing_ships) {
        const plannedMove = planPlaceShips(this.gameProxy.getGameConfig(), this.gameProxy.getPlayer());
        this.gameProxy.placeShip(plannedMove.ship, plannedMove.x, plannedMove.y, plannedMove.rotationDeg);
      } else if (playerStatus === PlayerStatus.ships_placed) {
        this.gameProxy.shipsReady();
      } else {
        this.gameProxy.userMessage.message('Waiting on player to place ships.');
      }

    } else if (gamePhase === GamePhase.fight) {
      if (playerStatus === PlayerStatus.planning_attack) {
        if (opponentStatus === PlayerStatus.planning_attack) {
          // wait for opponent to attack, otherwise AI is always half a turn ahead
          this.gameProxy.userMessage.message('Waiting on opponent to to attack');
        } else {
          const plannedAttack = analyzeCurrentState(this.gameProxy.getBoard(), this.gameProxy.getOpponent());
          if (plannedAttack) {
            this.gameProxy.attackLocation(plannedAttack.x, plannedAttack.y);
          } else {
            this.gameProxy.userMessage.error('Could not determine attack');
          }
        }

      } else if (playerStatus === PlayerStatus.reloading) {
        this.gameProxy.userMessage.error('Reloading, waiting on opponent to take their turn.');
      } else {
        this.gameProxy.userMessage.error('Unhandled player phase: ' + playerStatus);
      }

    } else if (gamePhase === GamePhase.game_over) {
      this.gameProxy.userMessage.message('Game Over');

    } else {
      this.gameProxy.userMessage.error('AI doesnt work for phase ' + gamePhase);
    }
  }

}
