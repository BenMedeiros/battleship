'use strict';

import {loadServerImage} from "../canvas/fileHandler.js";

// asset from the sidebar user is using
let selectedAssetKey = null
let selectedEl = null;

let assets = null;

export function populateSidebar(ships) {
  assets = ships;
  const sidebarEl = document.getElementById('sidebar');

  for (const [i, ship] of Object.entries(ships)) {
    // ship images are designed for 60px grid
    loadServerImage(ship.asset.src);

    const divWrapper = document.createElement('div');
    divWrapper.onclick = () => {
      if (selectedEl === divWrapper) {
        selectedEl.classList.remove('selected');
        selectedEl = null;
        selectedAssetKey = null;
      } else if (selectedEl === null) {
        selectedEl = divWrapper;
        selectedAssetKey = i;
      } else {
        selectedEl.classList.remove('selected');
        selectedEl = divWrapper;
        selectedAssetKey = i;
      }

      if (selectedEl) selectedEl.classList.add('selected');
    }

    const title = document.createElement('h3');
    title.innerText = ship.assetKey;
    divWrapper.appendChild(title);

    const image = document.createElement('img');
    image.src = ship.asset.src;
    image.alt = ship.asset.fileName;
    divWrapper.appendChild(image);

    sidebarEl.appendChild(divWrapper);
  }
}

export function getSelectedAssetKey() {
  return selectedAssetKey;
}

export function getSelectedAsset() {
  if (!selectedAssetKey) return;
  return assets[selectedAssetKey];
}

export function getSelectedAssetImage() {
  if (!selectedAssetKey) return;
  const img = loadServerImage(assets[selectedAssetKey].asset.src);
  return img;
}

