'use strict';

import {getCursorPosition, getLastCursorPosition, saveCursorPosition} from "../canvas/interactions.js";
import {getSelectedAssetImage, getSelectedAssetKey} from "./assetPlacer.js";
import {drawGrid, drawRotated} from "../canvas/drawHelpers.js";
import {loadServerImage} from "../canvas/fileHandler.js";
import {HoverProjection} from "./HoverProjection.js";

const canvas_wrapper = document.getElementById('canvas_wrapper');
// offset additional gridSystems by left
let gridSystemInstances = 0;

// handles the mapping between pixels and x/y player grids
export class GridSystem {
  constructor(gameProxy) {
    this.gameProxy = gameProxy;
    this.gameProxy.bindGridSystem(this);
    this.height = 660;
    this.width = 660;
    this.margin = 30;

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
    this.playerFieldsMap = {};
    // only doing 2 players for now
    this.playerFieldsMap[this.gameProxy.getPlayers()[0].id] = {
      player: this.gameProxy.getPlayers()[0],
      x0: this.margin,
      x1: this.width - this.margin,
      y0: this.margin,
      y1: this.height / 2
    };
    this.playerFieldsMap[this.gameProxy.getPlayers()[1].id] = {
      player: this.gameProxy.getPlayers()[1],
      x0: this.margin,
      x1: this.width - this.margin,
      y0: this.height / 2,
      y1: this.height - this.margin
    };
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('canvas-board');
    this.canvas.style.left = (gridSystemInstances++ * 1.1 * this.width) + 200 + 'px';
    this.ctx = this.canvas.getContext("2d");

    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.ctx.fillStyle = 'rgb(66,135,133)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (const {player, x0, x1, y0, y1} of Object.values(this.playerFieldsMap)) {
      drawGrid(this.ctx, player.color, x0, x1, y0, y1, this.gridCellWidth(), this.gridCellHeight());
    }

    canvas_wrapper.appendChild(this.canvas);
    // run after adding canvas to parent
    this.hoverProjection = new HoverProjection(this);
    this.hoverProjection.setupCanvas();
    this.hoverProjection.handleMouseEvents();
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

  highlightGridLocation(x, y) {
    this.ctx.fillStyle = 'rgb(140,60,60)';
    this.ctx.fillRect(this.getPixelX(x), this.getPixelY(y), this.gridCellWidth(), this.gridCellHeight());
  }

  redrawPlayerShips() {
    for (const player of Object.values(this.gameProxy.getPlayers())) {
      for (const playerShip of Object.values(player.playerShips)) {
        const img = loadServerImage(playerShip.ship.asset.src);
        if (img) {
          drawRotated(this.ctx, img, this.getPixelX(playerShip.x), this.getPixelY(playerShip.y), playerShip.rotationDeg);
          // this.ctx.drawImage(img, this.getPixelX(playerShip.x), this.getPixelY(playerShip.y), img.width, img.height);
        }
      }
    }
  }
}

