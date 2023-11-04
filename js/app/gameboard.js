'use strict';

import {getCursorPosition, getLastCursorPosition, saveCursorPosition} from "../canvas/interactions.js";
import {loadServerImage} from "../canvas/fileHandler.js";
import img_manifest from "../../assets/img/img_manifest.js";
import {getSelectedAssetImage, getSelectedAssetKey} from "./assetPlacer.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvas_top = document.getElementById('canvas_top');
const ctx_top = canvas_top.getContext("2d");


export function setupCanvas() {
  canvas.height = 600;
  canvas.width = 600;
  canvas_top.height = 600;
  canvas_top.width = 600;

  ctx.fillStyle = 'rgb(66,135,133)';
  ctx.fillRect(0, 0, 600, 600);
  console.log('draw rect');

  trackClick();
}

function trackClick() {
  // let imageIndex = 0;
  const images = Object.values(img_manifest);

  canvas_top.addEventListener('mousemove', event => {
    saveCursorPosition(canvas, event);
  });
  // draw ship to main canvas on click
  canvas_top.addEventListener('mouseup', event => {
    const {x, y} = getLastCursorPosition();
    const img = getSelectedAssetImage();
    ctx.drawImage(img, x, y, img.width, img.height);
  });

  canvas_top.addEventListener('mouseover', event => {
    window.requestAnimationFrame(drawShipOnTop);
    animating = true;
  });

  canvas_top.addEventListener('mouseout', (event) => {
    // mouseout event is called before mousemove so add delay to clear
    animating = false;
    saveCursorPosition(canvas, event);
    clearLastTopDraw();
  });
}

let animating = false;

let lastDraw = {
  x: -1,
  y: -1,
  img: null,
  timestamp: 0,
  counter: 0
};

// draws the ship in the top ctx when user moves it around
function drawShipOnTop(timestamp) {
  if (!animating) return;

  window.requestAnimationFrame(drawShipOnTop);
  const {x, y} = getLastCursorPosition();
  // don't redraw if mouse hasn't moved
  if (lastDraw.x === x && lastDraw.y === y) return;

  const img = getSelectedAssetImage();
  if (!img) return;
  clearLastTopDraw();
  // draw image on the canvas since user placed it
  ctx_top.drawImage(img, x, y, img.width, img.height);
  lastDraw.x = x;
  lastDraw.y = y;
  lastDraw.img = img;
  lastDraw.timestamp = timestamp;
  lastDraw.counter++;
}

function clearLastTopDraw() {
  if (lastDraw.img) {
    ctx_top.clearRect(lastDraw.x, lastDraw.y, lastDraw.img.width, lastDraw.img.height);
  }
}
