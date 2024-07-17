import { BlinkingBoxes } from './BlinkingBoxes';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const allBoxes = document.querySelectorAll('.blinking-boxes');

  if (allBoxes.length) {
    allBoxes.forEach((box) => {
      const { boxSize, gap, rows, cols } = box.dataset;

      new BlinkingBoxes({
        container: box,
        boxSize: +boxSize,
        gap: +gap,
        rows: +rows,
        cols: +cols,
      });
    });
  }
});
