// Geometry for the valley print. Everything here is generated once, at module
// load, from fixed seeds, so the picture is identical on every visit.
// Units are the scene's own 1600 x 900 sheet, y down. The horizon sits low, at
// about y 700, so the whole landscape shows in the strip under the noren.
export const W = 1600;
export const H = 900;

const seeded = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const n = (value) => Math.round(value * 10) / 10;
const line = (points) => points.map(([x, y]) => `${n(x)} ${n(y)}`).join('L');

const catmull = (p0, p1, p2, p3, t) =>
    0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);

// A smooth profile through hand-placed points, sampled left to right.
const profile = (points, step) => {
    const out = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];
        const count = Math.max(1, Math.round((p2[0] - p1[0]) / step));
        for (let s = 0; s < count; s++) {
            const t = s / count;
            out.push([p1[0] + (p2[0] - p1[0]) * t, catmull(p0[1], p1[1], p2[1], p3[1], t)]);
        }
    }
    out.push(points[points.length - 1]);
    return out;
};

const heightAt = (samples, x) => {
    let i = 0;
    while (i < samples.length - 2 && samples[i + 1][0] < x) i++;
    const [x0, y0] = samples[i];
    const [x1, y1] = samples[i + 1];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
};

// A bare ridge: the profile with a little weather in it.
const ridge = (points, seed, rough) => {
    const random = seeded(seed);
    const phase = [random() * 6.3, random() * 6.3, random() * 6.3];
    const top = profile(points, 12).map(([x, y]) => [
        x,
        y + Math.sin(x * 0.019 + phase[0]) * rough + Math.sin(x * 0.043 + phase[1]) * rough * 0.5 + Math.sin(x * 0.11 + phase[2]) * rough * 0.22,
    ]);
    return `M0 ${H}L${line(top)}L${W} ${H}Z`;
};

// A forested ridge: the same profile with a cedar at every step.
const forest = (points, seed, [low, high]) => {
    const random = seeded(seed);
    const samples = profile(points, 6);
    const top = [[0, heightAt(samples, 0)]];
    let x = 0;
    while (x < W) {
        const width = 7 + random() * 10;
        const height = low + random() * (high - low);
        const left = heightAt(samples, x);
        const right = heightAt(samples, Math.min(x + width, W));
        top.push([x + width * (0.38 + random() * 0.24), Math.min(left, right) - height], [x + width, right]);
        x += width;
    }
    return `M0 ${H}L${line(top)}L${W} ${H}Z`;
};

// Rice terraces. Contour lines fan out from the foot of the slope, each band a
// little wider than the one above, and cross levees cut the bands into fields.
const terraces = ({ from, to, top, count, seed }) => {
    const random = seeded(seed);
    const contours = [];
    let drop = 0;
    for (let k = 0; k <= count; k++) {
        contours.push({ drop, phase: random() * 6.3, wobble: 0.8 + random() * 2.4 });
        drop += 5.5 + k * 0.95 + random() * 3.2;
    }
    const at = (contour, x) => {
        const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
        const open = Math.pow(Math.sin((Math.PI / 2) * (1 - t)), 0.75);
        return top(x) + contour.drop * open + Math.sin(x * 0.024 + contour.phase) * contour.wobble * open;
    };
    const bands = [];
    let levees = '';
    for (let k = 0; k < count; k++) {
        const upper = [];
        const lower = [];
        for (let x = from; x <= to; x += 14) {
            upper.push([x, at(contours[k], x)]);
            lower.push([x, at(contours[k + 1], x)]);
        }
        const pick = random();
        bands.push({ d: `M${line(upper)}L${line(lower.reverse())}Z`, tone: pick < 0.12 ? 'planted' : pick < 0.36 ? 'still' : 'bright' });
        let x = from + random() * 100;
        while (x < to - 90) {
            levees += `M${n(x)} ${n(at(contours[k], x))}L${n(x + (random() - 0.5) * 12)} ${n(at(contours[k + 1], x))}`;
            x += 50 + random() * 130;
        }
    }
    return { bands, levees };
};

// A ribbon through [x, y, width] points: the river, thin at the horizon.
const ribbon = (points) => {
    const left = [];
    const right = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];
        for (let s = 0; s <= 10; s++) {
            const t = s / 10;
            const at = (u) => [catmull(p0[0], p1[0], p2[0], p3[0], u), catmull(p0[1], p1[1], p2[1], p3[1], u)];
            const [x, y] = at(t);
            const [ax, ay] = at(t + 0.02);
            const [bx, by] = at(t - 0.02);
            const length = Math.hypot(ax - bx, ay - by) || 1;
            const half = catmull(p0[2], p1[2], p2[2], p3[2], t) / 2;
            left.push([x - ((ay - by) / length) * half, y + ((ax - bx) / length) * half]);
            right.push([x + ((ay - by) / length) * half, y - ((ax - bx) / length) * half]);
        }
    }
    return `M${line(left)}L${line(right.reverse())}Z`;
};

// A thatched farmhouse seen gable-on: steep roof, low wall, one lit screen.
const farmhouse = (x, y, width) => {
    const roof = width * 0.82;
    const wall = width * 0.2;
    return {
        roof: `M${n(x - width * 0.58)} ${n(y - wall)}L${n(x)} ${n(y - wall - roof)}L${n(x + width * 0.58)} ${n(y - wall)}Z`,
        wall: `M${n(x - width * 0.46)} ${n(y - wall)}h${n(width * 0.92)}v${n(wall)}h${n(-width * 0.92)}Z`,
        windows: [
            [n(x - width * 0.1), n(y - wall * 0.82), n(width * 0.2), n(wall * 0.6)],
            [n(x - width * 0.055), n(y - wall - roof * 0.42), n(width * 0.11), n(roof * 0.1)],
        ],
    };
};

// A cedar: a tall spear with stepped boughs.
const cedar = (x, base, height, width, random) => {
    const tiers = Math.max(5, Math.round(height / 20));
    const step = height / tiers;
    const left = [];
    const right = [];
    for (let i = 1; i <= tiers; i++) {
        const half = (width / 2) * Math.pow(i / tiers, 0.85) * (0.82 + random() * 0.32);
        const y = base - height + step * i;
        left.push([x - half, y], [x - half * 0.5, y - step * 0.22]);
        right.push([x + half, y], [x + half * 0.5, y - step * 0.22]);
    }
    return `M${n(x)} ${n(base - height)}L${line(left)}L${n(x)} ${n(base)}L${line(right.reverse())}Z`;
};

const grove = (cedars, seed) => {
    const random = seeded(seed);
    return cedars.map(([x, base, height, width]) => cedar(x, base, height, width, random)).join('');
};

// A myojin torii: leaning pillars, a tie beam, and a lintel that lifts at both ends.
const torii = (cx, base, width, height) => {
    const top = base - height;
    const pillar = width * 0.09;
    const lean = width * 0.05;
    const rise = height * 0.075;
    const lintel = height * 0.085;
    const under = height * 0.05;
    const span = width * 1.56;
    const tie = top + height * 0.3;

    const leg = (side) => {
        const foot = cx + side * (width / 2);
        const head = foot - side * lean;
        return `M${n(foot - pillar / 2)} ${n(base)}L${n(head - pillar * 0.42)} ${n(top + lintel + under)}h${n(pillar * 0.84)}L${n(foot + pillar / 2)} ${n(base)}Z`;
    };
    const beam = (half, y, thick, lift) =>
        `M${n(cx - half)} ${n(y - lift)}Q${n(cx)} ${n(y + lift * 0.7)} ${n(cx + half)} ${n(y - lift)}l${n(-thick * 0.25)} ${n(thick * 1.12)}Q${n(cx)} ${n(y + thick + lift * 0.7)} ${n(cx - half + thick * 0.25)} ${n(y - lift + thick * 1.12)}Z`;

    return {
        legs: leg(-1) + leg(1),
        feet: [-1, 1]
            .map((side) => `M${n(cx + side * (width / 2) - pillar * 0.66)} ${n(base - height * 0.07)}h${n(pillar * 1.32)}v${n(height * 0.07)}h${n(-pillar * 1.32)}Z`)
            .join(''),
        tie: `M${n(cx - width * 0.64)} ${n(tie)}h${n(width * 1.28)}v${n(height * 0.058)}h${n(-width * 1.28)}Z`,
        strut: `M${n(cx - width * 0.045)} ${n(top + lintel + under)}h${n(width * 0.09)}V${n(tie)}h${n(-width * 0.09)}Z`,
        under: beam(span * 0.44, top + lintel * 0.92, under, rise * 0.7),
        lintel: beam(span / 2, top, lintel, rise),
        cap: `M${n(cx - span / 2)} ${n(top - rise)}Q${n(cx)} ${n(top + rise * 0.7)} ${n(cx + span / 2)} ${n(top - rise)}`,
    };
};

const steps = (cx, top, bottom, narrow, wide, count) => {
    let d = '';
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const y = top + (bottom - top) * t;
        const half = (narrow + (wide - narrow) * t) / 2;
        d += `M${n(cx - half)} ${n(y)}h${n(half * 2)}v${n(3 + t * 3)}h${n(-half * 2)}Z`;
    }
    return d;
};

const cubic = (a, b, c, d, t) => {
    const u = 1 - t;
    return [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ];
};

const quad = (a, b, c, t) => {
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
};

// A limb with real taper: offset both sides of a centre line, thick to thin.
const limb = (at, from, to) => {
    const left = [];
    const right = [];
    const count = 22;
    for (let i = 0; i <= count; i++) {
        const t = i / count;
        const [x, y] = at(t);
        const [ax, ay] = at(Math.min(1, t + 0.02));
        const [bx, by] = at(Math.max(0, t - 0.02));
        const length = Math.hypot(ax - bx, ay - by) || 1;
        const half = (from + (to - from) * Math.pow(t, 0.8)) / 2;
        const nx = (-(ay - by) / length) * half;
        const ny = ((ax - bx) / length) * half;
        left.push([x + nx, y + ny]);
        right.push([x - nx, y - ny]);
    }
    return `M${line(left)}L${line(right.reverse())}Z`;
};

const dot = (x, y, r) => `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0`;

// The blossom that hangs from one bough: strands along it, clusters down each
// strand. Blossom is three flat tones, the way a printer would cut it.
// `spacing` is the distance between strands and `hang` scales their length.
const drape = (boughAt, span, hang, random, spacing = 24) => {
    const tones = ['', '', ''];
    let strands = '';
    // Each curtain is its own small layer, so it needs to know its extent.
    const box = [Infinity, Infinity, -Infinity, -Infinity];
    const bloom = (x, y, r, tone) => {
        tones[tone] += dot(x, y, r);
        box[0] = Math.min(box[0], x - r);
        box[1] = Math.min(box[1], y - r);
        box[2] = Math.max(box[2], x + r);
        box[3] = Math.max(box[3], y + r);
    };
    const count = Math.max(4, Math.round(span / spacing));
    for (let s = 1; s <= count; s++) {
        const t = 0.16 + (s / count) * 0.84;
        const [x, y] = boughAt(t);
        const length = (90 + random() * 200) * (0.5 + Math.sin(Math.PI * t) * 0.62) * hang;
        const sway = -14 - random() * 26;
        const mid = [x + sway * 0.25 + (random() - 0.5) * 14, y + length * 0.55];
        const end = [x + sway, y + length];
        strands += `M${n(x)} ${n(y)}Q${n(mid[0])} ${n(mid[1])} ${n(end[0])} ${n(end[1])}`;
        // Blossom gathers in clusters down the strand, thicker toward the tip.
        const clusters = Math.max(3, Math.round(length / 22));
        for (let c = 0; c < clusters; c++) {
            const along = 0.1 + ((c + random() * 0.8) / clusters) * 0.9;
            const [cx, cy] = quad([x, y], mid, end, along);
            const petals = 3 + Math.floor(random() * 4 + along * 3);
            for (let p = 0; p < petals; p++) {
                const roll = random();
                bloom(cx + (random() - 0.5) * (7 + along * 8), cy + (random() - 0.5) * 9, 1.5 + random() * 2.1, roll < 0.22 ? 2 : roll < 0.6 ? 1 : 0);
            }
        }
    }
    // Blossom on the bough itself, so no branch is left bare.
    for (let f = 0; f < span / 7; f++) {
        const [fx, fy] = boughAt(0.12 + random() * 0.88);
        bloom(fx + (random() - 0.5) * 16, fy + (random() - 0.5) * 13, 1.6 + random() * 2.2, random() < 0.5 ? 0 : 1);
    }
    return {
        strands,
        tones,
        box: [Math.floor(box[0]) - 4, Math.floor(box[1]) - 4, Math.ceil(box[2] - box[0]) + 8, Math.ceil(box[3] - box[1]) + 8],
    };
};

const trunkAt = (t) => cubic([1626, 940], [1584, 690], [1482, 470], [1508, 250], t);

// A weeping cherry leaning in from the right: a trunk, boughs that arch out,
// and a curtain of blossom hanging from each.
const weepingCherry = (seed) => {
    const random = seeded(seed);
    const wood = [limb(trunkAt, 56, 19)];
    const curtains = [];

    // The boughs keep to the right of x 1370, so the lanterns hang against open sky.
    const reach = [
        { tip: [1372, 104], lift: 96, start: 0.84, from: 14, hang: 0.55 },
        { tip: [1432, 44], lift: 84, start: 0.93, from: 13, hang: 0.85 },
        { tip: [1508, 14], lift: 56, start: 0.98, from: 12, hang: 1 },
        { tip: [1596, 54], lift: 80, start: 0.9, from: 12, hang: 1 },
        { tip: [1646, 194], lift: 70, start: 0.8, from: 11, hang: 1 },
    ];

    reach.forEach((bough, index) => {
        const origin = trunkAt(bough.start);
        const control = [(origin[0] + bough.tip[0]) / 2, Math.min(origin[1], bough.tip[1]) - bough.lift];
        const boughAt = (t) => quad(origin, control, bough.tip, t);
        wood.push(limb(boughAt, bough.from, 2.5));
        const span = Math.hypot(bough.tip[0] - origin[0], bough.tip[1] - origin[1]);
        curtains.push({ ...drape(boughAt, span, bough.hang, random), swing: 7 + (index % 3) * 1.6, lag: -index * 1.9 });
    });

    return { wood: wood.join(''), curtains };
};

// One low bough of the same tree, for the narrow layouts where the entrance
// cloth covers the canopy. It is drawn around y 0, which the valley pins to the
// cloth's hem: the wood sits above the line, behind the cloth, and the blossom
// hangs below it. `HEM` is the height it is drawn for; the valley slides the
// bough along the trunk's lean when the hem sits higher or lower than that.
const HEM = 441;
const LEAN = 0.21;

const lowBough = (seed) => {
    const random = seeded(seed);
    const origin = [1510, -34];
    const tip = [1432, 8];
    const boughAt = (t) => quad(origin, [1466, -56], tip, t);
    const span = Math.hypot(tip[0] - origin[0], tip[1] - origin[1]);
    const { strands, tones } = drape(boughAt, span, 0.5, random, 11);
    // Wood and blossom share one frame, so they stay registered while the blossom sways.
    return { wood: limb(boughAt, 9, 2.2), strands, tones, box: [1372, -66, 160, 250], hem: HEM, lean: LEAN };
};

const scatter = (count, seed, box) => {
    const random = seeded(seed);
    return Array.from({ length: count }, () => [
        n(box[0] + random() * (box[2] - box[0])),
        n(box[1] + Math.pow(random(), 1.6) * (box[3] - box[1])),
        n(0.6 + random() * 1.1),
    ]);
};

// ---------- the picture ----------

// Two bare ranges on the horizon. The sun goes down in the saddle at x 1322.
export const far = ridge([[0, 640], [200, 606], [420, 634], [640, 598], [860, 646], [1060, 676], [1220, 700], [1330, 708], [1440, 690], [1540, 650], [1600, 640]], 11, 6);
export const middle = ridge([[0, 690], [180, 668], [360, 700], [560, 676], [800, 716], [1000, 738], [1180, 752], [1320, 756], [1440, 744], [1600, 712]], 29, 5);

// The cedar slopes that frame the valley, left and right.
const leftEdge = [[0, 548], [150, 575], [320, 622], [520, 668], [760, 714], [980, 748], [1140, 768], [1260, 800], [1600, 1000]];
export const slopeLeft = forest(leftEdge, 5, [10, 22]);
export const slopeRight = forest([[0, 1000], [1120, 840], [1240, 792], [1360, 762], [1480, 738], [1600, 716]], 17, [8, 18]);

const treeline = profile(leftEdge, 6);
export const paddies = terraces({
    from: -60,
    to: 1150,
    top: (x) => heightAt(treeline, Math.max(0, x)) + 15,
    count: 11,
    seed: 41,
});

export const river = ribbon([
    [1284, 748, 2],
    [1200, 757, 6],
    [1080, 776, 14],
    [930, 800, 26],
    [770, 830, 46],
    [640, 866, 78],
    [560, 912, 120],
]);

export const village = [farmhouse(452, 730, 54), farmhouse(548, 752, 42), farmhouse(352, 716, 38)];

export const shrineGrove = grove(
    [
        [1330, 796, 168, 44],
        [1366, 802, 214, 50],
        [1404, 808, 188, 46],
        [1530, 814, 226, 52],
        [1566, 818, 186, 46],
        [1496, 810, 150, 40],
        [1300, 798, 128, 38],
    ],
    73
);

// The knoll the gate stands on, and the grass in front of everything.
export const knoll = ridge([[0, 1000], [1080, 950], [1210, 884], [1310, 848], [1400, 836], [1520, 836], [1600, 844]], 53, 3);
export const gate = torii(1452, 840, 100, 126);
export const gateSteps = steps(1452, 846, 894, 84, 150, 5);
export const bank = forest([[0, 886], [300, 878], [640, 892], [980, 882], [1240, 894], [1600, 886]], 61, [5, 14]);

export const cherry = weepingCherry(8);
export const hemBough = lowBough(23);

// Suyari-gasumi: the stepped, round-ended bands that mist and cloud are drawn
// as in Japanese painting. Each is three overlapping lobes filled as one shape.
const pill = (x, y, width, height) => {
    const r = height / 2;
    return `M${n(x + r)} ${n(y)}h${n(width - height)}a${n(r)} ${n(r)} 0 0 1 0 ${n(height)}h${n(height - width)}a${n(r)} ${n(r)} 0 0 1 0 ${n(-height)}Z`;
};

const gasumi = ([x, y, width, height, lean = 1]) => {
    const step = height * 0.78;
    const upper = lean > 0 ? [x + width * 0.1, y - step, width * 0.46] : [x + width * 0.42, y - step, width * 0.5];
    const lower = lean > 0 ? [x + width * 0.38, y + step, width * 0.54] : [x + width * 0.06, y + step, width * 0.44];
    return {
        d: pill(x, y, width, height) + pill(upper[0], upper[1], upper[2], height) + pill(lower[0], lower[1], lower[2], height),
        box: [Math.floor(x) - 2, Math.floor(y - step) - 2, Math.ceil(width) + 4, Math.ceil(height + step * 2) + 4],
    };
};

export const mist = [
    [40, 664, 520, 18, 1],
    [330, 694, 700, 15, -1],
    [880, 716, 440, 16, 1],
    [-60, 734, 360, 13, -1],
].map(gasumi);

export const clouds = [
    [150, 366, 600, 17, 1],
    [-60, 468, 500, 15, -1],
    [640, 516, 660, 15, 1],
].map(gasumi);

export const crows = [
    [742, 446, 1],
    [786, 424, 0.8],
    [826, 458, 0.7],
    [892, 430, 0.6],
];

export const stars = scatter(80, 97, [0, 0, W, 560]);
