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
		this.titleLast = this.wrap.querySelector('h3');
		this.textWrapNodes = this.wrap.querySelectorAll('.path-animation__text-wrap');
		this.textWrap = this.wrap.querySelectorAll('.path-animation__text-wrap p');
		this.pathMain = this.svg.querySelector('#path-animation__main');

		this.timeline = gsap.timeline({
			defaults: { ease: "none" },
		});

		this.cardStates = [false, false, false, false];

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

				const target = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
				target.setAttribute('cx', pos.x);
				target.setAttribute('cy', pos.y + 3);
				target.setAttribute('r', 1);
				target.setAttribute('fill', 'transparent');

				const lineEl = document.createElement('div');
				lineEl.classList.add('path-animation__line');
				if (isMain) lineEl.classList.add('main');
			
				lineEl.style.setProperty('--size-off', sizeOffset)

				this.svg.appendChild(target);
				this.scrollWrap.appendChild(lineEl);

				this.linesTargets.push(target);
				this.lines.push(lineEl);
			})
		})
	}

	checkDirection() {
    const time = this.timeline.time();
    const thresholds = this.isMobile ? [3, 5, 7, 9] : [3.96, 5.9, 8.12, 10.05];


		if (time === 0) return;
		thresholds.forEach((threshold, index) => {
			const shouldShow = time >= threshold;
			if (this.cardStates[index] !== shouldShow) {
				this.cards[index].classList.toggle('active', shouldShow)
				this.cardStates[index] = shouldShow;
			}
		});
	}

	createTimeline() {
		this.pathMain.style.strokeDasharray = this.pathMain.getTotalLength();
		this.pathMain.style.strokeDashoffset = this.pathMain.getTotalLength();
		
		this.timeline.clear()
		if(!this.isMobile) {
			this.timeline
				.to(this.scrollWrap, { y: () => -(this.svgWrap.offsetHeight - window.innerHeight * 0.5), duration: 10, delay: 3 }, 'start')
				.to(this.title, { autoAlpha: 0, duration: 2, delay: 2 }, 'start')
			}

		this.timeline
			.to(this.wrap, { '--rotation': this.angle, duration: 3 }, 'start')
			.to(this.lines, { opacity: 0.7, duration: 3, delay: 1 }, 'start')
			.to(this.titleLast, { opacity: 1, duration: 1 }, '-=1.5')
			.to(this.pathMain, {
				strokeDashoffset: 0, 
				duration: 10,
				onUpdate: () => this.checkDirection(),
			}, `start+=${this.isMobile ? 1 : 2}`)

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
			// "--progressC": 0,
		});
		// gsap.set(this.textWrapNodes, {
			// "--progress": 0,
			// opacity: 0,
		// });
		// gsap.set(this.textWrap, {
		// 	opacity: 0,
		// });
		gsap.set(this.lines, {
			"--left": 0,
			"--top": 0,
			opacity: 0
		});
	}

	init() {
		this.cards = this.wrap.querySelectorAll('.path-animation__card');
		this.cardsInner = this.wrap.querySelectorAll('.path-animation__card-wrap');
		this.anchors = this.svg.querySelectorAll('.path-animation__anchor');
		this.segments = this.svg.querySelectorAll('.path-animation__seg');

		if (this.isMobile) {
			this.angle = 0;
		} else {
			this.angle = this.startAngle;
		}

		this.createLines();
		this.positionCards();
		this.positionLines();
		this.createTimeline();

		this.scrollTrigger = ScrollTrigger.create({
			trigger: this.wrap,
			start: 'top center',
			end: 'bottom bottom',
			scrub: 0.5,
			animation: this.timeline,
			invalidateOnRefresh: true,
		})

		gsap.to(this.wrap, { opacity: 1 })

		const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
				this.resetAnimation();
				this.positionCards();
				this.positionLines();
				this.createTimeline();
	
				this.cardStates = [false, false, false, false];
				window.requestAnimationFrame(() => {
					this.checkDirection();
				})
			})
    });

    resizeObserver.observe(this.wrap);
	}
}