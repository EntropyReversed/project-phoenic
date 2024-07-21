import { createNoise2D } from "https://unpkg.com/simplex-noise@4.0.2/dist/esm/simplex-noise.js";

export class AnimatedGraph {
  time = 0;
  lastTime = 0;
  deltaTime = 0;
  lineResolution = 3;
  isVisible = false;

  constructor({ wrap, vertical, amplitude, frequency, attenuation, speed, flip }) {
    this.wrap = wrap;
    this.isVertical = vertical;
    this.amplitudeStrength = amplitude;
    this.frequency = frequency;
    this.attenuationPower = attenuation;
    this.speed = speed;
    this.flip = flip;

    this.canvas = document.createElement('canvas');
    this.wrap.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.noise = createNoise2D();

    this.init();
  }

  createGradient(color) {
    const hexColor = this.hexToRgb(color);
    const gradient = this.isVertical
    ? this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    : this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    
    gradient.addColorStop(0, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(0.05, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(0.3, `rgba(${hexColor}, 0.2)`);
    gradient.addColorStop(0.5, `rgba(${hexColor}, 1)`);
    gradient.addColorStop(0.7, `rgba(${hexColor}, 0.2)`);
    gradient.addColorStop(0.95, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(1, `rgba(${hexColor}, 0)`);
    return gradient;
  }

  calcLineOffset(value, params, attenuationBase, fullSize) {
    const { amplitude, frequency, noiseOffset } = params;
    const noiseValue = this.noise(value * frequency + noiseOffset, this.time) - 1;
    const attenuation = Math.sin((value / attenuationBase) * Math.PI) ** this.attenuationPower;
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
          for (let y = 0; y < this.canvas.height; y += this.lineResolution) {
            const x = this.calcLineOffset(y, params, this.canvas.height, this.canvas.width);
            this.ctx.lineTo(x, y);
          }
        } else {
          this.ctx.moveTo(0, this.canvas.height);
          for (let x = 0; x < this.canvas.width; x += this.lineResolution) {
            const y = this.calcLineOffset(x, params, this.canvas.width, this.canvas.height);
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      });
      
      this.time += (this.deltaTime * 0.1 * this.speed);
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
    this.scaleCanvas(this.wrap.offsetWidth, this.wrap.offsetHeight);

    const resizeObserver = new ResizeObserver(() => {
      this.scaleCanvas(this.wrap.offsetWidth, this.wrap.offsetHeight);
      this.updateAmplitude(this.isVertical ? (this.canvas.width * 0.5) * this.amplitudeStrength : (this.canvas.height * 0.5) * this.amplitudeStrength);
    });

    resizeObserver.observe(this.wrap)
  }

  scaleCanvas(width, height) {
    if (typeof window === undefined) return null;
    this.ratio = window.devicePixelRatio || 1;
    this.canvas.width = width * this.ratio;
    this.canvas.height = height * this.ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
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
      amplitude: 1,
      frequency: 0.01 * this.frequency / this.ratio,
      noiseOffset: Math.random() * 1000,
    }));

    const { flip } = this.wrap.dataset;
    if (flip === "true") {
      this.canvas.style.transform = `scale${this.isVertical ? 'X' : 'Y'}(-1)`;
    }
  }

  init() {
    this.setUpSize();
    this.setUpLines();
    this.setupIntersectionObserver();
    this.draw(0);
  }
}