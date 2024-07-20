import { AnimatedGraph } from './AnimatedGraph';
import { BlinkingBoxes } from './BlinkingBoxes';
import { BlinkingDots } from './BlinkingDots';
import { TrajectoryMap } from './TrajectoryMap';

document.addEventListener('DOMContentLoaded', () => {
  const allBoxes = document.querySelectorAll('.blinking-boxes');
  const allDots = document.querySelectorAll('.blinking-dots');
  const allAnimatedGraphs = document.querySelectorAll('.animated-graph');
  const trajectoryMap = document.querySelector('.trajectory-map');

  if (allBoxes.length) {
    allBoxes.forEach((box) => {
      const { size, gap, rows, cols } = box.dataset;

      new BlinkingBoxes({
        container: box,
        boxSize: +size || 4,
        gap: +gap || 2,
        rows: +rows || 24,
        cols: +cols || 8,
      });
    });
  }

  if (allDots.length) {
    allDots.forEach((dot) => {
      const { size, gap, rows, cols } = dot.dataset;

      new BlinkingDots({
        wrap: dot,
        cols: +cols || 2,
        rows: +rows || 10,
        size: +size || 2.5,
        gap: +gap || 5,
      });
    });
  }

  if (trajectoryMap) {
    new TrajectoryMap({
      wrap: trajectoryMap,
    });
  }

  if (allAnimatedGraphs.length) {
    allAnimatedGraphs.forEach(wrap => {
      const { isVertical } = wrap.dataset;
      console.log(Boolean(isVertical))
      new AnimatedGraph({
        wrap,
        isVertical: Boolean(isVertical)
      })
    });
  }

});
