// gsap.registerPlugin(ScrollTrigger) 

export class PathAnimation {
    constructor({wrap}) {
        this.wrap = wrap;
        this.svgWrap = this.wrap.querySelector('.path-animation__svg-wrap');
        this.scrollWrap = this.wrap.querySelector('.path-animation__scroll');
        this.svg = this.wrap.querySelector('svg');
        this.ship = this.svg.querySelector('.path-animation__ship')
        this.timeline = gsap.timeline();

        this.init();
    }

    positionCard(card, anchor, isLeft) {
        const point = { x: 0, y: 0 }
        const convertedPoint = MotionPathPlugin.convertCoordinates(
            anchor,
            card,
            point
        );

        gsap.set(card, {
            "--left": convertedPoint.x,
            "--top": convertedPoint.y,
        })

        if (isLeft) {
            gsap.set(card, {
                xPercent: -100
            })
        }
    }

    positionCards() {
        this.cards.forEach((card, i) => {
            this.positionCard(card, this.anchors[i], i % 2 === 0)
        });
    }

    createTimeline() {
        // const path = this.svg.querySelector('#path-animation__main-test');
        // path.style.strokeDasharray = `200 ${path.getTotalLength() - 370}`;
        // path.style.strokeDashoffset = path.getTotalLength();

        gsap.set(this.wrap, {'--rotation': '70deg'})
        this.timeline.clear()
            .to(this.scrollWrap, {y: () => -(this.svgWrap.offsetHeight - window.innerHeight * 0.5), duration: 10, delay: 2, ease: 'none'}, 'start')
            // .to(path, { strokeDashoffset: 0, duration: 10, ease: 'none' }, 'start')
            // .to(this.ship, {
            //     motionPath: {
            //         path: '#path-animation__main',
            //         align: '#path-animation__main',
            //         alignOrigin: [1, 0.5],
            //         autoRotate: 0,
            //     },
            //     transformOrigin: "50% 50%",
            //     duration: 10,
            //     ease: 'none'
            // }, 'start')

            this.segments.forEach((seg, i) => {
                seg.style.strokeDasharray = seg.getTotalLength();
                seg.style.strokeDashoffset = seg.getTotalLength();

                this.timeline.to(seg, { strokeDashoffset: 0, delay: i * 2, duration: 2, ease: 'none' }, 'start')
                .to(this.cardsInner[i], {opacity: 1, delay: 2, duration: 1, ease: 'none'}, '<')
            })
    }

    resetAnimation() {
        gsap.set(this.wrap, { '--rotation': '0deg' });
        gsap.set(this.svg, { y: 0 });
        gsap.set(this.cards, {
            y: 0, 
            xPercent: 0,
            "--left": 0,
            "--top": 0,
        });
    }

    init() {
        this.cards = this.wrap.querySelectorAll('.path-animation__card');
        this.cardsInner = this.wrap.querySelectorAll('.path-animation__card-wrap');
        this.anchors = this.svg.querySelectorAll('.path-animation__anchor');
        this.segments = this.svg.querySelectorAll('.path-animation__seg');

        this.positionCards();
        this.createTimeline();

        this.scrollTrigger = ScrollTrigger.create({
            trigger: this.wrap,
            start: 'top center',
            end: 'bottom bottom',
            // markers: true,
            scrub: 1,
            animation: this.timeline,
            invalidateOnRefresh: true,
        })

        window.addEventListener('resize', () => {
            this.resetAnimation();
            this.positionCards();
            this.createTimeline();
        })
    }
}