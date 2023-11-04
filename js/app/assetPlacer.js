'use strict';

import img_manifest from "../../assets/img/img_manifest.js";
import {loadServerImage} from "../canvas/fileHandler.js";

// asset from the sidebar user is using
let selectedAssetKey = null
let selectedEl = null;

export function populateSidebar() {
  const sidebarEl = document.getElementById('sidebar');

  for (const [key, obj] of Object.entries(img_manifest)) {
    const divWrapper = document.createElement('div');
    divWrapper.onclick = () => {
      if (selectedEl === divWrapper) {
        selectedEl.classList.remove('selected');
        selectedEl = null;
        selectedAssetKey = null;
      } else if (selectedEl === null) {
        selectedEl = divWrapper;
        selectedAssetKey = key;
      } else {
        selectedEl.classList.remove('selected');
        selectedEl = divWrapper;
        selectedAssetKey = key;
      }

      if (selectedEl) selectedEl.classList.add('selected');
    }

    const title = document.createElement('h3');
    title.innerText = key;
    divWrapper.appendChild(title);

    const image = document.createElement('img');
    image.src = obj.src;
    image.alt = obj.fileName;
    divWrapper.appendChild(image);

    sidebarEl.appendChild(divWrapper);
  }
}

export function getSelectedAssetKey() {
  return selectedAssetKey;
}

export function getSelectedAssetImage() {
  if (!selectedAssetKey) return;
  const img = loadServerImage(img_manifest[selectedAssetKey].src);
  return img;
}
