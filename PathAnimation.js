export class PathAnimation {
	startAngle = 70;
	angle = this.startAngle;
	mobileBreak = 991;

	constructor({ wrap }) {
		this.wrap = wrap;
		this.initializeElements();
		this.timeline = gsap.timeline({ defaults: { ease: "none" } });
		this.timelineCTA = gsap.timeline();
		this.cardStates = Array(this.cards.length).fill(false);;
		this.isMobile = this.getIsMobile();

		this.init();
	}

	initializeElements() {
		this.svgWrap = this.wrap.querySelector('.path-animation__svg-wrap');
		this.scrollWrap = this.wrap.querySelector('.path-animation__scroll');
		this.svg = this.wrap.querySelector('.path-animation__svg-main');

		this.cards = this.wrap.querySelectorAll('.path-animation__card');
		this.cardsInner = this.wrap.querySelectorAll('.path-animation__card-wrap');
		this.anchors = this.svg.querySelectorAll('.path-animation__anchor');
		this.segments = this.svg.querySelectorAll('.path-animation__seg');

		this.cta = document.querySelector('.path-animation__cta');
		this.ctaTitle = this.cta.querySelector('.path-animation__cta-title');
		this.ctaTitleSpan = this.cta.querySelector('.path-animation__cta-title-m');
		this.ctaTitleSpanRest = this.cta.querySelectorAll('.path-animation__cta-title-rest');
		this.ctaBtn = this.cta.querySelector('.path-animation__cta-btn');

		this.ctaTitleSpanInner = this.cta.querySelector('.path-animation__cta-title-inner');
		this.ctaTitleSpanInnerProcess = this.cta.querySelector('.path-animation__cta-title-inner > span');

		this.ctaTitleGhost = this.cta.querySelector('.path-animation__cta-ghost');
		this.textWrapNodes = this.wrap.querySelectorAll('.path-animation__text-wrap');
		this.textWrap = this.wrap.querySelectorAll('.path-animation__text-wrap p');
		this.pathMain = this.svg.querySelector('#path-animation__main');
  }

	getIsMobile() {
    return window.innerWidth < this.mobileBreak;
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
			"--left": Math.round(x),
			"--top": Math.round(y),
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
				"--left": Math.round(x),
				"--top": Math.round(y),
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

	checkDirection(time) {
		const thresholds = [19.7, 39, 61.3, 80.6];
		if (time === 0) return;
		thresholds.forEach((threshold, index) => {
			const shouldShow = time >= threshold;
			if (this.cardStates[index] !== shouldShow) {
				this.cards[index].classList.toggle('active', shouldShow)
				this.cardStates[index] = shouldShow;
			}
		});
	}

	createTimelines() {
		this.pathMain.style.strokeDasharray = this.pathLength;
		this.pathMain.style.strokeDashoffset = this.pathLength;

		this.timeline.clear();
		this.timelineCTA.clear();

		this.timeline
			.to(this.scrollWrap, { 
				y: () => this.isMobile ? 0 : -(this.svgWrap.offsetHeight - window.innerHeight * 0.5), 
				duration: 10, 
				delay: 3 
			}, 'start')
			.to(this.wrap, { '--rotation': () => this.angle, opacity: 1, duration: 3 }, 'start')
			.to(this.lines, { opacity: 0.7, duration: 3, delay: 1 }, 'start')
			.to(this.pathMain, {
				strokeDashoffset: 0, 
				duration: 10,
			}, 'start+=2')

		this.timelineCTA
			.to({}, { duration: 0.2 })
			.to(this.ctaTitleSpanRest, { autoAlpha: 0, duration: 2 })
			.to(this.ctaTitleSpanInner, {
				x: () => (this.ctaTitleSpan.getBoundingClientRect().x - this.ctaTitleGhost.getBoundingClientRect().x) * -1,
				duration: 2
			}, '<+=1.6')
			.to(this.ctaTitleSpanInnerProcess, {
				x: 0,
				duration: 2
			}, '<')
			.to(this.ctaTitleSpanInnerProcess, {
				autoAlpha: 1,
				delay: 0.6,
				duration: 2
			}, '<')
			.to(this.ctaBtn, {
				autoAlpha: 1,
				duration: 1
			}, '<+=0.3')
			.to(this.cta, { 
				autoAlpha: 0, 
				duration: 1, 
				delay: 0.5
			})
	}

	resetAnimation() {
		this.angle = this.isMobile ? 0 : this.startAngle;

		gsap.set(this.wrap, { opacity: 0 })
		gsap.set(this.wrap, { '--rotation': 0 });
		gsap.set(this.scrollWrap, { y: 0 })
		gsap.set(this.cards, {
			"--left": 0,
			"--top": 0,
		});
		gsap.set(this.lines, {
			"--left": 0,
			"--top": 0,
			opacity: 0
		});
		// gsap.to(this.wrap, { opacity: 1, delay: 0.6 })
	}

	observers() {
		new MutationObserver(() => {
			this.checkDirection(100 - (parseFloat(getComputedStyle(this.pathMain).strokeDashoffset) / this.pathLength) * 100)
		}).observe(this.pathMain, { attributes: true, childList: false, subtree: false });

		new ResizeObserver(() => {
      requestAnimationFrame(() => {
				this.isMobile = this.getIsMobile();
				this.resetAnimation();
				this.positionCards();
				this.positionLines();

				this.cards.forEach((card) => card.classList.remove('active'));
				this.cardStates = Array(this.cards.length).fill(false);
			})
    }).observe(this.wrap);
	}

	init() {
		this.angle = this.isMobile ? 0 : this.startAngle;
		this.pathLength = this.pathMain.getTotalLength()

		this.createLines();
		this.createTimelines();

		this.scrollTriggerCTA = ScrollTrigger.create({
			trigger: this.cta,
			start: 'top top',
			end: 'center top',
			scrub: 0.5,
			animation: this.timelineCTA,
			invalidateOnRefresh: true,
		})

		this.scrollTrigger = ScrollTrigger.create({
			trigger: this.wrap,
			start: 'top top',
			end: 'bottom bottom',
			scrub: 0.5,
			animation: this.timeline,
			invalidateOnRefresh: true,
		})

		this.observers();
	}
}