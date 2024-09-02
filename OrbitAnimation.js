export class OrbitAnimation {
  isVisible = false;

  constructor({wrap}) {
    this.wrap = wrap;
    this.svg = wrap.querySelector('svg');
    this.orbits = this.svg.querySelectorAll('.orbit-animation__orbit');
    this.planets = this.svg.querySelectorAll('.orbit-animation__planet');
    this.timeline = gsap.timeline();

    this.init()
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          this.timeline.play();
        } else {
          this.timeline.pause();
        }
      });
    }, options);

    observer.observe(this.wrap);
  }

  createAnimation() {
    this.config = [
      {
        start: 0.55,
        end: 1,
        duration: 48,
      },
      {
        start: 0.08,
        end: 0.4,
        duration: 72,
      },
      {
        start: 0.7,
        end: 1,
        duration: 18,
      },
    ]
  
    this.orbits.forEach((orbit, i) => {
      const { start, end, duration } = this.config[i];
      this.timeline
        .to(this.planets[i], {
          motionPath: {
            path: orbit,
            align: orbit,
            alignOrigin: [0.5, 0.5],
            start,
            end,
          },
          keyframes: {
            scale: [0,1,1,1,1,1,0]
          },
          repeat: -1,
          repeatDelay: Math.random() * 2 + 2,
          duration,
          ease: 'none',
        }, i === 0 ? 'start' : `start-=${Math.random() * 2 + 2}`)
    });

    this.timeline.pause();
  }

  init() {
    this.createAnimation();
    this.setupIntersectionObserver();
  }
}