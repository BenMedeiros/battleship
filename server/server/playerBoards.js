'use strict';

/*
* Create and manage boards, hit/miss states, etc.  Does not know about ships.
*
* */

const tileStates = {
  empty: 0,
  hit: 1,
  miss: 2
}

export function createEmptyBoard(height, width) {
  const board = [];
  for (let i = 0; i < height; i++) {
    board.push(new Array(width).fill(tileStates.empty));
  }
  return board;
}
