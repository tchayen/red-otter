// http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf

const INF = 1e20;

// 1D squared distance transform.
function edt1d(
  grid: Float64Array,
  offset: number,
  stride: number,
  length: number,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array
): void {
  let q: number, k: number, s: number, r: number;

  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;

  for (q = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
  }

  for (q = 1, k = 0, s = 0; q < length; q++) {
    do {
      r = v[k];
      s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);

    k++;

    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  for (q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) {
      k++;
    }

    r = v[k];
    grid[offset + q * stride] = f[r] + (q - r) * (q - r);
  }
}

function edt(
  data: Float64Array,
  width: number,
  height: number,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array
): void {
  for (let x = 0; x < width; x++) {
    edt1d(data, x, width, height, f, v, z);
  }
  for (let y = 0; y < height; y++) {
    edt1d(data, y * width, 1, width, f, v, z);
  }
}

/**
 * Takes ImageData and returns a new ImageData with the SDF applied.
 */
export function toSDF(
  imageData: ImageData,
  width: number,
  height: number,
  radius: number
): ImageData {
  const gridOuter = new Float64Array(width * height);
  const gridInner = new Float64Array(width * height);

  const INF = 1e20;
  for (let i = 0; i < width * height; i++) {
    const a = imageData.data[i * 4 + 3] / 255; // Alpha value.
    gridOuter[i] =
      a === 1 ? 0 : a === 0 ? INF : Math.pow(Math.max(0, 0.5 - a), 2);
    gridInner[i] =
      a === 1 ? INF : a === 0 ? 0 : Math.pow(Math.max(0, a - 0.5), 2);
  }

  const s = Math.max(width, height);
  const f = new Float64Array(s);
  const z = new Float64Array(s + 1);
  const v = new Uint16Array(s * 2);

  edt(gridOuter, width, height, f, v, z);
  edt(gridInner, width, height, f, v, z);

  const alphaChannel = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    const d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
    const buffer = 0.5;
    const value = buffer - d / radius;

    alphaChannel[i] = value * 255;
  }

  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[4 * i + 0] = alphaChannel[i];
    data[4 * i + 1] = alphaChannel[i];
    data[4 * i + 2] = alphaChannel[i];
    data[4 * i + 3] = alphaChannel[i];
  }

  return new ImageData(data, width, height);
}
