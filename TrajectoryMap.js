import gsap from "gsap";

export class TrajectoryMap {
  constructor({ wrap }) {
    this.wrap = wrap;
    this.svg = this.wrap.querySelector('svg');
    this.ship = this.svg.querySelector('.ship');
    this.grip = this.svg.querySelector('.grid');
    this.dots = this.svg.querySelectorAll('.dots circle');
    this.circles = this.svg.querySelectorAll('.circles > g');
    this.pathMain = this.svg.querySelector('.path-main');

    this.timeline = gsap.timeline({paused: true});
    this.init();
  }

  trackSvgHeight() {
    this.wrap.style.height = `${this.svg.getBoundingClientRect().height}px`;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        entry.target.style.height = `${this.svg.getBoundingClientRect().height}px`;
      }
    });

    resizeObserver.observe(this.svg)
  }

  createTimeline() {
    this.timeline
      .set(this.circles, { '--offset': 0 })
      .to(this.dots,
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          stagger: {
            amount: 1,
          }
        }
      )
      .to(this.circles,
        {
          '--offset': 1,
          z: 0,
          ease: "power2.out",
          stagger: 0.1,
          duration: 1
        }, '<'
      )
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.timeline.play();
          observer.disconnect(); 
        }
      });
    }, options);

    observer.observe(this.wrap);
  }

  init() {
    this.trackSvgHeight();
    this.createTimeline();
    this.setupIntersectionObserver();

    this.wrap.addEventListener('mouseenter', () => {
      this.timeline.play()
    })

    this.wrap.addEventListener('mouseleave', () => {
      this.timeline.reverse()
    })
  }
}