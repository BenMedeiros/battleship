'use strict';

/*
* Create and manage boards, hit/miss states, etc.  Does not know about ships.
*
* */

import {TileStates} from "./statuses.js";

export function createEmptyBoard(height, width) {
  const board = [];
  for (let i = 0; i < height; i++) {
    board.push(new Array(width).fill(TileStates.empty));
  }
  return board;
}
