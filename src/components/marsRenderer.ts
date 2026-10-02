/** A single-pass, textured sphere. No mesh or animation framework is required. */
export interface MarsRenderer {
  setRunning(running: boolean): void;
  resize(): void;
  dispose(): void;
}

const vertexSource = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fragmentSource = `
precision highp float;
uniform vec2 uResolution;
uniform sampler2D uSurface;
uniform float uRotation;
const float PI = 3.14159265359;
void main() {
  float diameter = min(uResolution.x, uResolution.y);
  vec2 point = (2.0 * gl_FragCoord.xy - uResolution) / diameter;
  float radiusSquared = dot(point, point);
  if (radiusSquared >= 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Orthographic sphere projection: geography foreshortens naturally at the limb.
  vec3 normal = vec3(point, sqrt(1.0 - radiusSquared));
  float longitude = atan(normal.x, normal.z) / (2.0 * PI);
  float latitude = acos(clamp(normal.y, -1.0, 1.0)) / PI;
  vec2 uv = vec2(fract(longitude + uRotation), latitude);
  vec3 albedo = texture2D(uSurface, uv).rgb;

  // The light remains fixed while only the planet's surface turns about its axis.
  vec3 sunlight = normalize(vec3(-0.28, 0.62, 1.25));
  float incidence = max(dot(normal, sunlight), 0.0);
  float illumination = 0.018 + 0.982 * incidence;
  vec3 linearColor = pow(albedo, vec3(2.2));
  vec3 solarWhiteBalance = vec3(1.18, 1.02, 0.82);
  vec3 color = pow(linearColor * illumination * solarWhiteBalance, vec3(1.0 / 2.2));
  float coverage = 1.0 - smoothstep(1.0 - 2.0 / diameter, 1.0, sqrt(radiusSquared));
  gl_FragColor = vec4(color * coverage, 1.0);
}`;

function loadImage(url: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.fetchPriority = 'low';
    image.decoding = 'async';
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener('abort', abort);
    };
    const abort = () => {
      cleanup();
      image.src = '';
      reject(new DOMException('Texture loading cancelled.', 'AbortError'));
    };
    image.onload = () => {
      cleanup();
      resolve(image);
    };
    image.onerror = () => {
      cleanup();
      reject(new Error('The Mars surface map could not be loaded.'));
    };
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    else image.src = url;
  });
}

export async function createMarsRenderer(
  canvas: HTMLCanvasElement,
  options: { textureUrl: string; signal: AbortSignal; onContextLost: () => void },
): Promise<MarsRenderer> {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
    preserveDrawingBuffer: false,
  });
  if (!gl) throw new Error('WebGL is unavailable.');

  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  let frame = 0;
  let running = false;
  let disposed = false;
  let lastDraw = 0;
  // The initial meridian is adjusted to the source map's longitude convention.
  let rotation = 0.35;

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(frame);
    frame = 0;
    lastDraw = 0;
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    stop();
    options.onContextLost();
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stop();
    canvas.removeEventListener('webglcontextlost', contextLost);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };

  try {
    if (!program || !buffer || !texture) throw new Error('WebGL allocation failed.');
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('WebGL shader allocation failed.');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error('The Mars shader could not be compiled.');
      }
      gl.attachShader(program, shader);
    };
    compile(gl.VERTEX_SHADER, vertexSource);
    compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('The Mars shader could not be linked.');
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const image = await loadImage(options.textureUrl, options.signal);
    if (options.signal.aborted || gl.isContextLost())
      throw new Error('Renderer initialization ended.');
    if (image.width > gl.getParameter(gl.MAX_TEXTURE_SIZE)) {
      throw new Error('The surface map exceeds this device’s texture limit.');
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Shader wrapping also supports maps with non-power-of-two dimensions.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const isPowerOfTwo = (value: number) => (value & (value - 1)) === 0;
    if (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'uSurface'), 0);
    const resolutionUniform = gl.getUniformLocation(program, 'uResolution');
    const rotationUniform = gl.getUniformLocation(program, 'uRotation');

    const draw = () => {
      if (disposed || gl.isContextLost()) return;
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      gl.uniform1f(rotationUniform, rotation);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const resize = () => {
      if (disposed) return;
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(
        window.devicePixelRatio || 1,
        1.5,
        1600 / Math.max(bounds.width, bounds.height, 1),
      );
      const width = Math.max(1, Math.round(bounds.width * scale));
      const height = Math.max(1, Math.round(bounds.height * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      draw();
    };
    const tick = (now: number) => {
      if (!running || disposed) return;
      if (!lastDraw || now - lastDraw >= 1000 / 30) {
        if (lastDraw) rotation = (rotation - (now - lastDraw) / 150_000 + 1) % 1;
        lastDraw = now;
        draw();
      }
      frame = window.requestAnimationFrame(tick);
    };
    const setRunning = (next: boolean) => {
      if (disposed || next === running) return;
      if (!next) stop();
      else {
        running = true;
        lastDraw = 0;
        frame = window.requestAnimationFrame(tick);
      }
    };
    canvas.addEventListener('webglcontextlost', contextLost);
    resize();
    return { setRunning, resize, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
