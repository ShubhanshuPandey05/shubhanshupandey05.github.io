// "Zen garden" ambience, generated live with the Web Audio API (no audio files):
// soft wind, koto-like plucks in the Japanese In scale, and a singing bowl now and then.
// Browsers only allow audio after a click, so this starts from the sound toggle.

const listeners = new Set();
let ctx = null;
let master = null;
let running = false;
let timers = [];
let windNodes = null;

// D "In" scale (miyako-bushi): D Eb G A Bb, across two octaves.
const SCALE = [293.66, 311.13, 392.0, 440.0, 466.16, 587.33, 622.25, 783.99, 880.0];

const emit = () => listeners.forEach((fn) => fn(running));

export const subscribeSound = (fn) => {
    listeners.add(fn);
    fn(running);
    return () => listeners.delete(fn);
};

export const isSoundOn = () => running;

const makeImpulse = (ac, seconds = 4.5, decay = 2.6) => {
    const len = ac.sampleRate * seconds;
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
};

const setup = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    master.connect(comp).connect(ctx.destination);

    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);
    master.reverbIn = reverb;
    return true;
};

const out = (node, dry = 0.6) => {
    const d = ctx.createGain();
    d.gain.value = dry;
    node.connect(d).connect(master);
    node.connect(master.reverbIn);
};

const startWind = () => {
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
        // Brown-ish noise: softer than white noise.
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.16;

    // Slow LFOs make the wind breathe.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 260;
    lfo.connect(lfoAmt).connect(filter.frequency);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.045;
    const lfo2Amt = ctx.createGain();
    lfo2Amt.gain.value = 0.08;
    lfo2.connect(lfo2Amt).connect(gain.gain);

    src.connect(filter).connect(gain);
    out(gain, 0.8);
    src.start();
    lfo.start();
    lfo2.start();
    windNodes = [src, lfo, lfo2];
};

const pluck = (freq, when = 0, vel = 1) => {
    const t = ctx.currentTime + when;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16 * vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(freq * 9, t);
    lp.frequency.exponentialRampToValueAtTime(freq * 1.4, t + 0.9);

    [1, 1.003].forEach((detune, i) => {
        const o = ctx.createOscillator();
        o.type = i ? 'sine' : 'triangle';
        o.frequency.setValueAtTime(freq * detune, t);
        // A tiny pitch bend down at the end, like a koto string being pressed.
        o.frequency.linearRampToValueAtTime(freq * detune * 0.995, t + 2.5);
        o.connect(lp);
        o.start(t);
        o.stop(t + 3.4);
    });
    lp.connect(g);
    out(g, 0.55);
    window.dispatchEvent(new CustomEvent('zen:note', { detail: { freq } }));
};

const bowl = (freq) => {
    const t = ctx.currentTime;
    [1, 2.76, 5.4].forEach((ratio, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq * ratio;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06 / (i + 1), t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 7 - i);
        o.connect(g);
        out(g, 0.4);
        o.start(t);
        o.stop(t + 7.5);
    });
};

const later = (fn, ms) => {
    const id = setTimeout(() => {
        timers = timers.filter((x) => x !== id);
        if (running) fn();
    }, ms);
    timers.push(id);
};

let degree = 2;
const phrase = () => {
    // Gentle random walk through the scale, with rests and the odd pair of notes.
    degree = Math.max(0, Math.min(SCALE.length - 1, degree + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
    pluck(SCALE[degree], 0, 0.6 + Math.random() * 0.4);
    if (Math.random() < 0.25) pluck(SCALE[Math.max(0, degree - 2)], 0.18, 0.5);
    later(phrase, 1100 + Math.random() * 2600 + (Math.random() < 0.2 ? 3000 : 0));
};

const bowls = () => {
    bowl(146.83);
    later(bowls, 14000 + Math.random() * 12000);
};

export const startSound = async () => {
    if (running) return;
    if (!ctx && !setup()) return;
    await ctx.resume();
    running = true;
    if (!windNodes) startWind();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.5);
    later(phrase, 600);
    later(bowls, 3500);
    emit();
};

export const stopSound = () => {
    if (!running) return;
    running = false;
    timers.forEach(clearTimeout);
    timers = [];
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 1.2);
    setTimeout(() => {
        if (!running) ctx.suspend();
    }, 1400);
    emit();
};

export const toggleSound = () => (running ? stopSound() : startSound());
