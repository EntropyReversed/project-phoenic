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
    this.initAnimation();
  }

  initAnimation() {
    this.graphWrap = document.createElement('div');
    this.graphWrap.classList.add('animated-graph');
    this.graphWrap.dataset.colorOne = getComputedStyle(this.cards[0]).getPropertyValue('--c-color');

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

    // this.graphWrap.addEventListener('mouseenter', () => {
    //   gsap.timeline().to(this.graph.linesParams, {
    //     color: '#ffffff',
    //     duration: 2,
    //   }).to(this.graph, { amplitudeStrength: 1, onUpdate: () => {
    //     this.graph.updateAmplitude()
    //   } }, '<')
    //   .to(this.graph, { frequency: 0.3, onUpdate: () => {
    //     this.graph.updateFrequency()
    //   } }, '<')
    // })

    // this.graphWrap.addEventListener('mouseleave', () => {
    //   gsap.timeline().to(this.graph.linesParams, {
    //     color: '#39EED8',
    //     duration: 2,
    //   }).to(this.graph, { amplitudeStrength: 0.5, onUpdate: () => {
    //     this.graph.updateAmplitude()
    //   } }, '<')
    //   .to(this.graph, { frequency: 0.7, onUpdate: () => {
    //     this.graph.updateFrequency()
    //   } }, '<')
    // })

    this.cards.forEach((card, index) => {
      const color = getComputedStyle(card).getPropertyValue('--c-color');

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: () => `top bottom`,
          end: () => `bottom top`,
          markers: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const cardInner = card.querySelector(this.cardSelectorInner);

      timeline
        .to(cardInner, {
          keyframes: {
            "0%": { scale: 0.3, opacity: 0},
            "20%": { scale: 0.4, opacity: 0},
            "45%": { scale: 1, opacity: 1},
            "50%": { scale: 1, opacity: 1},
            "55%": { scale: 1, opacity: 1},
            "80%": { scale: 0.4, opacity: 0 },
            "100%": { scale: 0.3, opacity: 0 },
            easeEach: 'none',
            ease: 'none',
          },
          duration: 2,
        }, 'start')

        if (index === 0) {
          timeline.to(
            this.graphWrap,
            {
              opacity: 1,
              delay: 0.4,
              duration: 1.5,
            },
            'start'
          )
        }

        if (this.images[index]) {
          timeline.to(
            this.images[index],
            {
              opacity: 1,
              duration: 2,
            },
            'start'
          )
        }

      if (index === this.cards.length - 1) {
        timeline.to(this.graph, { 
          amplitudeStrength: 1,
          delay: 0.6,
          duration: 0.5,
          onUpdate: () => {
            this.graph.updateAmplitude()
          }
        }, 'start')
        for (let i = 0; i < this.cards.length; i++) {
          const color = getComputedStyle(this.cards[i]).getPropertyValue('--c-color');
          if (!this.graph.linesParams[i]) return;
          timeline.to(this.graph.linesParams[i], {
            color,
            delay: 0.6,
            duration: 0.5,
          }, 'start')
        }
      } else {
        timeline.to(this.graph.linesParams, {
          color,
          delay: 0.6,
          duration: 0.5,
        }, 'start')
      }


      // if (index !== this.cards.length - 1) {
      //   timeline
      //     .to(
      //       cardInner,
      //       {
      //         scale: 0.3,
      //         delay: 0.2,
      //         duration: 2,
      //       }
      //     )
      //     .to(
      //       cardInner,
      //       {
      //         opacity: 0,
      //         duration: 1,
      //       },
      //       '<'
      //     )        

      //     if (this.images[index]) {
      //       timeline.to(this.images[index], {
      //         opacity: 0,
      //         delay: 0.2,
      //         duration: 1,
      //       }, 'start+=1.5');
      //     }
      // }
    });
  }
}