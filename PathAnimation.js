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
	startAngle = 70;
	angle = this.startAngle;
	mobileBreak = 991;

	constructor({ wrap }) {
		this.wrap = wrap;
		this.svgWrap = this.wrap.querySelector('.path-animation__svg-wrap');
		this.scrollWrap = this.wrap.querySelector('.path-animation__scroll');
		this.svg = this.wrap.querySelector('svg');
		this.title = this.wrap.querySelector('h2');
		this.ship = this.svg.querySelector('.path-animation__ship');
		this.timeline = gsap.timeline();

		this.isMobile = window.innerWidth < this.mobileBreak;

		this.init();
	}

	getPosition(item, target, point = { x: 0, y: 0 }) {
		return MotionPathPlugin.convertCoordinates(
			target,
			item,
			point
		);
	}

	positionCard(card, anchor) {
		const { x, y } = this.getPosition(card, anchor);

		gsap.set(card, {
			"--left": x,
			"--top": y,
		})
	}

	positionCards() {
		this.cards.forEach(card => {
			card.classList.remove('isLeft');
		});

		this.cards.forEach((card, i) => {
			this.positionCard(card, this.anchors[i]);

			if (i % 2 === 0) {
				card.classList.add('isLeft');
			}
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
			Array.from({ length: this.linesPerSeg }).forEach((_, line) => {
				const len = seg.getTotalLength() / this.linesPerSeg;
				const isMain = i !== 0 && len * line < len;
				const offset = isMain ? 0 : (Math.random() - 1) * len * 0.1;
				const sizeOffset = Math.random() * (1 - 0.5) + 0.5;
				const pos = seg.getPointAtLength((len + offset) * line);

				if (isMain || (i === 0 && line === 0)) return;

				const target = createSVGElement('circle', {
					cx: pos.x,
					cy: pos.y + 3,
					r: 1,
					fill: "transparent",
				});

				const lineEl = createHTMLElement('div', {
					className: `path-animation__line ${isMain ? 'main' : ''}`,
				});

				lineEl.style.setProperty('--size-off', sizeOffset)

				this.svg.appendChild(target);
				this.scrollWrap.appendChild(lineEl);

				this.linesTargets.push(target);
				this.lines.push(lineEl);
			})
		})
	}

	createTimeline() {
		gsap.set(this.wrap, { '--rotation': 0 })
		this.timeline.clear()
		if(!this.isMobile) {
			this.timeline
				.to(this.scrollWrap, { y: () => -(this.svgWrap.offsetHeight - window.innerHeight * 0.5), duration: 10, delay: 1.5, ease: 'none' }, 'start')
				.to(this.title, { autoAlpha: 0,  duration: 2, delay: 2 }, 'start')
		}

		this.timeline
			.to(this.wrap, { '--rotation': this.angle, duration: 4 }, 'start')
			.to(this.lines, { opacity: 0.7, duration: 4, delay: 2 }, 'start')

		this.segments.forEach((seg, i) => {
			seg.style.strokeDasharray = seg.getTotalLength();
			seg.style.strokeDashoffset = seg.getTotalLength();

			this.timeline.to(seg, { strokeDashoffset: 0, delay: i * 2, duration: 2, ease: 'none' }, 'start')

			if (this.cards[i]) {
				this.timeline.to(this.cards[i], { '--progress': 1, delay: 2, duration: 1, ease: 'none' }, '<')
			}
		})
	}

	resetAnimation() {
		this.isMobile = window.innerWidth < this.mobileBreak;

		if (this.isMobile) {
			this.angle = 0;
		} else {
			this.angle = this.startAngle;
		}

		gsap.set(this.wrap, { '--rotation': 0 });
		gsap.set(this.scrollWrap, { y: 0 })
		gsap.set(this.title, {
			autoAlpha: 1
		})
		gsap.set(this.cards, {
			"--left": 0,
			"--top": 0,
			"--progress": 0,
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
			start: 'top top',
			end: 'bottom bottom',
			// markers: true,
			scrub: 0.75,
			animation: this.timeline,
			invalidateOnRefresh: true,
		})

		gsap.to(this.wrap, { opacity: 1 })

		window.addEventListener('resize', () => {
			this.resetAnimation();
			this.positionCards();
			this.positionLines();
			this.createTimeline();
		})
	}
}