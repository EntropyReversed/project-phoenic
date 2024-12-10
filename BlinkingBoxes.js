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

    this.color = [178, 169, 184];
    this.formattedColor = this.color.map(c => c/255);
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

  createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program error:', gl.getProgramInfoLog(program));
    }

    return program;
  }

  createBoxes(gl) {
    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vertexShaderSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
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
    `;

    this.program = this.createProgram(gl, vertexShaderSource, fragmentShaderSource);

    this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
    this.uTime = gl.getUniformLocation(this.program, 'uTime');
    this.uGap = gl.getUniformLocation(this.program, 'uGap');
    this.uCols = gl.getUniformLocation(this.program, 'uCols');
    this.uSeed = gl.getUniformLocation(this.program, 'uSeed');
    this.uColor = gl.getUniformLocation(this.program, 'uColor');
    this.uCanvasSize = gl.getUniformLocation(this.program, 'uCanvasSize');

    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPosition);

    gl.uniform1f(this.uGap, this.gap);
    gl.uniform1f(this.uCols, this.cols);
    gl.uniform1f(this.uSeed, this.seed);
    gl.uniform3f(this.uColor, this.formattedColor[0], this.formattedColor[1], this.formattedColor[2]);
    gl.uniform2f(this.uCanvasSize, this.canvasSize.w, this.canvasSize.h);
  }

  animate = () => {
    if (this.isVisible) {
      const gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      const elapsedTime = (Date.now() - this.startTime) / 1000;
      gl.uniform1f(this.uTime, elapsedTime);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(this.animate);
  };

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasSize.w;
    this.canvas.height = this.canvasSize.h;
    this.container.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl');
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.viewport(0, 0, this.canvasSize.w, this.canvasSize.h);

    this.createBoxes(this.gl);
    this.setupIntersectionObserver();
    this.animate();
  }
}
