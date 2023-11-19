'use strict';

import {loadServerImage} from "../canvas/fileHandler.js";

export class ShipSidebar {
  constructor(gridSystem, ships) {
    this.gridSystem = gridSystem;
// asset from the sidebar user is using
    this.selectedAssetKey = null;
    this.selectedEl = null;
    this.assets = ships;
    this.sidebarEl = null;

    this.buildSidebarElement();
  }

  destroy() {
    this.sidebarEl.remove();
    delete this;
  }

  hideSidebar() {
    this.sidebarEl.style.display = 'none';
  }

  getSelectedAssetKey() {
    return this.selectedAssetKey;
  }

  getSelectedAsset() {
    if (!this.selectedAssetKey) return;
    return this.assets[this.selectedAssetKey];
  }

  getSelectedAssetImage() {
    if (!this.selectedAssetKey) return;
    const img = loadServerImage(this.assets[this.selectedAssetKey].asset.src);
    return img;
  }

  buildSidebarElement() {
    this.sidebarEl = document.createElement('div');
    this.sidebarEl.id = 'sidebar';
    this.sidebarEl.classList.add('sidebar');
    this.gridSystem.gameBoardWrapperEl.appendChild(this.sidebarEl);

    for (const [i, ship] of Object.entries(this.assets)) {
      // ship images are designed for 60px grid
      loadServerImage(ship.asset.src);

      const divWrapper = document.createElement('div');
      divWrapper.onclick = () => {
        if (this.selectedEl === divWrapper) {
          this.selectedEl.classList.remove('selected');
          this.selectedEl = null;
          this.selectedAssetKey = null;
        } else if (this.selectedEl === null) {
          this.selectedEl = divWrapper;
          this.selectedAssetKey = i;
        } else {
          this.selectedEl.classList.remove('selected');
          this.selectedEl = divWrapper;
          this.selectedAssetKey = i;
        }

        if (this.selectedEl) this.selectedEl.classList.add('selected');
      }

      const title = document.createElement('h3');
      title.innerText = ship.assetKey;
      divWrapper.appendChild(title);

      const image = document.createElement('img');
      image.src = ship.asset.src;
      image.alt = ship.asset.fileName;
      divWrapper.appendChild(image);

      this.sidebarEl.appendChild(divWrapper);
    }
  }
}


