import { Color, SRGBColorSpace } from 'three';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Mesh,
} from 'three';

export class BlinkingBoxes {
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
    this.isVisible = false;
    this.init();
  }

  init() {
    this.scene = new Scene();
    this.camera = new OrthographicCamera(
      -this.canvasSize.w / 2,
      this.canvasSize.w / 2,
      this.canvasSize.h / 2,
      -this.canvasSize.h / 2,
      0.01,
      10
    );

    this.renderer = new WebGLRenderer({
      alpha: true,
      colorSpace: SRGBColorSpace,
    });
    this.renderer.setSize(this.canvasSize.w, this.canvasSize.h);
    this.container.appendChild(this.renderer.domElement);

    this.createBoxes();
    this.setupIntersectionObserver();
    this.animate();
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
    const geometry = new PlaneGeometry(this.canvasSize.w, this.canvasSize.h);
    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uGap: { value: this.gap },
        uCols: { value: this.cols },
        uColor: { value: new Color("rgb(178, 169, 184)") },
        uCanvasSize: {
          value: new Vector2(this.canvasSize.w, this.canvasSize.h),
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
        uniform vec3 uColor;
        uniform vec2 uCanvasSize;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
      
        void main() {
          float boxSize = (uCanvasSize.x - uGap * (uCols - 1.0)) / uCols;
          vec2 gridSize = vec2((boxSize + uGap) / uCanvasSize.x, (boxSize + uGap) / uCanvasSize.y);
          vec2 cell = floor(vUv / gridSize);
          vec2 cellUv = (vUv - cell * gridSize) / gridSize;
          
          if (cellUv.x > boxSize / (boxSize + uGap) || cellUv.y > boxSize / (boxSize + uGap)) {
            discard;
          }
          
          float randomBase = random(cell);
          float opacity = sin(uTime * 2.0 + randomBase * 10.0) * 0.5 + 0.5;
          
          gl_FragColor = vec4(uColor, opacity);
        }
      `,
      transparent: true,
    });

    const mesh = new Mesh(geometry, material);
    mesh.position.z = -0.01;
    this.scene.add(mesh);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    if (this.isVisible) {
      this.scene.children[0].material.uniforms.uTime.value += 0.03;
      this.renderer.render(this.scene, this.camera);
    }
  };
}