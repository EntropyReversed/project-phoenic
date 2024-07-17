import gsap from 'gsap';


export class BlinkingDots {
  svgNS = "http://www.w3.org/2000/svg";
  timeline = gsap.timeline();
  omitIndexes = {
    "2x10": [0, 3, 5, 6, 9, 10, 12, 18],
  };
  probability = 0.4;

  constructor({ wrap, cols, rows, size, gap }) {
    this.wrap = wrap;
    this.cols = cols;
    this.rows = rows;
    this.size = size;
    this.gap = gap;
    this.init();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1,
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
        from: "random",
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

  createSVG() {
    this.svg = document.createElementNS(this.svgNS, "svg");
    const diameter = 2 * this.size;
    const spacing = diameter + this.gap;
    const width = this.cols * (this.gap + diameter) - this.gap;
    const height = this.rows * (this.gap + diameter) - this.gap;
  
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.setAttribute("fill", "none");
    this.svg.setAttribute("xmlns", this.svgNS);
  
    const key = `${this.cols}x${this.rows}`;
    const omitSet = new Set(this.omitIndexes[key] || []);
  
    let index = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!omitSet.has(index) && (omitSet.size > 0 || Math.random() > this.probability)) {
          const circle = document.createElementNS(this.svgNS, "circle");
          const cx = this.size + col * spacing;
          const cy = this.size + row * spacing;
  
          circle.setAttribute("cx", cx);
          circle.setAttribute("cy", cy);
          circle.setAttribute("r", this.size);
          circle.setAttribute("fill", "#93957B");
  
          this.svg.appendChild(circle);
        }
        index++;
      }
    }
  
    return this.svg;
  }

  init() {
    this.setupIntersectionObserver();
    this.wrap.appendChild(this.createSVG())
    this.dots = this.wrap.querySelectorAll('circle');

    this.wrap.addEventListener('mouseenter', () => {
      this.animateIn()
    })

    this.wrap.addEventListener('mouseleave', () => {
      this.animateOut()
    })
  }
}

