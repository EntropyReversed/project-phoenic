import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/+esm';

export class BlinkingBoxes {
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