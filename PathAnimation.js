// gsap.registerPlugin(ScrollTrigger) 

const createHTMLElement = (tag, props) => {
	const element = document.createElement(tag);
	Object.keys(props).forEach((key) => {
		element[key] = props[key];
	});
	return element;
};

const createSVGElement = (tag, props) => {
	const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(props).forEach((key) => {
		element.setAttribute(key, props[key]);
	});
	return element;
};

export class PathAnimation {
    angle = 70;

    constructor({wrap}) {
        this.wrap = wrap;
        this.svgWrap = this.wrap.querySelector('.path-animation__svg-wrap');
        this.scrollWrap = this.wrap.querySelector('.path-animation__scroll');
        this.svg = this.wrap.querySelector('svg');
        this.ship = this.svg.querySelector('.path-animation__ship')
        this.timeline = gsap.timeline();

        this.init();
    }

    getPosition(item, target, point = { x: 0, y: 0 }) {
        return MotionPathPlugin.convertCoordinates(
            target,
            item,
            point
        );
    }

    positionCard(card, anchor, isLeft) {
        const { x, y } = this.getPosition(card, anchor);

        gsap.set(card, {
            "--left": x,
            "--top": y,
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

    positionLines() {
        this.lines.forEach((line, i) => {
            const target = this.linesTargets[i];
            const { x, y } = this.getPosition(line, target);

            gsap.set(line, {
                "--left": x,
                "--top": y,
            })
        })
    }

    createLines() {
        this.lines = [];
        this.linesTargets = [];
        this.linesPerSeg = 3;
        this.segments.forEach((seg, i) => {
            Array.from({length: this.linesPerSeg}).forEach((_, line) => {
                const len = seg.getTotalLength() / this.linesPerSeg;
                const isMain = len * line < len;
                const pos = seg.getPointAtLength(len * line);

                const target = createSVGElement('circle', {
                    cx: pos.x,
                    cy: pos.y+3,
                    r: 1,
                    fill: "transparent",
                });
                
                const lineEl = createHTMLElement('div', {
                    className: `path-animation__line ${isMain ? 'main' : ''}`
                });

                this.svg.appendChild(target);
                this.scrollWrap.appendChild(lineEl);

                this.linesTargets.push(target);
                this.lines.push(lineEl);
            })
        })
    }

    createTimeline() {
        gsap.set(this.wrap, {'--rotation': this.angle})
        this.timeline.clear()
            .to(this.scrollWrap, {y: () => -(this.svgWrap.offsetHeight - window.innerHeight * 0.5), duration: 10, delay: 2, ease: 'none'}, 'start')
            // .fromTo(this.wrap, {'--rotation': 50}, {'--rotation': this.angle, duration: 1, delay: 0.5}, 'start')
            this.segments.forEach((seg, i) => {
                seg.style.strokeDasharray = seg.getTotalLength();
                seg.style.strokeDashoffset = seg.getTotalLength();

                this.timeline.to(seg, { strokeDashoffset: 0, delay: i * 2, duration: 2, ease: 'none' }, 'start')
                .to(this.cardsInner[i], {opacity: 1, delay: 2, duration: 1, ease: 'none'}, '<')
            })
    }

    resetAnimation() {
        gsap.set(this.wrap, { '--rotation': this.angle });
        gsap.set(this.scrollWrap, { y: 0 })
        gsap.set(this.cards, {
            "--left": 0,
            "--top": 0,
        });
        gsap.set(this.lines, {
            "--left": 0,
            "--top": 0,
        });
    }

    init() {
        this.cards = this.wrap.querySelectorAll('.path-animation__card');
        this.cardsInner = this.wrap.querySelectorAll('.path-animation__card-wrap');
        this.anchors = this.svg.querySelectorAll('.path-animation__anchor');
        this.segments = this.svg.querySelectorAll('.path-animation__seg');

        this.createLines();
        this.positionCards();
        this.positionLines();
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
            this.positionLines();
            this.createTimeline();
        })
    }
}