gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(true);
export class VerticalCardsAnimation {
  constructor({ wrapSelector, cardSelector, cardSelectorInner, graphSelector, imgSelector }) {
    this.wrap = document.querySelector(wrapSelector);
    this.cards = this.wrap.querySelectorAll(cardSelector);
    this.graphs = this.wrap.querySelectorAll(graphSelector);
    this.images = this.wrap.querySelectorAll(imgSelector);
    this.cardSelectorInner = cardSelectorInner;
    this.initAnimation();
  }

  initAnimation() {
    this.cards.forEach((card, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: () => `top bottom-=20%`,
          end: () => `top top`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const cardInner = card.querySelector(this.cardSelectorInner);

      timeline
        .to(cardInner, {
          scale: 1,
          opacity: 1,
          duration: 1.5,
        }, 'start')
        .to(
          this.graphs[index],
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
          },
          'start'
        )
        .to(
          this.images[index],
          {
            opacity: 1,
            duration: 1.5,
          },
          'start'
        )


      if (index !== this.cards.length - 1) {
        timeline
          .to(
            cardInner,
            {
              scale: 0.3,
              duration: 2,
            }
          )
          .to(
            cardInner,
            {
              opacity: 0.1,
              duration: 1,
            },
            '<'
          )        
          .to(this.graphs[index], {
            opacity: 0,
            scale: 0.8,
            delay: 0.2,
            duration: 1,
          }, 'start+=1.5')
          .to(this.images[index], {
            opacity: 0,
            delay: 0.2,
            duration: 1,
          }, 'start+=1.5');
      }
    });
  }
}