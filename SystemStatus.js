export class SystemStatus {
  constructor({ wrap, startTrigger, endTrigger }) {
    this.wrap = wrap;
    this.startTrigger = startTrigger;
    this.endTrigger = endTrigger;
    this.timeline = gsap.timeline();
    this.init();
  }

  init() {
    gsap.timeline({
      scrollTrigger: {
        trigger: this.startTrigger,
        endTrigger: this.endTrigger,
        start: () => `top top`,
        end: () => `bottom center`,
        onToggle: self => {
          this.wrap.classList.toggle('active', self.isActive)
        },
      },
    });
  }
}