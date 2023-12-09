'use strict';

/*
* Logic for determining where to place ships for AI
* */

// plan out all ship placements for player
export function planPlaceShips(gameConfig, player) {
  const remainingShipsToPlace = gameConfig.ships.filter(remShip => {
    // if the player hasn't placed ship, it needs to be placed
    return player.playerShips.findIndex(ps => ps.ship.id === remShip.id) === -1;
  });

  if (remainingShipsToPlace.length === 0) return null;

  const playerBoard = [];
  // offset the area to the start of their region
  for (let j = player.region.y0; j <= player.region.y1; j++) {
    playerBoard[j - player.region.y0] = [];
    for (let i = player.region.x0; i <= player.region.x1; i++) {
      playerBoard[j - player.region.y0][i - player.region.x0] = null;
    }
  }

  // update the playerBoard with locations already occupied
  for (const playerShip of player.playerShips) {
    for (const ssXY of playerShip.shipSpacesXY) {
      playerBoard[ssXY.y - player.region.y0][ssXY.x - player.region.x0] = playerShip;
    }
  }

  remainingShipsToPlace.sort((a, b) => b.size - a.size);
  const plannedMove = findPossibleLocationsForShip(playerBoard, remainingShipsToPlace[0]);
  // need to reconvert the region offsets back for player
  if (plannedMove) {
    plannedMove.x = plannedMove.x + player.region.x0;
    plannedMove.y = plannedMove.y + player.region.y0;
  }
  return plannedMove;
}

// find all possible locations for the ship, used for small boards where everything
// is compact.  Big boards probably should use different approach
function findPossibleLocationsForShip(playerBoard, ship) {
  const possibleRangesX = [];
  const possibleRangesY = [];
  // try to fit the ship on x-axis
  for (let j = 0; j < playerBoard.length; j++) {
    let emptyChainStart = null;
    for (let i = 0; i < playerBoard[j].length; i++) {
      if (playerBoard[j][i] === null) {
        if (emptyChainStart === null) emptyChainStart = i;
      } else {
        //  playerBoard spot is occupied, so the ship must fit before this
        let emptyChainLength = i - emptyChainStart;
        if (emptyChainStart !== null && emptyChainLength >= ship.size) {
          possibleRangesX.push({y: j, x0: emptyChainStart, x1: i - 1});
        }
        emptyChainStart = null;
      }
    }
    //  end of the row, so check if it fits in gap
    let emptyChainLength = playerBoard[j].length - emptyChainStart;
    if (emptyChainStart !== null && emptyChainLength >= ship.size) {
      possibleRangesX.push({y: j, x0: emptyChainStart, x1: playerBoard[j].length - 1});
    }
  }

  // try to fit the ship on y-axis
  // assume all of board width is same as first row
  for (let i = 0; i < playerBoard[0].length; i++) {
    let emptyChainStart = null;
    for (let j = 0; j < playerBoard.length; j++) {
      if (playerBoard[j][i] === null) {
        if (emptyChainStart === null) emptyChainStart = j;
      } else {
        //  playerBoard spot is occupied, so the ship must fit before this
        let emptyChainLength = j - emptyChainStart;
        if (emptyChainStart !== null && emptyChainLength >= ship.size) {
          possibleRangesY.push({x: i, y0: emptyChainStart, y1: j - 1});
        }
        emptyChainStart = null;
      }
    }
    //  end of the col, so check if it fits in gap
    let emptyChainLength = playerBoard.length - emptyChainStart;
    if (emptyChainStart !== null && emptyChainLength >= ship.size) {
      possibleRangesY.push({x: i, y0: emptyChainStart, y1: playerBoard.length - 1});
    }
  }

  //  randomly pick a range, then location
  if (possibleRangesY.length === 0) {
    if (possibleRangesX.length === 0) {
      throw new Error('No possible locations to put ship.');
    } else {
      return getRandomFromRangesX(ship, possibleRangesX);
    }
  } else {
    if (possibleRangesX.length === 0) {
      return getRandomFromRangesY(ship, possibleRangesY);
    } else {
      if (Math.random() >= .5) {
        return getRandomFromRangesX(ship, possibleRangesX);
      } else {
        return getRandomFromRangesY(ship, possibleRangesY);
      }
    }
  }
}

function getRandomFromRangesX(ship, possibleRangesX) {
  const randomRange = getRandomElement(possibleRangesX);
  return {
    ship,
    rotationDeg: 270,
    y: randomRange.y,
    // x0 to x1 is the width of spaces available, but the ship length must be handled
    x: getRandomBetween(randomRange.x0, randomRange.x1 - ship.size)
  };
}

function getRandomFromRangesY(ship, possibleRangesY) {
  const randomRange = getRandomElement(possibleRangesY);
  return {
    ship,
    rotationDeg: 0,
    x: randomRange.x,
    // x0 to x1 is the width of spaces available, but the ship length must be handled
    y: getRandomBetween(randomRange.y0, randomRange.y1 - ship.size)
  };
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomBetween(start, end) {
  return Math.floor(Math.random() * (end + 1 - start)) + start;
}
