'use strict';

export function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  // canvas.client might be scaled by css
  const x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
  const y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
  console.log("x: " + x + " y: " + y);
  return {x, y};
}


