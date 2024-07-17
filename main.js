import { BlinkingBoxes } from './BlinkingBoxes';
import { BlinkingDots } from './BlinkingDots';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const allBoxes = document.querySelectorAll('.blinking-boxes');
  const allDots = document.querySelectorAll('.blinking-dots');

  if (allBoxes.length) {
    allBoxes.forEach((box) => {
      const { boxSize, gap, rows, cols } = box.dataset;

      new BlinkingBoxes({
        container: box,
        boxSize: +boxSize || 4,
        gap: +gap || 2,
        rows: +rows || 24,
        cols: +cols || 8,
      });
    });
  }

  if (allDots.length) {
    allDots.forEach((dot) => {
      new BlinkingDots({
        wrap: dot,
        // container: box,
        // boxSize: +boxSize,
        // gap: +gap,
        // rows: +rows,
        // cols: +cols,
      });
    });
  }
});
