'use strict';

let lastCursorPosition = {x: null, y: null};

export function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  // canvas.client might be scaled by css
  const x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
  const y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
  // console.log("x: " + x + " y: " + y);
  return {x: Math.round(x), y: Math.round(y)};
}

export function saveCursorPosition(canvas, event) {
  lastCursorPosition = getCursorPosition(canvas, event);
}

// returns last cursor position, based on last getCursorPosition call
export function getLastCursorPosition() {
  return lastCursorPosition;
}
