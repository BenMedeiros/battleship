'use strict';

/*
* Logic to determine where to attack
*
* */

export function analyzeCurrentState(board, opponent) {
  console.log('analyzzing ', board, opponent);
  return randomAttack(board, opponent);
}

// super random, basically useless
function randomAttack(board, opponent) {
  const x = getRandomBetween(opponent.region.x0, opponent.region.x1);
  const y = getRandomBetween(opponent.region.y0, opponent.region.y1);

  if (board[y][x] === 0) {
    return {x, y};
  } else {
    //  already attacked location, reroll
    return randomAttack(board, opponent);
  }
}


function getRandomBetween(start, end) {
  return Math.floor(Math.random() * (end + 1 - start)) + start;
}
