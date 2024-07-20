import { createNoise2D } from "https://unpkg.com/simplex-noise@4.0.2/dist/esm/simplex-noise.js";
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/+esm';
gsap.registerPlugin(MotionPathPlugin);

class AnimatedGraph {
  time = 0;
  lastTime = 0;
  deltaTime = 0;
  isVisible = false;

  constructor({wrap, isVertical, amplitude}) {
    this.wrap = wrap;
    this.isVertical = isVertical;
    this.amplitudeStrength = amplitude;
    this.canvas = document.createElement('canvas');
    this.wrap.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.noise = createNoise2D();
    this.init()
  }

  createGradient(color) {
    const hexColor = this.hexToRgb(color);
    const gradient = this.isVertical
    ? this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    : this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop(0, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(0.1, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(0.3, `rgba(${hexColor}, 0.2)`);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(0.7, `rgba(${hexColor}, 0.2)`);
    gradient.addColorStop(0.9, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(1, `rgba(${hexColor}, 0)`);

    // gradient.addColorStop(0, color);
    // gradient.addColorStop(1, color);
    return gradient;
  }

  calcLineOffset(value, params, attenuationBase, fullSize) {
    const { amplitude, frequency, noiseOffset } = params;
    const noiseValue = this.noise(value * frequency + noiseOffset, this.time) - 1;
    const attenuation = Math.sin((value / attenuationBase) * Math.PI) ** 3;
    return fullSize + noiseValue * amplitude * attenuation;
  }

  draw(currentTime) {
    if (this.isVisible) {
      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      this.linesParams.forEach(params => {const gradient = this.createGradient(params.color);
  
        this.ctx.beginPath();
  
        if (this.isVertical) {
          this.ctx.moveTo(this.canvas.width, 0);
          for (let y = 0; y < this.canvas.height; y += 4) {
            const x = this.calcLineOffset(y, params, this.canvas.height, this.canvas.width);
            this.ctx.lineTo(x, y);
          }
        } else {
          this.ctx.moveTo(0, this.canvas.height);
          for (let x = 0; x < this.canvas.width; x += 4) {
            const y = this.calcLineOffset(x, params, this.canvas.width, this.canvas.height);
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      });
      
      this.time += (this.deltaTime * 0.1);
    }

    requestAnimationFrame(this.draw.bind(this));
  }

  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  setUpSize() {
    this.canvas.width = this.wrap.offsetWidth;
    this.canvas.height = this.wrap.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
      this.canvas.width = this.wrap.offsetWidth;
      this.canvas.height = this.wrap.offsetHeight;
      this.updateAmplitude(this.isVertical ? (this.canvas.width * 0.5) * this.amplitudeStrength : (this.canvas.height * 0.5) * this.amplitudeStrength);
    });

    resizeObserver.observe(this.wrap)
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, options);

    observer.observe(this.wrap);
  }

  updateAmplitude(amp) {
    this.linesParams.forEach(param => param.amplitude = amp);
  }

  setUpLines() {
    this.linesParams = ['#D86EFE', '#D86EFE', '#FCDC34', '#FCDC34', '#39EED8', '#39EED8'].map(color => ({
      color,
      amplitude: (this.canvas.height * 0.5) * this.amplitudeStrength,
      frequency: 0.01,
      noiseOffset: Math.random() * 1000,
    }));
  }

  init() {
    this.setUpSize();
    this.setupIntersectionObserver();
    this.setUpLines();
    this.draw(0);
  }
}

class BlinkingBoxes {
  seed = Math.random();
  startTime = Date.now();
  isVisible = false;

  constructor({ container, boxSize, gap, rows, cols }) {
    this.container = container;
    this.boxSize = boxSize;
    this.gap = gap;
    this.rows = rows;
    this.cols = cols;
    this.canvasSize = {
      w: this.cols * (this.boxSize + this.gap) - this.gap,
      h: this.rows * (this.boxSize + this.gap) - this.gap,
    };
    this.init();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, options);

    observer.observe(this.container);
  }

  createBoxes() {
    const geometry = new THREE.PlaneGeometry(this.canvasSize.w, this.canvasSize.h);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uGap: { value: this.gap },
        uCols: { value: this.cols },
        uColor: { value: new THREE.Color("rgb(178, 169, 184)") },
        uSeed: { value: this.seed },
        uCanvasSize: {
          value: new THREE.Vector2(this.canvasSize.w, this.canvasSize.h),
        },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uGap;
        uniform float uCols;
        uniform float uSeed;
        uniform vec3 uColor;
        uniform vec2 uCanvasSize;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy + uSeed, vec2(12.9898, 78.233))) * 43758.5453123);
        }
      
        void main() {
          float boxSize = (uCanvasSize.x - uGap * (uCols - 1.0)) / uCols;
          vec2 gridSize = vec2((boxSize + uGap) / uCanvasSize.x, (boxSize + uGap) / uCanvasSize.y);
          vec2 cell = floor(vUv / gridSize);
          vec2 cellUv = (vUv - cell * gridSize) / gridSize;
          
          if (cellUv.x > boxSize / (boxSize + uGap) || cellUv.y > boxSize / (boxSize + uGap)) {
            discard;
          }
          
          float opacity = sin(uTime * 2.0 + random(cell) * 10.0) * 0.5 + 0.5;
          
          gl_FragColor = vec4(uColor, opacity);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -0.01;
    this.scene.add(mesh);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    if (this.isVisible) {
      const elapsedTime = (Date.now() - this.startTime) / 1000;
      this.scene.children[0].material.uniforms.uTime.value = elapsedTime;
      this.renderer.render(this.scene, this.camera);
    }
  };

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      -this.canvasSize.w / 2,
      this.canvasSize.w / 2,
      this.canvasSize.h / 2,
      -this.canvasSize.h / 2,
      0.01,
      10
    );

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      colorSpace: THREE.SRGBColorSpace,
    });
    this.renderer.setSize(this.canvasSize.w, this.canvasSize.h);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.createBoxes();
    this.setupIntersectionObserver();
    this.animate();
  }
}

class BlinkingDots {
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
      ease: 'none',
      stagger: {
        from: "random",
        ease: "none",
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


class TrajectoryMap {
  constructor({ wrap }) {
    this.wrap = wrap;
    this.svg = this.wrap.querySelector('svg');
    this.ship = this.svg.querySelector('.ship');
    this.grip = this.svg.querySelector('.grid');
    this.dots = this.svg.querySelectorAll('.dots circle');
    this.circles = this.svg.querySelectorAll('.circles > g');
    this.pathMain = this.svg.querySelector('.path-main');
    this.pathBranch = this.svg.querySelector('.path-branch');
    this.pathShip = this.svg.querySelector('.path-ship');
    this.barGraph = this.svg.querySelector('.bar-graph');
    this.barGraphTop = this.svg.querySelector('.bar-graph-top');

    this.timeline = gsap.timeline({paused: true});
    this.init();
  }

  trackSvgHeight() {
    this.wrap.style.height = `${this.svg.getBoundingClientRect().height}px`;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        entry.target.style.height = `${this.svg.getBoundingClientRect().height}px`;
      }
    });

    resizeObserver.observe(this.svg)
  }

  createTimeline() {
    this.timeline
      .addLabel('shipStart', 'start+=0.9')
      .set(this.circles, { '--offset': 0 })
      .to(this.dots,
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          stagger: {
            amount: 1,
          }
        }, 'start'
      )
      .to(this.circles,
        {
          '--offset': 1,
          z: 0,
          ease: "power2.out",
          stagger: 0.1,
          duration: 1
        }, 'start'
      )
      .to(this.pathMain, {
        strokeDashoffset: 0,
        duration: 1,
      }, 'start')
      .to(this.pathBranch, {
        strokeDashoffset: 0,
        duration: 1,
      }, 'start+=0.6')
      .to(this.barGraph, {
        opacity: 1,
        duration: 1,
      }, 'start+=1.6')
      .to(this.barGraphTop, {
        y: 3,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: "circ.in"
      }, 'start+=2')
      .to(this.pathShip, {
        keyframes: {
          strokeDashoffset: [gsap.getProperty(this.pathShip, "strokeDashoffset"),0,0],
          opacity: [1,1,1,0,0],
          easeEach: 'none'
        },
        repeat: -1,
        duration: 6,
        ease: 'none',
      }, 'shipStart')
      .to(this.ship, {
        duration: 6, 
        repeat: -1,
        keyframes: {
          scale: [0,1,1,1,0,0,0,0],
          easeEach: 'none'
        },
        ease: 'none',
      }, 'shipStart')
      .to(this.ship, {
        duration: 3, 
        repeat: -1,
        motionPath:{
          path: this.pathShip,
          align: this.pathShip,
          autoRotate: 10,
          alignOrigin: [1, 0.3],
        },
        repeatDelay: 3,
        ease: 'none',
      }, 'shipStart');

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
          this.timeline.play();
          observer.disconnect(); 
        }
      });
    }, options);

    observer.observe(this.wrap);
  }

  init() {
    this.trackSvgHeight();
    this.createTimeline();
    this.setupIntersectionObserver();

    // this.wrap.addEventListener('mouseenter', () => {
    //   this.timeline.play()
    // })

    // this.wrap.addEventListener('mouseleave', () => {
    //   this.timeline.reverse()
    // })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const allBoxes = document.querySelectorAll('.blinking-boxes');
  const allDots = document.querySelectorAll('.blinking-dots');
  const allAnimatedGraphs = document.querySelectorAll('.animated-graph');
  const trajectoryMap = document.querySelector('.trajectory-map');

  if (allBoxes.length) {
    allBoxes.forEach((box) => {
      const { size, gap, rows, cols } = box.dataset;

      new BlinkingBoxes({
        container: box,
        boxSize: Number(size ?? 4),
        gap: Number(gap ?? 2),
        rows: Number(rows ?? 24),
        cols: Number(cols ?? 8),
      });
    });
  }

  if (allDots.length) {
    allDots.forEach((dot) => {
      const { size, gap, rows, cols } = dot.dataset;

      new BlinkingDots({
        wrap: dot,
        cols: Number(cols ?? 2),
        rows: Number(rows ?? 10),
        size: Number(size ?? 2.5),
        gap: Number(gap ?? 5),
      });
    });
  }

  if (trajectoryMap) {
    new TrajectoryMap({
      wrap: trajectoryMap,
    });
  }

  if (allAnimatedGraphs.length) {
    allAnimatedGraphs.forEach(wrap => {
      const { isVertical, amplitude } = wrap.dataset;

      new AnimatedGraph({
        wrap,
        isVertical: Boolean(isVertical),
        amplitude: Number(amplitude ?? 1),
      })
    });
  }

});
