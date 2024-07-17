import './style.css';

import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Mesh,
} from 'three';

class BlinkingBoxes {
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
    });
    this.renderer.setSize(this.canvasSize.w, this.canvasSize.h);
    this.container.appendChild(this.renderer.domElement);

    this.createBoxes();
    this.animate();
  }

  createBoxes() {
    const geometry = new PlaneGeometry(this.canvasSize.w, this.canvasSize.h);
    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        gap: { value: this.gap },
        rows: { value: this.rows },
        cols: { value: this.cols },
        canvasSize: {
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
        uniform float gap;
        uniform float rows;
        uniform float cols;
        uniform vec2 canvasSize;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
      
        void main() {
          float boxSize = (canvasSize.x - gap * (cols - 1.0)) / cols;
          vec2 gridSize = vec2((boxSize + gap) / canvasSize.x, (boxSize + gap) / canvasSize.y);
          vec2 cell = floor(vUv / gridSize);
          vec2 cellUv = (vUv - cell * gridSize) / gridSize;
          
          if (cellUv.x > boxSize / (boxSize + gap) || cellUv.y > boxSize / (boxSize + gap)) {
            discard;
          }
          
          float randomBase = random(cell);
          float opacity = sin(uTime * 2.0 + randomBase * 10.0) * 0.5 + 0.5;
          
          gl_FragColor = vec4(vec3(1.0), opacity);
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
    this.scene.children[0].material.uniforms.uTime.value += 0.03;
    this.renderer.render(this.scene, this.camera);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const allBoxes = document.querySelectorAll('.blinking-boxes');

  if (allBoxes.length) {
    allBoxes.forEach((box) => {
      new BlinkingBoxes({
        container: box,
        boxSize: 4,
        gap: 2,
        rows: 24,
        cols: 8,
      });
    });
  }
});
