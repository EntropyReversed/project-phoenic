import gsap from 'gsap';

export class BlinkingDots {
  constructor({ wrap }) {
    this.wrap = wrap;
    this.dots = this.wrap.querySelectorAll('circle');
    this.timeline = gsap.timeline();
    this.init();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateIn(true)
          observer.disconnect(); 
        }
      });
    }, options);

    observer.observe(this.wrap);
  }

  animateIn(once = false) {
    this.timeline.clear();
    this.timeline.to(this.dots, {
      keyframes: {
        opacity: [1, 0.2, 0.8, 0.1, 1, 0.5, 1, 0.3, 1],
      },
      duration: 1,
      yoyo: !once,
      repeat: once ? 0 : -1,
      stagger: {
        each: Math.random(),
        amount: 1,
      },
    });
  };

  animateOut() {
    this.timeline.clear();
    this.timeline.to(this.dots, {
      opacity: 1,
      duration: 1,
      overwrite: true,
    });
  };

  init() {
    this.setupIntersectionObserver();

    this.wrap.addEventListener('mouseenter', () => {
      this.animateIn()
    })

    this.wrap.addEventListener('mouseleave', () => {
      this.animateOut()
    })
  }
}