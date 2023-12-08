'use strict';

import {loadServerImage} from "../canvas/fileHandler.js";

export class ShipSidebar {
  constructor(gridSystem, ships) {
    this.gridSystem = gridSystem;
// asset from the sidebar user is using
    this.selectedAssetKey = null;
    this.selectedEl = null;
    this.sidebarEl = null;
    this.shipElements = {};
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
    const allShips = this.gridSystem.gameProxy.getGameConfig().ships;
    return allShips[this.selectedAssetKey];
  }

  getSelectedAssetImage() {
    if (!this.selectedAssetKey) return;
    const allShips = this.gridSystem.gameProxy.getGameConfig().ships;
    const img = loadServerImage(allShips[this.selectedAssetKey].asset.src);
    return img;
  }

  updateAssetsPlacedStates() {
    for (const [shipId, shipEl] of Object.entries(this.shipElements)) {
      shipEl.classList.toggle('placed', this.gridSystem.gameProxy.isPlayerShipPlaced(shipId));
    }
  }

  clearSelected() {
    if (this.selectedEl) this.selectedEl.classList.remove('selected');
    this.selectedEl = null;
    this.selectedAssetKey = null;
  }

  createElementIn(parentElement) {
    const sidebarWrapperEl = document.createElement('div');
    sidebarWrapperEl.classList.add('sidebar-wrapper');

    this.gridSystem.gameProxy.controls.playerStatus.createElementIn(sidebarWrapperEl);
    this.gridSystem.gameProxy.controls.shipsReady.createElementIn(sidebarWrapperEl);
    this.gridSystem.gameProxy.controls.aiMove.createElementIn(sidebarWrapperEl);

    parentElement.appendChild(sidebarWrapperEl);

    this.sidebarEl = document.createElement('div');
    this.sidebarEl.id = 'sidebar';
    this.sidebarEl.classList.add('sidebar');
    sidebarWrapperEl.appendChild(this.sidebarEl);

    const allShips = this.gridSystem.gameProxy.getGameConfig().ships;
    for (const [i, ship] of Object.entries(allShips)) {
      // ship images are designed for 60px grid
      loadServerImage(ship.asset.src);

      const divWrapper = document.createElement('div');
      divWrapper.id = 'ship-asset-' + ship.id;
      this.shipElements[ship.id] = divWrapper;

      divWrapper.onclick = () => {
        if (this.selectedEl === divWrapper) {
          this.clearSelected();
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


