export class BlinkingDots {
  constructor({ wrap }) {
    this.wrap = wrap;
    this.dots = this.wrap.querySelectorAll('circle') 
    this.init();
  }

  init() {

    this.setupIntersectionObserver();
    this.animate();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    };

    // const observer = new IntersectionObserver((entries) => {
    //   entries.forEach(entry => {
    //     this.isVisible = entry.isIntersecting;
    //   });
    // }, options);

    // observer.observe(this.container);
  }

  animate() {
    console.log('animate', this.dots)
  };
}