import { createNoise2D } from 'simplex-noise';

export class AnimatedGraph {
  time = 0;
  lastTime = 0;
  deltaTime = 0;
  isVisible = false;

  constructor({wrap, isVertical}) {
    this.wrap = wrap;
    this.isVertical = isVertical;
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
      this.updateAmplitude(this.isVertical ? this.canvas.width * 0.5 : this.canvas.height * 0.5);
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
      amplitude: this.canvas.height * 0.5,
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