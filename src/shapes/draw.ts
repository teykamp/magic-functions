/*
  This file contains helper functions for drawing shapes on the canvas.
*/
import { getAngle, getLargestAngularSpace, rotatePoint } from "./helpers";
import type { Circle, Line, Square, Triangle, UTurnArrow } from "./types"

/**
 * @description parent function that returns all the draw functions for the shapes
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw the shapes on
 * @returns an object that aggregates all the draw functions to draw a shape on the canvas
 */
export const drawShape = (ctx: CanvasRenderingContext2D) => ({
  drawCircle: drawCircleWithCtx(ctx),
  drawLine: drawLineWithCtx(ctx),
  drawSquare: drawSquareWithCtx(ctx),
  drawTriangle: drawTriangleWithCtx(ctx),
  drawArrow: drawArrowWithCtx(ctx),
  drawUTurnArrow: drawUTurnArrowWithCtx(ctx),
})

export const drawCircleWithCtx = (ctx: CanvasRenderingContext2D) => (options: Circle) => {
  const { at, radius, color = 'black' } = options;
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  if (options.stroke) {
    const { color, width } = options.stroke;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  if (options.text) {
    const { content, fontSize, fontWeight, color } = options.text;
    ctx.font = `${fontWeight} ${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(content, at.x, at.y);
  }

  ctx.closePath();
}

export const drawSquareWithCtx = (ctx: CanvasRenderingContext2D) => (options: Square) => {
  const { at, width, height, color = 'black' } = options;
  ctx.beginPath();
  ctx.rect(at.x, at.y, width, height);
  ctx.fillStyle = color;
  ctx.fill();

  if (options.stroke) {
    const { color, width } = options.stroke;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  if (options.text) {
    const { content, fontSize, fontWeight, color } = options.text;
    ctx.font = `${fontWeight} ${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(content, at.x + width / 2, at.y + height / 2);
  }

  ctx.closePath();
}

export const drawLineWithCtx = (ctx: CanvasRenderingContext2D) => (options: Line) => {
  const { start, end, color = 'black', width } = options;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.closePath();
}

export const drawTriangleWithCtx = (ctx: CanvasRenderingContext2D) => (options: Triangle) => {
  const { point1, point2, point3, color = 'black' } = options;
  ctx.beginPath();
  ctx.moveTo(point1.x, point1.y);
  ctx.lineTo(point2.x, point2.y);
  ctx.lineTo(point3.x, point3.y);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

export const drawArrowWithCtx = (ctx: CanvasRenderingContext2D) => (options: Line) => {
  const { drawLine, drawTriangle } = drawShape(ctx);
  const { start: lineStart, end: lineEnd, width, color = 'black' } = options;

  const arrowHeadHeight = 25;

  const angle = Math.atan2(lineEnd.y - lineStart.y, lineEnd.x - lineStart.x);

  const epiCenter = {
    x: lineEnd.x - arrowHeadHeight * Math.cos(angle),
    y: lineEnd.y - arrowHeadHeight * Math.sin(angle),
  }

  const pLineLength = arrowHeadHeight / 1.75;

  const trianglePt1 = lineEnd;

  const trianglePt2 = {
    x: epiCenter.x + pLineLength * Math.cos(angle + Math.PI / 2),
    y: epiCenter.y + pLineLength * Math.sin(angle + Math.PI / 2),
  }

  const trianglePt3 = {
    x: epiCenter.x - pLineLength * Math.cos(angle + Math.PI / 2),
    y: epiCenter.y - pLineLength * Math.sin(angle + Math.PI / 2),
  }

  drawLine({
    start: lineStart,
    end: epiCenter,
    width,
    color,
  })

  drawTriangle({
    point1: trianglePt1,
    point2: trianglePt2,
    point3: trianglePt3,
    color,
  });
}

export const drawUTurnArrowWithCtx = (ctx: CanvasRenderingContext2D) => (options: UTurnArrow) => {
  const { drawLine, drawTriangle } = drawShape(ctx);
  const { spacing, center, upDistance, downDistance, angle, lineWidth, color = 'black' } = options;

  const arrowHeadHeight = 22;
  const pLineLength = arrowHeadHeight / 1.75;

  const longLegFrom = rotatePoint({ x: center.x, y: center.y - spacing }, center, angle);
  const longLegTo = rotatePoint({ x: center.x + upDistance, y: center.y - spacing}, center, angle);

  const shortLegFrom = rotatePoint({ x: center.x + upDistance, y: center.y + spacing }, center, angle);
  const shortLegTo = rotatePoint({ x: center.x + upDistance - downDistance, y: center.y + spacing }, center, angle);

  const arcCenter = rotatePoint({ x: center.x + upDistance, y: center.y }, center, angle);

  const epiCenter = {
    x: shortLegTo.x + pLineLength * Math.cos(angle),
    y: shortLegTo.y + pLineLength * Math.sin(angle),
  }
  
  const trianglePt1 = rotatePoint({ x: center.x + upDistance - downDistance - pLineLength, y: center.y + spacing }, center, angle);

  const trianglePt2 = {
    x: epiCenter.x + pLineLength * Math.cos(angle + Math.PI / 2),
    y: epiCenter.y + pLineLength * Math.sin(angle + Math.PI / 2),
  }

  const trianglePt3 = {
    x: epiCenter.x - pLineLength * Math.cos(angle + Math.PI / 2),
    y: epiCenter.y - pLineLength * Math.sin(angle + Math.PI / 2),
  }

  drawTriangle({
    point1: trianglePt1,
    point2: trianglePt2,
    point3: trianglePt3,
    color
  })
  
  drawLine({
    start: { x: longLegFrom.x, y: longLegFrom.y },
    end: { x: longLegTo.x, y: longLegTo.y },
    width: lineWidth,
    color
  })
  
  drawLine({
    start: { x: shortLegFrom.x, y: shortLegFrom.y },
    end: { x: shortLegTo.x, y: shortLegTo.y },
    width: lineWidth,
    color
  })
  
  ctx.beginPath();
  ctx.arc(arcCenter.x, arcCenter.y, spacing, Math.PI / 2 + angle, -Math.PI / 2 + angle, true);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}