import { AnimatedGraph } from './AnimatedGraph';
import { BlinkingBoxes } from './BlinkingBoxes';
import { BlinkingDots } from './BlinkingDots';
import { PathAnimation } from './PathAnimation';
import { TrajectoryMap } from './TrajectoryMap';
import { VerticalCardsAnimation } from './VerticalCardsAnimation';

const lenis = new Lenis()

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

document.addEventListener('DOMContentLoaded', () => {
  const allBoxes = document.querySelectorAll('.blinking-boxes');
  const allDots = document.querySelectorAll('.blinking-dots');
  const allAnimatedGraphs = document.querySelectorAll('.animated-graph');
  const trajectoryMap = document.querySelector('.trajectory-map');
  const pathAnimation = document.querySelector('.path-animation');

  const selectors = {
    cardsSelector: '.vertical-cards',
    cardSelector: '.vertical-cards__card',
    cardSelectorInner: '.vertical-cards__card-inner',
    graphSelector: '.vertical-cards__graph-wrap',
    imgSelector: '.vertical-cards__img',
  };

  const verticalCardsWrap = document.querySelector(selectors.cardsSelector);

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

  if (verticalCardsWrap) {
    new VerticalCardsAnimation({
      wrapSelector: selectors.cardsSelector,
      cardSelector: selectors.cardSelector,
      cardSelectorInner: selectors.cardSelectorInner,
      graphSelector: selectors.graphSelector,
      imgSelector: selectors.imgSelector,
    });
  }
});
