import gsap from 'gsap';

const omitIndexes = {
  "2x10": [0, 3, 5, 6, 9, 10, 12, 18]
}

export class BlinkingDots {
  constructor({ wrap }) {
    this.wrap = wrap;
    this.dots = this.wrap.querySelectorAll('circle');
    this.timeline = gsap.timeline();
    this.init();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateIn(true)
          observer.disconnect(); 
        }
      });
    }, options);

    observer.observe(this.wrap);
  }

  animateIn(once = false) {
    this.timeline.clear();
    this.timeline.to(this.dots, {
      keyframes: {
        opacity: [1, 0.2, 0.8, 0.1, 1, 0.5, 1, 0.3, 1],
      },
      duration: 1,
      yoyo: !once,
      repeat: once ? 0 : -1,
      stagger: {
        each: Math.random(),
        amount: 1,
      },
    });
  };

  animateOut() {
    this.timeline.clear();
    this.timeline.to(this.dots, {
      opacity: 1,
      duration: 1,
      overwrite: true,
    });
  };

  createSVG(cols, rows) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const radius = 12.5;
    const gap = 10;
    const width = (cols - 1) * gap + 2 * radius;
    const height = (rows - 1) * gap + 2 * radius;

    svg.setAttribute("class", "blinking-dots");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("fill", "none");
    svg.setAttribute("xmlns", svgNS);

    const key = `${cols}x${rows}`;
    const omitSet = new Set(omitIndexes[key] || []);

    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!omitSet.has(index) && (omitSet.size > 0 || Math.random() > 0.2)) {
          const circle = document.createElementNS(svgNS, "circle");
          const cx = radius + col * gap;
          const cy = radius + row * gap;

          circle.setAttribute("cx", cx);
          circle.setAttribute("cy", cy);
          circle.setAttribute("r", radius);
          circle.setAttribute("fill", "#93957B");

          svg.appendChild(circle);
        }
        index++;
      }
    }

    return svg;
  }

  init() {
    this.setupIntersectionObserver();
    this.wrap.appendChild(this.createSVG(2,10))

    this.wrap.addEventListener('mouseenter', () => {
      this.animateIn()
    })

    this.wrap.addEventListener('mouseleave', () => {
      this.animateOut()
    })
  }
}

