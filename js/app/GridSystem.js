'use strict';

import {getCursorPosition, getLastCursorPosition, saveCursorPosition} from "../canvas/interactions.js";
import {getSelectedAssetImage, getSelectedAssetKey} from "./assetPlacer.js";
import {drawGrid, drawRotated} from "../canvas/drawHelpers.js";
import {loadServerImage} from "../canvas/fileHandler.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvas_top = document.getElementById('canvas_top');
const ctx_top = canvas_top.getContext("2d");

// keep track of where the hover is drawn so it can be quickly erased on top layer
class HoverProjection {
  constructor(gridSystem) {
    // draw on requestAnimation not mousemove, but turn off when we leave canvas
    this.animating = false;
    if (!gridSystem) throw new Error('HoverProjections must be mapped 1-1 to GridSystem');
    this.gridSystem = gridSystem;

    this.mouseX = -1;
    this.mouseY = -1;
    this.gridX = -1;
    this.gridY = -1;
    this.actualX = -1;
    this.actualY = -1;
    this.rotation = 0;
    this.lastDrawRotation = 0;

    this.img = null;
    this.timestamp = null;
    this.counter = 0;
  }

  clearLastDraw() {
    if (this.img) {
      ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
      // ctx_top.clearRect(this.actualX, this.actualY, this.img.width, this.img.height);
    }
  }

  // draw the temp image if it has moved on the grid system, and store to clear
  // that small img section later
  drawImage(img, mouseX, mouseY, timestamp) {
    const pixelXY = getLastCursorPosition();
    // don't redraw if mouse hasn't moved
    if (this.mouseX === mouseX && this.mouseY === mouseY
      && this.lastDrawRotation === this.rotation) return;

    const gridXY = this.gridSystem.getGridLocationByPixelXY(pixelXY.x, pixelXY.y);
    if (!gridXY) return;
    // don't redraw if same grid cell
    if (gridXY.x === this.gridX && gridXY.y === this.gridY
      && this.lastDrawRotation === this.rotation) return;

    this.clearLastDraw();

    if (!img) {
      // mark that it was cleared and don't redraw
      img = null;
      return;
    }

    const actualX = this.gridSystem.getPixelX(gridXY.x);
    const actualY = this.gridSystem.getPixelY(gridXY.y);

    // draw image on the canvas since user placed it
    // ctx_top.drawImage(img, actualX, actualY, img.width, img.height);
    console.log(this.rotation);
    drawRotated(ctx_top, img, actualX, actualY, this.rotation);
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    this.gridX = gridXY.x;
    this.gridY = gridXY.y;
    this.actualX = actualX;
    this.actualY = actualY;
    this.lastDrawRotation = this.rotation;
    this.img = img;
    this.timestamp = timestamp;
    this.counter++;
  }
}

// handles the mapping between pixels and x/y player grids
export class GridSystem {
  constructor(gameProxy) {
    this.gameProxy = gameProxy;
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
    canvas.height = this.height;
    canvas.width = this.width;
    canvas_top.height = this.height;
    canvas_top.width = this.width;

    ctx.fillStyle = 'rgb(66,135,133)';
    ctx.fillRect(0, 0, this.width, this.height);

    this.hoverProjection = new HoverProjection(this);
    this.handleMouseEvents();

    for (const {player, x0, x1, y0, y1} of Object.values(this.playerFieldsMap)) {
      drawGrid(ctx, player.color, x0, x1, y0, y1, this.gridCellWidth(), this.gridCellHeight());
    }
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
    ctx.fillStyle = 'rgb(140,60,60)';
    ctx.fillRect(this.getPixelX(x), this.getPixelY(y), this.gridCellWidth(), this.gridCellHeight());
  }

  redrawPlayerShips() {
    for (const player of Object.values(this.gameProxy.getPlayers())) {
      for (const playerShip of Object.values(player.playerShips)) {
        const img = loadServerImage(playerShip.ship.asset.src);
        if (img) {
          drawRotated(ctx, img, this.getPixelX(playerShip.x), this.getPixelY(playerShip.y), playerShip.rotationDeg);
          // ctx.drawImage(img, this.getPixelX(playerShip.x), this.getPixelY(playerShip.y), img.width, img.height);
        }
      }
    }
  }

  handleMouseEvents() {
    canvas_top.addEventListener('mousemove', event => {
      saveCursorPosition(canvas, event);
    });
    //highlight cell on click
    canvas_top.addEventListener('mouseup', event => {
      // only left click
      if (event.buttons !== 0) return;

      const pixelXY = getLastCursorPosition();
      const xy = this.getGridLocationByPixelXY(pixelXY.x, pixelXY.y);
      // if (xy) this.highlightGridLocation(xy.x, xy.y);

      const shipAssetKey = getSelectedAssetKey();
      if (!shipAssetKey) return;
      console.log(this.gameProxy);
      const ship = this.gameProxy.getGameConfig().ships.find(sh => sh.assetKey === shipAssetKey);
      if (!ship) {
        throw new Error('Ship not found for asset');
      }
      this.gameProxy.placeShip(ship, xy.x, xy.y, this.hoverProjection.rotation)
        // -90 cause that's the image difference between
        .then(() => {
          // TODO attach this to event or call from GameProxy
          this.redrawPlayerShips();
        });
    });
    // start animating when the mouse is over canvas
    canvas_top.addEventListener('mouseover', event => {
      this.hoverProjection.animating = true;
      console.log('mosueouver');
      window.requestAnimationFrame(this.drawShipOnTop.bind(this));
    });
    // stop animating when mouse leaves canvas
    canvas_top.addEventListener('mouseout', (event) => {
      // mouseout event is called before mousemove so add delay to clear
      this.hoverProjection.animating = false;
      saveCursorPosition(canvas, event);
      this.hoverProjection.clearLastDraw();
    });
    // scroll to rotate img
    canvas_top.addEventListener('wheel', event => {
      if (event.wheelDeltaY > 0) {
        this.hoverProjection.rotation += 90;
      } else if (event.wheelDeltaY < 0) {
        this.hoverProjection.rotation -= 90;
      }
    });
  }

  // draws the ship in the top ctx when user moves it around
  drawShipOnTop(timestamp) {
    if (!this.hoverProjection.animating) return;
    window.requestAnimationFrame(this.drawShipOnTop.bind(this));
    const img = getSelectedAssetImage();
    const pixelXY = getLastCursorPosition();
    if (pixelXY) {
      this.hoverProjection.drawImage(img, pixelXY.x, pixelXY.y, timestamp);
    }
  }
}

//
// number  visually/expected
// 0       90
// 270     0
// 180     270
// 90      180
//
