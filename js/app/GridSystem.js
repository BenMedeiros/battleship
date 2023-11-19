'use strict';

import {drawGrid, drawRotated} from "../canvas/drawHelpers.js";
import {loadServerImage} from "../canvas/fileHandler.js";
import {HoverProjection} from "./HoverProjection.js";
import {TileStates} from "../../server/server/statuses.js";
import {ShipSidebar} from "./ShipSidebar.js";

const canvas_wrapper = document.getElementById('canvas_wrapper');
// offset additional gridSystems by left
let gridSystemInstances = 0;

// handles the mapping between pixels and x/y player grids
export class GridSystem {
  constructor(gameProxy) {
    this.gameProxy = gameProxy;
    this.gameProxy.bindGridSystem(this);
    this.margin = 30;
    this.height = (this.gameProxy.getGameConfig().height * 60) + (2 * this.margin);
    this.width = (this.gameProxy.getGameConfig().width * 60) + (2 * this.margin);

    // height of a cell per player
    this.gridCellHeight = () => (this.height - (2 * this.margin)) / this.gameProxy.getGameConfig().height;
    //width of a cell per player
    this.gridCellWidth = () => (this.width - (2 * this.margin)) / this.gameProxy.getGameConfig().width;

    if (this.gridCellHeight() !== this.gridCellWidth()) {
      throw new Error('Cell height and width should be equal for now');
    } else if (this.gridCellWidth() !== 60) {
      // TODO apply mipmap scaling for different grid sizes
      throw new Error('Cell height/width should be 60 since to handle img sizes ' + this.gridCellWidth());
    }


    if (this.gameProxy.getPlayers().length !== 2) throw new Error('Only supporting 2 players atm');
  }

  setupCanvas() {
    this.gameBoardWrapperEl = document.createElement('div');
    this.gameBoardWrapperEl.classList.add('gameboard');

    this.shipSidebar = new ShipSidebar(this, this.gameProxy.getGameConfig().ships);

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('canvas-board');
    this.ctx = this.canvas.getContext("2d");

    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.ctx.fillStyle = 'rgb(66,135,133)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (const player of Object.values(this.gameProxy.getPlayers())) {
      drawGrid(this.ctx, player.color, this.getPixelX(player.region.x0), this.getPixelX(player.region.x1),
        this.getPixelY(player.region.y0), this.getPixelY(player.region.y1),
        this.gridCellWidth(), this.gridCellHeight());
    }

    this.gameBoardWrapperEl.appendChild(this.canvas);
    canvas_wrapper.appendChild(this.gameBoardWrapperEl);

    // run after adding canvas to parent
    this.hoverProjection = new HoverProjection(this);
    this.hoverProjection.setupCanvas();
    this.hoverProjection.handleMouseEvents();
  }

  destroy() {
    gridSystemInstances--;
    this.hoverProjection.destroy();
    this.canvas.remove();
    console.log('grid removed');
    delete this.hoverProjection;
    delete this.gameProxy;
    delete this;
  }

  getPixelX(x) {
    return this.margin + (x * this.gridCellWidth());
  }

  getPixelY(y) {
    return this.margin + (y * this.gridCellHeight());
  }

  getGridLocationByPixelXY(pixelX, pixelY) {
    if (pixelX <= this.margin || pixelX >= this.width - this.margin) {
      // console.log('out of bounds X');
      return;
    } else if (pixelY <= this.margin || pixelY >= this.height - this.margin) {
      console.log('out of bounds Y');
      return;
    }

    const x = Math.floor((pixelX - this.margin) * this.gameProxy.getGameConfig().width / (this.width - (2 * this.margin)));
    const y = Math.floor((pixelY - this.margin) * this.gameProxy.getGameConfig().height / (this.height - (2 * this.margin)));

    return {x, y};
  }

  isPlayerRegion(gridXY) {
    if (!gridXY) return false;
    const playerRegion = this.gameProxy.getPlayer().region;
    if (playerRegion.x0 > gridXY.x || playerRegion.x1 < gridXY.x) {
      return false;
    } else if (playerRegion.y0 > gridXY.y || playerRegion.y1 < gridXY.y) {
      return false;
    }
    return true;
  }

  isOpponentRegion(gridXY) {
    if (!gridXY) return false;
    const opponentRegion = this.gameProxy.getOpponent().region;
    if (opponentRegion.x0 > gridXY.x || opponentRegion.x1 < gridXY.x) {
      return false;
    } else if (opponentRegion.y0 > gridXY.y || opponentRegion.y1 < gridXY.y) {
      return false;
    }
    return true;
  }

  redrawPlayerShips() {
    const player = this.gameProxy.getPlayer();

    for (const playerShip of Object.values(player.playerShips)) {
      const img = loadServerImage(playerShip.ship.asset.src);
      if (img) {
        drawRotated(this.ctx, img, this.getPixelX(playerShip.x), this.getPixelY(playerShip.y), playerShip.rotationDeg);
      }
    }

    this.redrawBoardAttacks();
  }

  redrawBoardAttacks() {
    for (const [y, row] of Object.entries(this.gameProxy.getBoard())) {
      for (const [x, tileState] of Object.entries(row)) {
        if (tileState === TileStates.hit) {
          this.ctx.fillStyle = 'rgba(255,0,0,0.78)';
          this.ctx.fillRect(this.getPixelX(x), this.getPixelY(y), this.gridCellWidth(), this.gridCellHeight());
        } else if (tileState === TileStates.miss) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.78)';
          this.ctx.fillRect(this.getPixelX(x), this.getPixelY(y), this.gridCellWidth(), this.gridCellHeight());
        }
      }
    }
  }
}

