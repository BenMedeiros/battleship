'use strict';

// keep track of where the hover is drawn so it can be quickly erased on top layer
import {getLastCursorPosition, saveCursorPosition} from "../canvas/interactions.js";
import {drawRotated} from "../canvas/drawHelpers.js";
import {getSelectedAsset, getSelectedAssetImage} from "./assetPlacer.js";

export class HoverProjection {
  constructor(gridSystem) {
    // draw on requestAnimation not mousemove, so turn off when we leave canvas
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

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('hover-projection');
    this.canvas.style.left = this.gridSystem.canvas.style.left;
    this.ctx = this.canvas.getContext("2d");

    this.canvas.height = this.gridSystem.height;
    this.canvas.width = this.gridSystem.width;

    this.gridSystem.canvas.parentNode.appendChild(this.canvas);
  }

  clearLastDraw() {
    if (this.img) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // this.ctx.clearRect(this.actualX, this.actualY, this.img.width, this.img.height);
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
    // this.ctx.drawImage(img, actualX, actualY, img.width, img.height);
    console.log(this.rotation);
    drawRotated(this.ctx, img, actualX, actualY, this.rotation);
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

  handleMouseEvents() {
    this.canvas.addEventListener('mousemove', event => {
      saveCursorPosition(this.canvas, event);
    });
    //highlight cell on click
    this.canvas.addEventListener('mouseup', event => {
      // only left click
      if (event.button !== 0) return;

      const pixelXY = getLastCursorPosition();
      const xy = this.gridSystem.getGridLocationByPixelXY(pixelXY.x, pixelXY.y);
      // if (xy) this.highlightGridLocation(xy.x, xy.y);

      const ship = getSelectedAsset();
      if (!ship) {
        throw new Error('Ship not found for asset');
      }
      this.gridSystem.gameProxy.placeShip(ship, xy.x, xy.y, this.rotation).then();
    });
    // start animating when the mouse is over canvas
    this.canvas.addEventListener('mouseover', event => {
      this.animating = true;
      window.requestAnimationFrame(this.drawShipOnTop.bind(this));
    });
    // stop animating when mouse leaves canvas
    this.canvas.addEventListener('mouseout', (event) => {
      // mouseout event is called before mousemove so add delay to clear
      this.animating = false;
      saveCursorPosition(this.canvas, event);
      this.clearLastDraw();
    });
    // scroll to rotate img
    this.canvas.addEventListener('wheel', event => {
      if (event.wheelDeltaY > 0) {
        this.rotation += 90;
      } else if (event.wheelDeltaY < 0) {
        this.rotation -= 90;
      }
    });
  }

  // draws the ship in the top this.ctx when user moves it around
  drawShipOnTop(timestamp) {
    if (!this.animating) return;
    window.requestAnimationFrame(this.drawShipOnTop.bind(this));
    const img = getSelectedAssetImage();
    const pixelXY = getLastCursorPosition();
    if (pixelXY) {
      this.drawImage(img, pixelXY.x, pixelXY.y, timestamp);
    }
  }
}
