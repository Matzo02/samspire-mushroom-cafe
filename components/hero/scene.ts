// The scroll-driven hero: a mushroom pushes out of a moonlit forest floor, its
// cap unfurls and it releases a cloud of glowing spores. Everything, textures
// included, is generated in code.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export type HeroSceneOptions = {
  canvas: HTMLCanvasElement;
  hero: HTMLElement; // the tall section that drives progress
  stage: HTMLElement; // the sticky viewport inside it
  art: HTMLElement; // the box the mushroom is framed in
  note: HTMLElement | null; // caption that narrates the growth
  onReady: () => void;
};

const PAGE_BG = 0x070d22; // must match --bg so the canvas melts into the page
const STEM = 0xdfe7fa;
const WART = 0xe9f0ff;
const GLOW = 0x7fd4ff;

const NOTES: [number, string][] = [
  [0, "A pin breaks through the soil."],
  [0.2, "The stem stretches for the dark."],
  [0.42, "The cap begins to unfurl."],
  [0.66, "Spores in the night air. Ready to pick."],
];

// ---------- timeline helpers ----------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a)); // 0..1 within [a, b]
const ease = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const smooth = (a: number, b: number, x: number) => ease(range(x, a, b));
const lerp = THREE.MathUtils.lerp;
const rand = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- noise ----------
// Value noise that tiles with period (px, py), so textures wrap round a lathe without a seam.
function makeNoise(seed: number) {
  const wrap = (a: number, p: number) => ((a % p) + p) % p;
  const h = (x: number, y: number) => rand(x * 57.31 + y * 311.7 + seed * 1013.9);
  return (x: number, y: number, px = 1e5, py = 1e5) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const u = ease(x - xi), v = ease(y - yi);
    const x0 = wrap(xi, px), x1 = wrap(xi + 1, px), y0 = wrap(yi, py), y1 = wrap(yi + 1, py);
    return lerp(lerp(h(x0, y0), h(x1, y0), u), lerp(h(x0, y1), h(x1, y1), u), v);
  };
}
type Noise = ReturnType<typeof makeNoise>;
function fbm(n: Noise, x: number, y: number, px = 1e5, py = 1e5, oct = 4) {
  let s = 0, a = 0.5, f = 1, norm = 0;
  for (let o = 0; o < oct; o++) {
    s += a * n(x * f, y * f, px * f, py * f);
    norm += a;
    a *= 0.5;
    f *= 2;
  }
  return s / norm;
}
const N = [1, 2, 3, 4, 5, 6, 7, 8].map(makeNoise);

// ground height: flat where the mushrooms stand, gentle mounds further out
const groundY = (x: number, z: number) =>
  (fbm(N[5], x * 0.55 + 40, z * 0.55 + 40, 1e5, 1e5, 3) - 0.45) * 0.7 * smooth(1.6, 4, Math.hypot(x, z));

// ---------- the scene ----------
export function createHeroScene({ canvas, hero, stage, art, note, onReady }: HeroSceneOptions) {
  const small = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const forcedParam = new URLSearchParams(location.search).get("p"); // ?p=0.6 freezes progress for screenshots
  const forced = forcedParam === null ? null : clamp(Number(forcedParam) || 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  const dpr = Math.min(devicePixelRatio, small ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const textures: THREE.Texture[] = [];
  function paint(w: number, h: number, fn: (u: number, v: number, out: number[]) => void, opts: { srgb?: boolean; repeat?: number } = {}) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    const img = g.createImageData(w, h);
    const out = [0, 0, 0, 255];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        out[3] = 255;
        fn((x + 0.5) / w, 1 - (y + 0.5) / h, out); // u, v in texture space (v = 0 at the bottom)
        const i = (y * w + x) * 4;
        img.data[i] = out[0];
        img.data[i + 1] = out[1];
        img.data[i + 2] = out[2];
        img.data[i + 3] = out[3];
      }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
    if (opts.repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(opts.repeat, opts.repeat);
    } else t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(t);
    return t;
  }
  const grey = (out: number[], v: number) => {
    out[0] = out[1] = out[2] = clamp(v) * 255;
  };
  function radial(stops: [number, string][]) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    textures.push(t);
    return t;
  }

  // ---------- procedural surfaces ----------
  // Lathe UVs: u runs round the circumference, v from the crown (0) to the rim (1).
  const capMott = (u: number, v: number) => fbm(N[0], u * 6, v * 4, 6, 1e5, 4);
  const capStreak = (u: number, v: number) => fbm(N[1], u * 110, v * 1.5, 110, 1e5, 2);
  const tex = {
    capColor: paint(512, 256, (u, v, out) => {
      const base = lerp(0.5, 1, smooth(0, 0.85, v));
      const val = base * (0.74 + 0.4 * capMott(u, v)) * (0.9 + 0.14 * capStreak(u, v));
      out[0] = clamp(val * 0.94) * 255;
      out[1] = clamp(val * 0.97) * 255;
      out[2] = clamp(val) * 255;
    }),
    capBump: paint(512, 256, (u, v, out) => grey(out, 0.55 * fbm(N[2], u * 28, v * 9, 28, 1e5, 3) + 0.45 * capStreak(u, v)), { srgb: false }),
    // light shining through the thin rim
    capGlow: paint(256, 128, (u, v, out) => grey(out, smooth(0.72, 1, v) * (0.5 + 0.5 * capMott(u, v))), { srgb: false }),
    stemColor: paint(128, 256, (u, v, out) => {
      const fibre = fbm(N[3], u * 34, v * 2.5, 34, 1e5, 3);
      const scales = fbm(N[4], u * 10, v * 18, 10, 1e5, 2); // the snakeskin pattern of an amanita stem
      const val = 0.82 + 0.18 * fibre - 0.05 * smooth(0.56, 0.68, scales) * v;
      out[0] = clamp(val * 0.97) * 255;
      out[1] = clamp(val * 0.99) * 255;
      out[2] = clamp(val) * 255;
    }),
    stemBump: paint(128, 256, (u, v, out) => grey(out, fbm(N[3], u * 34, v * 2.5, 34, 1e5, 3)), { srgb: false }),
    gills: paint(1024, 16, (u, v, out) => {
      // long and short gills alternate round the cap
      const k = u * 120, f = k - Math.floor(k);
      const long = Math.floor(k) % 2 === 0 || v > 0.35;
      grey(out, long ? 0.35 + 0.65 * Math.exp(-((f - 0.5) ** 2) / 0.02) : 0.3);
    }),
    floorColor: paint(512, 512, (u, v, out) => {
      const m = fbm(N[6], u * 4, v * 4, 4, 4, 5);
      const moss = smooth(0.44, 0.6, m);
      const fine = fbm(N[7], u * 40, v * 40, 40, 40, 2);
      const lift = 0.75 + 0.5 * fine;
      out[0] = lerp(16, 22, moss) * lift;
      out[1] = lerp(22, 50, moss) * lift;
      out[2] = lerp(44, 74, moss) * lift;
    }, { repeat: 7 }),
    floorBump: paint(512, 512, (u, v, out) => grey(out, 0.5 * fbm(N[6], u * 4, v * 4, 4, 4, 5) + 0.5 * fbm(N[7], u * 40, v * 40, 40, 40, 3)), { srgb: false, repeat: 7 }),
  };

  // ---------- scene, sky, light ----------
  const scene = new THREE.Scene();
  // Undo the tone mapping on the background colour, so after the final pass it is exactly the page's --bg.
  const bg = new THREE.Color(PAGE_BG);
  const lo = Math.sqrt(Math.min(bg.r, bg.g, bg.b) / 6.25);
  bg.addScalar(lo - 6.25 * lo * lo);
  scene.background = bg;
  scene.fog = new THREE.FogExp2(bg, 0.075);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  scene.add(new THREE.HemisphereLight(0x6286e8, 0x0a1230, 1.1));
  const moon = new THREE.DirectionalLight(0xd2e2ff, 2.4);
  moon.position.set(-3, 6, 3.5);
  moon.castShadow = true;
  moon.shadow.mapSize.setScalar(small ? 1024 : 2048);
  Object.assign(moon.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 0.5, far: 20 });
  moon.shadow.bias = -0.0004;
  moon.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(GLOW, 3);
  rim.position.set(-3, 4, -5);
  const glowLight = new THREE.PointLight(GLOW, 0, 5, 1.6);
  scene.add(moon, rim, glowLight);

  // ---------- forest floor ----------
  const floorGeo = new THREE.PlaneGeometry(26, 26, 220, 220).rotateX(-Math.PI / 2);
  const fp = floorGeo.attributes.position;
  for (let i = 0; i < fp.count; i++) fp.setY(i, groundY(fp.getX(i), fp.getZ(i)));
  floorGeo.computeVertexNormals();
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({
    map: tex.floorColor, bumpMap: tex.floorBump, bumpScale: 2.5, roughness: 1,
  }));
  floor.receiveShadow = true;
  scene.add(floor);

  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: radial([[0, "rgba(59,123,255,0.8)"], [0.5, "rgba(59,123,255,0.2)"], [1, "rgba(59,123,255,0)"]]),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  pool.position.y = 0.012;
  scene.add(pool);

  // tree trunks fading into the fog give the clearing some depth
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x101a38, roughness: 1, map: tex.stemColor });
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI * 0.95 + rand(i + 1100) * Math.PI * 0.9 - Math.PI * 0.05;
    const d = 5 + rand(i + 1110) * 7;
    const r = 0.12 + rand(i + 1120) * 0.22;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r, 12, 10, 1, true), trunkMat);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    trunk.position.set(x, groundY(x, z) + 5.5, z);
    trunk.rotation.z = (rand(i + 1130) - 0.5) * 0.12;
    scene.add(trunk);
  }

  // ---------- grass, leaves, pebbles ----------
  const BLADE_H = 0.32;
  const bladeGeo = new THREE.PlaneGeometry(0.035, BLADE_H, 1, 6).translate(0, BLADE_H / 2, 0);
  {
    const p = bladeGeo.attributes.position;
    const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const t = p.getY(i) / BLADE_H;
      p.setX(i, p.getX(i) * (1 - t) ** 0.8);
      p.setZ(i, t * t * 0.1); // a gentle curve
      col.set([lerp(0.03, 0.17, t), lerp(0.07, 0.36, t), lerp(0.15, 0.55, t)], i * 3);
    }
    bladeGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    bladeGeo.computeVertexNormals();
  }
  const wind = { value: 0 };
  const grassMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  grassMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = wind;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        float bend = pow(position.y / ${BLADE_H.toFixed(2)}, 2.0);
        vec2 ip = instanceMatrix[3].xz;
        transformed.x += sin(uTime * 1.4 + ip.x * 1.7 + ip.y * 1.3) * 0.06 * bend;
        transformed.z += cos(uTime * 1.1 + ip.x * 1.1) * 0.03 * bend;`);
  };
  const GRASS = small ? 500 : 1100;
  const grass = new THREE.InstancedMesh(bladeGeo, grassMat, GRASS);
  grass.receiveShadow = true;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < GRASS; i++) {
    // clumps: most blades gather round a few dozen tuft centres
    const tuft = Math.floor(rand(i + 200) * 60);
    const ta = rand(tuft + 250) * Math.PI * 2, td = 0.35 + rand(tuft + 260) ** 0.8 * 3.3;
    const x = Math.cos(ta) * td + (rand(i + 300) - 0.5) * 0.35, z = Math.sin(ta) * td + (rand(i + 310) - 0.5) * 0.35;
    e.set((rand(i + 320) - 0.5) * 0.4, rand(i + 330) * 6.3, (rand(i + 340) - 0.5) * 0.4);
    const h = 0.45 + rand(i + 350) ** 1.5 * 1.1;
    m4.compose(v.set(x, groundY(x, z) - 0.01, z), q.setFromEuler(e), sc.set(1, h, 1));
    grass.setMatrixAt(i, m4);
  }
  scene.add(grass);

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.07, 0.06, 0, 0.18);
  leafShape.quadraticCurveTo(-0.07, 0.06, 0, 0);
  const LEAVES = small ? 70 : 140;
  const leaves = new THREE.InstancedMesh(
    new THREE.ShapeGeometry(leafShape, 6).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }),
    LEAVES,
  );
  leaves.receiveShadow = true;
  const leafColors = [0x2a3c5e, 0x3a3550, 0x1f4058, 0x4a3f4f];
  const col = new THREE.Color();
  for (let i = 0; i < LEAVES; i++) {
    const a = rand(i + 1200) * Math.PI * 2, d = 0.5 + rand(i + 1210) * 4.5;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    e.set((rand(i + 1220) - 0.5) * 0.4, rand(i + 1230) * 6.3, (rand(i + 1240) - 0.5) * 0.4);
    m4.compose(v.set(x, groundY(x, z) + 0.008, z), q.setFromEuler(e), sc.setScalar(0.7 + rand(i + 1250) * 0.8));
    leaves.setMatrixAt(i, m4);
    leaves.setColorAt(i, col.setHex(leafColors[i % leafColors.length]));
  }
  scene.add(leaves);

  const pebbleGeo = new THREE.IcosahedronGeometry(1, 2);
  {
    const p = pebbleGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      v.multiplyScalar(0.8 + 0.35 * fbm(N[2], v.x * 1.5 + 9, v.y * 1.5 + v.z * 1.3, 1e5, 1e5, 2));
      p.setXYZ(i, v.x, v.y * 0.55, v.z);
    }
    pebbleGeo.computeVertexNormals();
  }
  const PEBBLES = small ? 24 : 45;
  const pebbles = new THREE.InstancedMesh(pebbleGeo, new THREE.MeshStandardMaterial({ color: 0x46557a, roughness: 0.75, bumpMap: tex.floorBump, bumpScale: 3 }), PEBBLES);
  pebbles.castShadow = pebbles.receiveShadow = true;
  for (let i = 0; i < PEBBLES; i++) {
    const a = rand(i + 1300) * Math.PI * 2, d = 0.45 + rand(i + 1310) * 2.8;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    m4.compose(v.set(x, groundY(x, z), z), q.setFromEuler(e.set(0, rand(i + 1320) * 6, 0)), sc.setScalar(0.02 + rand(i + 1330) ** 2 * 0.05));
    pebbles.setMatrixAt(i, m4);
  }
  scene.add(pebbles);

  // ---------- mushrooms ----------
  const segs = small ? 56 : 96;
  const big = makeShroom("amanita", { color: 0x3b7bff, scale: 1, x: 0, z: 0, seed: 0.13, segs, warts: 30, ring: true, bend: 0.5 });
  const smalls = [
    { kind: "bell", o: { color: 0x3570f5, scale: 0.5, x: -1.05, z: 0.35, seed: 0.41, segs: segs / 2, warts: 10, bend: -0.9 }, at: 0.08 },
    { kind: "flat", o: { color: 0x4a86ff, scale: 0.46, x: 1.1, z: 0.25, seed: 0.67, segs: segs / 2, warts: 12, bend: 0.8 }, at: 0.16 },
    { kind: "button", o: { color: 0x2f6cf0, scale: 0.36, x: 0.62, z: 1.0, seed: 0.29, segs: segs / 2, warts: 8, bend: 0.4 }, at: 0.24 },
    { kind: "button", o: { color: 0x3b7bff, scale: 0.26, x: -0.55, z: 1.05, seed: 0.83, segs: segs / 2, warts: 7, bend: -0.5 }, at: 0.3 },
    { kind: "bell", o: { color: 0x4a86ff, scale: 0.34, x: -1.45, z: -0.75, seed: 0.57, segs: segs / 2, warts: 8, bend: 0.7 }, at: 0.2 },
  ].map(({ kind, o, at }) => ({ m: makeShroom(kind as keyof typeof SHAPES, o), at }));
  const shrooms = [big, ...smalls.map((s) => s.m)];
  shrooms.forEach((m) => scene.add(m.root));

  // soft contact shadows keep them sitting in the soil
  const shadowTex = radial([[0, "rgba(2,5,16,0.6)"], [1, "rgba(2,5,16,0)"]]);
  const contact = shrooms.map((m) => {
    const sh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    );
    sh.position.set(m.root.position.x, 0.015, m.root.position.z);
    scene.add(sh);
    return sh;
  });

  // ---------- mist, fireflies, spores ----------
  const mistMat = new THREE.SpriteMaterial({
    map: radial([[0, "rgba(110,150,255,1)"], [1, "rgba(110,150,255,0)"]]), transparent: true, opacity: 0.05, depthWrite: false,
  });
  const mists = Array.from({ length: 6 }, (_, i) => {
    const sp = new THREE.Sprite(mistMat);
    sp.scale.set(4 + rand(i + 700) * 3, 0.9 + rand(i + 710) * 0.6, 1);
    scene.add(sp);
    return sp;
  });

  const FIREFLIES = small ? 16 : 26;
  const fireflies = points(FIREFLIES, 0.045, (i) => [
    (rand(i + 800) - 0.5) * 4.6, 0.3 + rand(i + 810) * 2.3, (rand(i + 820) - 0.5) * 2.6 - 0.2, rand(i + 830),
  ], FIREFLY_VS, new THREE.Color(0xe6f6ff).multiplyScalar(1.15));
  const SPORES = small ? 220 : 400;
  const spores = points(SPORES, 0.045, (i) => [
    0.15 + rand(i + 900) * 0.8, rand(i + 910) * Math.PI * 2, rand(i + 920), 0,
  ], SPORE_VS, new THREE.Color(GLOW).multiplyScalar(2.6), { uBurst: { value: 0 }, uCap: { value: new THREE.Vector3() }, uCapR: { value: 1 } });
  scene.add(fireflies, spores);

  // ---------- post: depth of field, bloom ----------
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = new BokehPass(scene, camera, { focus: 6, aperture: 0.0018, maxblur: 0.005 });
  // Particles stay out of the depth pass, otherwise they'd take the blur of whatever is behind them.
  const renderBokeh = bokeh.render.bind(bokeh);
  const noDepth: THREE.Object3D[] = [fireflies, spores, ...mists];
  bokeh.render = (...args: Parameters<typeof bokeh.render>) => {
    noDepth.forEach((o) => (o.visible = false));
    renderBokeh(...args);
    noDepth.forEach((o) => (o.visible = true));
  };
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.9, 0.55, 0.7);
  composer.addPass(bokeh);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- framing ----------
  // The canvas covers the whole sticky stage, but the camera frames the art box,
  // so fireflies and spores can drift past it over the copy.
  let halfH = 400;
  function resize() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    renderer.setSize(cw, ch, false);
    composer.setPixelRatio(dpr);
    composer.setSize(cw, ch);
    const c = canvas.getBoundingClientRect(), a = art.getBoundingClientRect();
    camera.aspect = a.width / a.height;
    camera.setViewOffset(a.width, a.height, c.left - a.left, c.top - a.top, cw, ch);
    camera.updateProjectionMatrix();
    halfH = (ch * dpr) / 2;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  ro.observe(art);
  resize();

  // ---------- input ----------
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (ev: PointerEvent) => {
    pointer.x = (ev.clientX / innerWidth) * 2 - 1;
    pointer.y = (ev.clientY / innerHeight) * 2 - 1;
  };
  if (finePointer) addEventListener("pointermove", onPointer, { passive: true });

  function readProgress() {
    const r = hero.getBoundingClientRect();
    const total = r.height - stage.clientHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  }

  let noteStep = -1, noteTimer = 0;
  function setNote(p: number) {
    if (!note) return;
    let step = 0;
    NOTES.forEach(([at], i) => { if (p >= at) step = i; });
    if (step === noteStep) return;
    const first = noteStep < 0;
    noteStep = step;
    clearTimeout(noteTimer);
    if (first) { note.textContent = NOTES[step][1]; return; }
    note.style.opacity = "0";
    noteTimer = window.setTimeout(() => { note.textContent = NOTES[step][1]; note.style.opacity = ""; }, 250);
  }

  // ---------- loop ----------
  const look = new THREE.Vector3(), capPos = new THREE.Vector3();
  let shown = forced ?? readProgress();
  let raf = 0, last = 0, start = -1, ready = false;

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const time = now / 1000;
    const dt = last ? Math.min(0.05, time - last) : 0.016;
    last = time;
    if (start < 0) start = time;

    shown = forced ?? shown + (readProgress() - shown) * (1 - Math.exp(-dt * 5)); // smoothed scroll
    const p = shown;
    const intro = forced !== null ? 1 : easeOut(clamp((time - start) / 1.8)); // the bud pokes up on load

    // 1. stem rises (0.02 → 0.55), 2. cap unfurls (0.25 → 0.72), 3. spores burst (0.6 → 1)
    const grow = range(p, 0.02, 0.55);
    const open = ease(range(p, 0.25, 0.72));
    const burst = range(p, 0.6, 1);
    const glow = ease(range(p, 0.45, 0.75)) * 0.6 + Math.sin(Math.min(1, burst * 2.5) * Math.PI) * 0.6;

    big.update(intro, grow, open, glow, time, 0);
    smalls.forEach(({ m, at }, i) => {
      const g = range(p, at, at + 0.4);
      const grown = ease(range(p, at + 0.35, at + 0.55));
      m.update(clamp(intro * 1.3 - 0.3 + g), g, ease(range(p, at + 0.12, at + 0.45)), glow * 0.6, time, grown * (0.6 + i * 0.1));
    });
    shrooms.forEach((m, i) => {
      const r = Math.max(0.2, m.capRadius() * 2.6 * (i === 0 ? 1 : 1.2));
      contact[i].scale.set(r, 1, r);
    });

    big.cap.getWorldPosition(capPos);
    const capTop = capPos.y + big.capRadius() * 0.7;
    glowLight.position.set(capPos.x, capPos.y - 0.25, capPos.z);
    glowLight.intensity = glow * 7;
    (pool.material as THREE.MeshBasicMaterial).opacity = 0.3 + glow * 0.5;

    const su = (spores.material as THREE.ShaderMaterial).uniforms;
    su.uBurst.value = burst;
    su.uCap.value.copy(capPos);
    su.uCapR.value = big.capRadius();
    for (const pts of [spores, fireflies]) {
      const u = (pts.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value = time;
      u.uHalfH.value = halfH;
    }
    wind.value = time;
    mists.forEach((m, i) => m.position.set(Math.sin(time * 0.05 + i * 2.1) * 2.6, 0.25 + i * 0.1, -2 + i * 0.6));

    // camera: starts low and close on the bud, rises and pulls back as it grows
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    const c = ease(range(p, 0, 0.85));
    const dist = Math.max(lerp(4.6, 6.6, c), (capTop + 0.6) / 0.52);
    const az = lerp(-0.45, 0.3, ease(p)) + pointer.sx * 0.08;
    camera.position.set(Math.sin(az) * dist, lerp(0.55, 1.15, c) - pointer.sy * 0.1, Math.cos(az) * dist);
    look.set(0, Math.max(lerp(0.3, 1.2, c), capTop * 0.5), 0);
    camera.lookAt(look);
    (bokeh.uniforms as Record<string, THREE.IUniform>).focus.value = camera.position.distanceTo(capPos);

    setNote(p);
    composer.render(dt);
    if (!ready) {
      ready = true;
      onReady();
    }
  }

  // only render while the hero is on screen
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(hero);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      clearTimeout(noteTimer);
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach((m) => m.dispose());
      });
      textures.forEach((t) => t.dispose());
      bloom.dispose();
      bokeh.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };

  // ---------- mushroom builder ----------
  function makeShroom(kind: keyof typeof SHAPES, o: ShroomOpts) {
    const s: Shape = SHAPES[kind];
    const root = new THREE.Group();
    root.position.set(o.x, 0, o.z);
    root.scale.setScalar(o.scale);
    root.rotation.y = o.seed * 7;
    const body = new THREE.Group(); // leans, sways and sinks into the soil
    root.add(body);

    // stem: a lathe that bulges at the base, then bent and made a little lumpy
    const profile = o.ring
      ? [[0, 0], [1.35, 0], [1.45, 0.03], [1.38, 0.08], [1.15, 0.15], [1.02, 0.26], [0.95, 0.5], [0.88, 0.8], [0.84, 1], [0, 1]]
      : [[0, 0], [1.25, 0], [1.2, 0.03], [1.08, 0.1], [1, 0.25], [0.92, 0.6], [0.86, 0.9], [0.84, 1], [0, 1]];
    const stemGeo = new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), Math.max(24, o.segs / 2));
    {
      const p = stemGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const a = Math.atan2(x, z);
        const lump = 1 + smooth(0.1, 0.4, y) * (0.04 * Math.sin(a * 3 + y * 7 + o.seed * 20) + 0.02 * Math.sin(a * 7 - y * 11));
        p.setXYZ(i, x * lump + o.bend * y * y, y, z * lump);
      }
      stemGeo.computeVertexNormals();
    }
    const stemMat = new THREE.MeshStandardMaterial({
      color: STEM, map: tex.stemColor, bumpMap: tex.stemBump, bumpScale: 1.5, roughness: 0.8, emissive: 0x6a86c8, emissiveIntensity: 0.22,
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.castShadow = stem.receiveShadow = true;
    body.add(stem);

    const cap = new THREE.Group();
    body.add(cap);
    const capLathe = liveLathe(CAP_N + 2, o.segs, true);
    const capMat = new THREE.MeshPhysicalMaterial({
      color: o.color, map: tex.capColor, bumpMap: tex.capBump, bumpScale: 1.2, roughness: 0.42,
      clearcoat: 0.35, clearcoatRoughness: 0.5, sheen: 1, sheenColor: new THREE.Color(GLOW), sheenRoughness: 0.4,
      emissive: GLOW, emissiveMap: tex.capGlow, emissiveIntensity: 0.2, side: THREE.DoubleSide,
    });
    const capMesh = new THREE.Mesh(capLathe.geo, capMat);
    capMesh.frustumCulled = false;
    capMesh.castShadow = true;
    cap.add(capMesh);

    const gillLathe = liveLathe(6, o.segs, false);
    const gillMat = new THREE.MeshStandardMaterial({
      color: 0xb9c9ee, map: tex.gills, bumpMap: tex.gills, bumpScale: 2, emissive: GLOW, emissiveMap: tex.gills,
      emissiveIntensity: 0.2, roughness: 0.9, side: THREE.DoubleSide,
    });
    const gillMesh = new THREE.Mesh(gillLathe.geo, gillMat);
    gillMesh.frustumCulled = false;
    cap.add(gillMesh);

    // warts: little irregular lumps, crowded near the crown like a real amanita
    const wartGeo = new THREE.IcosahedronGeometry(1, 1);
    {
      const p = wartGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).multiplyScalar(0.75 + 0.5 * rand(i * 3.1 + o.seed * 50));
        p.setXYZ(i, v.x, v.y, v.z);
      }
      wartGeo.computeVertexNormals();
    }
    const wartMesh = new THREE.InstancedMesh(
      wartGeo,
      new THREE.MeshStandardMaterial({ color: WART, roughness: 0.85, bumpMap: tex.stemBump, bumpScale: 2, emissive: 0x8fb0ff, emissiveIntensity: 0.12 }),
      o.warts,
    );
    wartMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    wartMesh.frustumCulled = false;
    wartMesh.castShadow = true;
    cap.add(wartMesh);
    const warts = Array.from({ length: o.warts }, (_, i) => {
      const t = 0.04 + rand(o.seed * 10 + i) ** 0.9 * 0.68;
      return { t, phi: i * 2.39996 + rand(o.seed * 20 + i) * 0.5, r: (0.045 + rand(o.seed * 30 + i) * 0.055) * (1.15 - t * 0.6), spin: rand(o.seed * 40 + i) * 6 };
    });

    // the skirt an amanita keeps on its stem once the cap tears free of it
    let ring: THREE.Mesh | null = null;
    if (o.ring) {
      const l = liveLathe(6, o.segs, true);
      l.set([1, 1.45, 1.85, 2.1, 2.22, 2.2], [0, -0.04, -0.13, -0.25, -0.36, -0.42], 0.08, 3);
      ring = new THREE.Mesh(l.geo, stemMat);
      ring.frustumCulled = false;
      ring.castShadow = true;
      body.add(ring);
    }

    const px = new Float32Array(CAP_N + 2), py = new Float32Array(CAP_N + 2);
    const gx = new Float32Array(6), gy = new Float32Array(6);
    const wm = new THREE.Matrix4(), wq = new THREE.Quaternion(), wq2 = new THREE.Quaternion(), wv = new THREE.Vector3(), wn = new THREE.Vector3(), ws = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    let capR = 0;

    function update(emerge: number, grow: number, open: number, glow: number, time: number, dance: number) {
      const h = s.stemH * (0.12 + 0.88 * ease(grow));
      const r = s.stemR * lerp(0.75, 1, grow);
      stem.scale.set(r, h, r);
      cap.position.set(o.bend * r, h, 0); // follow the bent stem
      cap.rotation.z = -o.bend * r * 0.8;
      body.position.y = -(1 - easeOut(emerge)) * 0.9;

      const sway = Math.sin(time * (1.1 + o.seed) + o.seed * 9);
      body.rotation.z = 0.04 * Math.sin(o.seed * 13) + dance * sway * 0.12 + 0.015 * Math.sin(time * 0.7 + o.seed);
      body.rotation.x = 0.04 * Math.cos(o.seed * 17) + dance * Math.cos(time * (0.9 + o.seed) + o.seed) * 0.06;
      body.scale.y = 1 + dance * Math.sin(time * (2.2 + o.seed) + o.seed * 5) * 0.03;

      const c = capAt(s, open);
      capR = c.R;
      for (let k = 0; k <= CAP_N; k++) {
        const pt = capPoint(c, k / CAP_N, open);
        px[k] = pt.x;
        py[k] = pt.y;
      }
      // the lip tucks back under the rim to give the cap some thickness
      px[CAP_N + 1] = px[CAP_N] * 0.9;
      py[CAP_N + 1] = py[CAP_N] + 0.05 * c.R;
      capLathe.set(px, py, 0.05 * open, o.seed * 11);

      const rimX = px[CAP_N + 1], rimY = py[CAP_N + 1];
      const yIn = lerp(rimY, c.R * c.sy, 0.45);
      for (let j = 0; j < 6; j++) {
        const u = j / 5;
        gx[j] = lerp(r * 0.9, rimX * 0.97, u);
        gy[j] = lerp(yIn, rimY, u) - Math.sin(u * Math.PI) * 0.03 * c.R;
      }
      gillLathe.set(gx, gy);
      gillMat.emissiveIntensity = 0.15 + glow * 2.2;
      capMat.emissiveIntensity = 0.15 + glow * 0.5;

      warts.forEach((w, i) => {
        const pt = capPoint(c, w.t, open);
        const sn = Math.sin(w.phi), cs = Math.cos(w.phi);
        wn.set(pt.nx * sn, pt.ny, pt.nx * cs);
        wv.set(pt.x * sn, pt.y, pt.x * cs).addScaledVector(wn, 0.006);
        wq.setFromUnitVectors(up, wn).multiply(wq2.setFromAxisAngle(up, w.spin));
        const size = w.r * lerp(0.7, 1, open) * Math.max(0.5, c.R);
        ws.set(size, size * 0.45, size);
        wm.compose(wv, wq, ws);
        wartMesh.setMatrixAt(i, wm);
      });
      wartMesh.instanceMatrix.needsUpdate = true;

      if (ring) {
        const tear = ease(range(open, 0.35, 0.8));
        ring.visible = tear > 0.01;
        ring.position.set(o.bend * r * 0.78 ** 2, h * 0.78, 0);
        ring.scale.set(r * lerp(0.9, 1, tear), r * tear, r * lerp(0.9, 1, tear));
      }
    }

    return { root, cap, update, capRadius: () => capR * o.scale };
  }
}

// ---------- a lathe whose profile can change every frame ----------
// Same vertex layout as THREE.LatheGeometry. `flip` reverses which side faces out.
function liveLathe(n: number, segs: number, flip: boolean) {
  const count = (segs + 1) * n;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const idx: number[] = [];
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < n - 1; j++) {
      const a = i * n + j, b = a + n, c = b + 1, d = a + 1;
      if (flip) idx.push(a, d, b, c, b, d);
      else idx.push(a, b, d, c, d, b);
    }
  for (let i = 0; i <= segs; i++)
    for (let j = 0; j < n; j++) {
      uv[(i * n + j) * 2] = i / segs;
      uv[(i * n + j) * 2 + 1] = j / (n - 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(idx);
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const norAttr = new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("normal", norAttr);
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  const sin = Float32Array.from({ length: segs + 1 }, (_, i) => Math.sin((i / segs) * Math.PI * 2));
  const cos = Float32Array.from({ length: segs + 1 }, (_, i) => Math.cos((i / segs) * Math.PI * 2));
  const nx = new Float32Array(n), ny = new Float32Array(n);
  const sign = flip ? -1 : 1;

  // ripple: how much the outer edge waves around the circumference
  function set(px: ArrayLike<number>, py: ArrayLike<number>, ripple = 0, phase = 0) {
    for (let j = 0; j < n; j++) {
      const j0 = Math.max(0, j - 1), j1 = Math.min(n - 1, j + 1);
      const tx = px[j1] - px[j0], ty = py[j1] - py[j0];
      const l = Math.hypot(tx, ty) || 1;
      nx[j] = (sign * ty) / l;
      ny[j] = (-sign * tx) / l;
    }
    for (let i = 0; i <= segs; i++) {
      const phi = (i / segs) * Math.PI * 2;
      const wave = 0.5 * Math.sin(5 * phi + phase) + 0.3 * Math.sin(3 * phi + phase * 2.3) + 0.2 * Math.sin(11 * phi + phase * 0.7);
      for (let j = 0; j < n; j++) {
        const k = (i * n + j) * 3;
        const r = px[j] * (1 + ripple * wave * (j / (n - 1)) ** 3);
        pos[k] = r * sin[i];
        pos[k + 1] = py[j];
        pos[k + 2] = r * cos[i];
        nor[k] = nx[j] * sin[i];
        nor[k + 1] = ny[j];
        nor[k + 2] = nx[j] * cos[i];
      }
    }
    posAttr.needsUpdate = true;
    norAttr.needsUpdate = true;
  }
  return { geo, set };
}

// ---------- mushroom shapes ----------
// Cap = a slice of a squashed sphere: [polar angle reached, radius, vertical squash].
// A bud wraps far round (an egg); an open cap is a dome.
type Shape = { bud: [number, number, number]; open: [number, number, number]; stemH: number; stemR: number };
const SHAPES = {
  amanita: { bud: [2.35, 0.42, 1.2], open: [1.42, 0.98, 0.7], stemH: 1.5, stemR: 0.15 },
  bell: { bud: [2.3, 0.36, 1.35], open: [1.7, 0.56, 1.05], stemH: 1.25, stemR: 0.12 },
  flat: { bud: [2.3, 0.38, 1.1], open: [1.2, 0.8, 0.45], stemH: 1.1, stemR: 0.14 },
  button: { bud: [2.4, 0.4, 1.05], open: [1.55, 0.56, 0.72], stemH: 0.75, stemR: 0.15 },
} satisfies Record<string, Shape>;
type ShroomOpts = { color: number; scale: number; x: number; z: number; seed: number; segs: number; warts: number; bend: number; ring?: boolean };

const CAP_N = 28; // points along the cap profile (plus one for the tucked-under lip)

function capAt(s: Shape, open: number) {
  return { th: lerp(s.bud[0], s.open[0], open), R: lerp(s.bud[1], s.open[1], open), sy: lerp(s.bud[2], s.open[2], open) };
}
// point + outward normal on the cap surface, t = 0 at the crown, 1 at the rim
function capPoint(c: { th: number; R: number; sy: number }, t: number, open: number) {
  const a = c.th * t;
  const flare = 1 + 0.08 * open * t ** 6;
  const x = c.R * Math.sin(a) * flare, y = c.R * c.sy * Math.cos(a);
  const nx = c.R * c.sy * Math.sin(a), ny = c.R * Math.cos(a);
  const l = Math.hypot(nx, ny) || 1;
  return { x, y, nx: nx / l, ny: ny / l };
}

// ---------- particles ----------
const FIREFLY_VS = /* glsl */ `
  uniform float uTime; uniform float uSize; uniform float uHalfH;
  attribute vec4 aSeed;
  varying float vAlpha;
  void main() {
    float s = aSeed.w, t = uTime;
    vec3 p = aSeed.xyz;
    // a slow wide loop plus a quick jitter: a curvy, insect-like path
    p.x += sin(t * 0.31 * (0.6 + s) + s * 12.0) * 0.55 + sin(t * 1.7 + s * 40.0) * 0.06;
    p.y += sin(t * 0.23 * (0.7 + s) + s * 7.0) * 0.35 + cos(t * 2.1 + s * 30.0) * 0.05;
    p.z += cos(t * 0.27 * (0.5 + s) + s * 9.0) * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * projectionMatrix[1][1] * uHalfH / -mv.z;
    float blink = 0.5 + 0.5 * sin(t * (0.6 + s * 1.1) + s * 20.0);
    vAlpha = 0.12 + 0.88 * smoothstep(0.3, 1.0, blink);
  }`;
const SPORE_VS = /* glsl */ `
  uniform float uTime; uniform float uSize; uniform float uHalfH;
  uniform float uBurst; uniform vec3 uCap; uniform float uCapR;
  attribute vec4 aSeed; // x: distance from the stem, y: angle, z: random
  varying float vAlpha;
  void main() {
    float s = aSeed.z, t = uTime;
    float b = clamp((uBurst - s * 0.45) / 0.55, 0.0, 1.0);
    float eb = 1.0 - pow(1.0 - b, 3.0);
    vec2 d = vec2(cos(aSeed.y), sin(aSeed.y));
    vec3 origin = uCap + vec3(d.x * aSeed.x * uCapR, -0.08, d.y * aSeed.x * uCapR);
    vec3 dir = normalize(vec3(d.x * (0.5 + aSeed.x), -0.35 + s * 0.8, d.y * (0.5 + aSeed.x)));
    vec3 p = origin + dir * eb * (0.6 + s * 2.4);
    p.y += b * b * (0.5 + fract(s * 7.3) * 1.2); // then they ride the night air upward
    p += vec3(sin(t * 0.4 + s * 30.0), sin(t * 0.3 + s * 17.0) * 0.6, cos(t * 0.35 + s * 11.0)) * 0.22 * eb;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + fract(s * 13.7) * 0.8) * projectionMatrix[1][1] * uHalfH / -mv.z;
    vAlpha = smoothstep(0.0, 0.06, b) * (0.35 + 0.65 * (0.5 + 0.5 * sin(t * 1.4 + s * 50.0)));
  }`;
const DOT_FS = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, core * core * core * vAlpha);
  }`;

function points(count: number, size: number, data: (i: number) => number[], vs: string, color: THREE.Color, extra: Record<string, THREE.IUniform> = {}) {
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) arr.set(data(i), i * 4);
  geo.setAttribute("aSeed", new THREE.BufferAttribute(arr, 4));
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: size }, uHalfH: { value: 400 }, uColor: { value: color }, ...extra },
    vertexShader: vs, fragmentShader: DOT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const p = new THREE.Points(geo, mat);
  p.frustumCulled = false;
  return p;
}
