'use strict';

export function drawGrid(ctx, color, x0, x1, y0, y1, cellWidth, cellHeight) {
  ctx.beginPath();
  // vertical lines
  for (let i = x0; i <= x1; i += cellWidth) {
    ctx.moveTo(i, y0);
    ctx.lineTo(i, y1);
  }
  //horizontal lines
  for (let i = y0; i <= y1; i += cellHeight) {
    ctx.moveTo(x0, i);
    ctx.lineTo(x1, i);
  }

  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}
