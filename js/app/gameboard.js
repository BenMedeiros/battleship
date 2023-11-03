'use strict';

import {getCursorPosition} from "../canvas/interactions.js";
import {loadServerImage} from "../canvas/fileHandler.js";
import img_manifest from "../../assets/img/img_manifest.js";
import {getSelectedAssetKey} from "./assetPlacer.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

export function setupCanvas() {
  canvas.height = 600;
  canvas.width = 600;

  ctx.fillStyle = 'rgb(66,135,133)';
  ctx.fillRect(0, 0, 600, 600);
  console.log('draw rect');

  trackClick();
}


function trackClick() {
  // let imageIndex = 0;
  const images = Object.values(img_manifest);

  canvas.addEventListener('mousedown', (event) => {
    const {x, y} = getCursorPosition(canvas, event)
    // ctx.fillStyle = 'rgb(5,5,5)';
    // ctx.fillRect(Math.round(x), Math.round(y), 5, 5);

    // loadServerImage(images[imageIndex].src, (img) => drawImage(img, x, y));

    const selectedAsset = img_manifest[getSelectedAssetKey()];
    if (!selectedAsset) return;

    loadServerImage(selectedAsset.src, (img) => drawImage(img, x, y));
  });

  // canvas.addEventListener('wheel', event => {
  //   // +/- 1
  //   imageIndex += event.deltaY / Math.abs(event.deltaY);
  //   // clamp to array indexes
  //   imageIndex = Math.max(0, Math.min(images.length - 1, imageIndex));
  // });
}

function drawImage(img, x, y) {
  ctx.drawImage(img, x, y, img.width, img.height);
}
