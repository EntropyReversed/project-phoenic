// import { AnimatedGraph } from './AnimatedGraph.js';
// import { BlinkingBoxes } from './BlinkingBoxes.js';
import BlinkingDots from './BlinkingDots.js';
// import { TrajectoryMap } from './TrajectoryMap.js';

document.addEventListener('DOMContentLoaded', () => {
  // const allBoxes = document.querySelectorAll('.blinking-boxes');
  const allDots = document.querySelectorAll('.blinking-dots');
  // const allAnimatedGraphs = document.querySelectorAll('.animated-graph');
  // const trajectoryMap = document.querySelector('.trajectory-map');

  console.log('log from github script')

  // if (allBoxes.length) {
  //   allBoxes.forEach((box) => {
  //     const { size, gap, rows, cols } = box.dataset;

  //     new BlinkingBoxes({
  //       container: box,
  //       boxSize: +size || 4,
  //       gap: +gap || 2,
  //       rows: +rows || 24,
  //       cols: +cols || 8,
  //     });
  //   });
  // }

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

  // if (trajectoryMap) {
  //   new TrajectoryMap({
  //     wrap: trajectoryMap,
  //   });
  // }

  // if (allAnimatedGraphs.length) {
  //   allAnimatedGraphs.forEach(wrap => {
  //     const { isVertical } = wrap.dataset;
  //     console.log(Boolean(isVertical))
  //     new AnimatedGraph({
  //       wrap,
  //       isVertical: Boolean(isVertical)
  //     })
  //   });
  // }

});
