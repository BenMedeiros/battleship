'use strict';

// grid draws to next cell since the x/y are points not defining areas
export function drawGrid(ctx, color, x0, x1, y0, y1, cellWidth, cellHeight) {
  ctx.beginPath();
  // vertical lines
  for (let i = x0; i <= x1 + cellWidth; i += cellWidth) {
    ctx.moveTo(i, y0);
    ctx.lineTo(i, y1 + cellWidth);
  }
  //horizontal lines
  for (let i = y0; i <= y1 + cellHeight; i += cellHeight) {
    ctx.moveTo(x0, i);
    ctx.lineTo(x1 + cellHeight, i);
  }

  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

export function drawRotated(ctx, img, x, y, angle) {
  ctx.save();
  // offset around the rotation point cause of the image
  ctx.translate(x + img.width / 2, y + img.width / 2);
  ctx.rotate((angle) * Math.PI / 180);
  const rotationPointX = img.width / 2;
  const rotationPointY = img.width / 2;
  ctx.translate(-rotationPointX, -rotationPointY);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
