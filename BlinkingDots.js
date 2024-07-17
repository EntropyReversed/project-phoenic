export class BlinkingDots {
  constructor({ wrap }) {
    this.wrap = wrap;
    this.dots = this.wrap.querySelectorAll('circle') 
    this.init();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // run animation
        }
      });
    }, options);

    observer.observe(this.wrap);
  }

  animate() {
    console.log('animate', this.dots)
  };

  init() {
    this.setupIntersectionObserver();
    this.animate();
  }
}