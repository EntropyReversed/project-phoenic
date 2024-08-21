import { AnimatedGraph } from "./AnimatedGraph";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true})

export class VerticalCardsAnimation {
  constructor({ wrapSelector }) {
    this.wrap = document.querySelector(wrapSelector);
    this.cards = this.wrap.querySelectorAll('.vertical-cards__card');
    this.graphAndImages = this.wrap.querySelector('.graphs-and-images');
    this.images = this.wrap.querySelectorAll('.vertical-cards__img');
    this.cardSelectorInner = '.vertical-cards__card-inner';
    this.gradGroup = this.wrap.querySelectorAll('.vertical-cards__graph-grad g');
    this.gradCircles = this.wrap.querySelectorAll('.vertical-cards__graph-grad ellipse');

    this.cardOneColor = getComputedStyle(this.cards[0]).getPropertyValue('--c-color');
    this.init();
  }

  trackVH() {
    document.body.style.setProperty('--vh', window.innerHeight * 0.01 || 0);
  }

  createAnimatedGraph() {
    this.graphWrap = document.createElement('div');
    this.graphWrap.classList.add('animated-graph');
    this.graphWrap.dataset.colorOne = this.cardOneColor;

    this.graph = new AnimatedGraph({
      wrap: this.graphWrap,
      vertical: false,
      amplitude: 0.5,
      frequency: 0.5,
      attenuation: 2,
      speed: 1,
      flip: false,
      trackOpacity: false,
    });

    this.graphAndImages.appendChild(this.graphWrap);
  }

  initAnimation() {
    this.createAnimatedGraph();
    this.gradCircles.forEach(c => gsap.set(c, { fill: this.cardOneColor }))

    this.cards.forEach((card, index) => {
      const color = card.dataset.color;
      card.style.setProperty('--c-color', color);
      const isLast = index === this.cards.length - 1;

      this.timeline = gsap.timeline({
        scrollTrigger: {
          trigger: isLast ? card.parentElement : card,
          start: isLast ? 'top top' : 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const cardInner = card.querySelector(this.cardSelectorInner);

      if (index === 0) {
        this.timeline.to(
          this.graphWrap,
          {
            opacity: 1,
            delay: 0.3,
            duration: 1.5,
          },
          'start'
        )
        .to(this.gradGroup, 
          {
            opacity: 1,
            delay: 0.3,
            duration: 1,
          },
          'start'
        )
      }

      if (this.images[index]) {
        this.timeline.to(
          this.images[index],
          {
            keyframes: {
              "0%": { autoAlpha: 0},
              "20%": { autoAlpha: 0},
              "45%": { autoAlpha: 1},
              "50%": { autoAlpha: 1},
              "55%": { autoAlpha: 1},
              "80%": { autoAlpha: 0 },
              "100%": { autoAlpha: 0 },
              easeEach: 'none',
              ease: 'none',
            },
            duration: 2,
          },
          'start'
        )
      }

      if (isLast) {
        this.timeline
          .to(cardInner, {
            keyframes: {
              "0%": { autoAlpha: 0},
              "10%": { autoAlpha: 0},
              "30%": { autoAlpha: 1},
              "100%": { autoAlpha: 1 },
              easeEach: 'none',
              ease: 'none',
            },
            duration: 2,
          }, 'start')
          .to(this.graph, { 
            amplitudeStrength: 1,
            delay: 0.2,
            duration: 0.5,
          }, 'start')
          .to(this.gradGroup, { y: 0, delay: 0.2, duration: 0.6 }, 'start')

        for (let i = 0; i < this.cards.length; i++) {
          const color = this.cards[i].dataset.color;
          if (!this.graph.linesParams[i]) return;
          this.timeline.to(this.graph.linesParams[i], {
            color,
            delay: 0.2,
            duration: 0.5,
          }, 'start')
          .to(this.gradCircles[i], {
            fill: color,
            delay: 0.2,
            duration: 0.5,
          }, 'start')
        }
      } else {
        this.timeline
          .to(cardInner, {
            keyframes: {
              "0%": { scale: 0.3, autoAlpha: 0},
              "20%": { scale: 0.4, autoAlpha: 0},
              "45%": { scale: 1, autoAlpha: 1},
              "50%": { scale: 1, autoAlpha: 1},
              "55%": { scale: 1, autoAlpha: 1},
              "80%": { scale: 0.4, autoAlpha: 0 },
              "100%": { scale: 0.3, autoAlpha: 0 },
              easeEach: 'none',
              ease: 'none',
            },
            duration: 2,
          }, 'start')
          .to(this.graph.linesParams, {
            color,
            delay: 0.6,
            duration: 0.5,
          }, 'start')
          .to(this.gradCircles, {
            fill: color,
            delay: 0.6,
            duration: 0.5,
          }, 'start')
      }
    });
  }

  init() {
    this.trackVH();
    window.addEventListener('resize', () => this.trackVH());

    this.initAnimation();
  }
}