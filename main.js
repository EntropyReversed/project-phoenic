import { AnimatedGraph } from './AnimatedGraph';
import { BlinkingBoxes } from './BlinkingBoxes';
import { BlinkingDots } from './BlinkingDots';
import { PathAnimation } from './PathAnimation';
import { TrajectoryMap } from './TrajectoryMap';
import { VerticalCardsAnimation } from './VerticalCardsAnimation';

if (document.body.classList.contains('homepage') && window.innerWidth >= 991) {
  const lenis = new Lenis({
    touchMultiplier: 0,
    touchMultiplier: 0.5
  })
  
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  
  requestAnimationFrame(raf);
}

document.addEventListener('DOMContentLoaded', () => {
  const allBoxes = document.querySelectorAll('.blinking-boxes');
  const allDots = document.querySelectorAll('.blinking-dots');
  const allAnimatedGraphs = document.querySelectorAll('.animated-graph');
  const trajectoryMap = document.querySelector('.trajectory-map');
  const pathAnimation = document.querySelector('.path-animation');
  const verticalCardsWrap = document.querySelector('.vertical-cards');

  if (verticalCardsWrap) {
    new VerticalCardsAnimation({
      wrapSelector: '.vertical-cards',
    });
  }

  if (allBoxes.length) {
    allBoxes.forEach((box) => {
      const { size, gap, rows, cols } = box.dataset;

      new BlinkingBoxes({
        container: box,
        boxSize: Number(size ?? 4),
        gap: Number(gap ?? 2),
        rows: Number(rows ?? 24),
        cols: Number(cols ?? 8),
      });
    });
  }

  if (allDots.length) {
    allDots.forEach((dot) => {
      const { size, gap, rows, cols } = dot.dataset;

      new BlinkingDots({
        wrap: dot,
        cols: Number(cols ?? 2),
        rows: Number(rows ?? 10),
        size: Number(size ?? 2.5),
        gap: Number(gap ?? 5),
      });
    });
  }

  if (trajectoryMap) {
    new TrajectoryMap({
      wrap: trajectoryMap,
    });
  }

  if (allAnimatedGraphs.length) {
    allAnimatedGraphs.forEach((wrap) => {
      const {
        vertical,
        amplitude,
        frequency,
        attenuation,
        speed,
        flip,
        trackOpacity,
      } = wrap.dataset;

      new AnimatedGraph({
        wrap,
        vertical: vertical === 'true',
        amplitude: Number(amplitude ?? 1),
        frequency: Number(frequency ?? 1),
        attenuation: Number(attenuation ?? 2),
        speed: Number(speed ?? 1),
        flip: flip === 'true',
        trackOpacity: trackOpacity === 'true',
      });
    });
  }

  if (pathAnimation) {
    new PathAnimation({
      wrap: pathAnimation
    })
  }
});
