'use strict';

import {getCursorPosition} from "../canvas/interactions.js";
import {loadServerImage} from "../canvas/fileHandler.js";
import image_manifest from "../../assets/img/image_manifest.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

export function setupCanvas() {
  canvas.height = 600;
  canvas.width = 600;


  ctx.fillStyle = 'rgb(66,135,133)';
  ctx.fillRect(0, 0, 600, 500);
  console.log('draw rect');

  trackClick();
}

let mousedown = false;
let moves = 0;

function trackClick() {
  canvas.addEventListener('mousedown', (event) => {
    mousedown = true;
    const {x, y} = getCursorPosition(canvas, event)
    ctx.fillStyle = 'rgb(5,5,5)';
    ctx.fillRect(Math.round(x), Math.round(y), 5, 5);

    moves = 0;
  });

  canvas.addEventListener('mousemove', event => {
    if (!mousedown) return;

    moves++;
    console.log(moves);
    const {x, y} = getCursorPosition(canvas, event)
    ctx.fillStyle = 'rgb(5,5,5)';
    ctx.fillRect(Math.round(x), Math.round(y), 5, 5);
  });

  document.addEventListener('mouseup', event => {
    mousedown = false;
  });
}

export function drawSomeShips() {
  loadServerImage(image_manifest.ship_3.src, drawImage);

}

function drawImage(img) {
  ctx.drawImage(img, 300, 300, img.width, img.height);
}
