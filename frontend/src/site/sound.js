// Calm Japanese ambience, generated live with the Web Audio API (no audio files):
// slow pad chords in the "In" scale, sparse koto-like plucks, a singing bowl now and then,
// and a very soft breeze. Browsers only allow audio after the visitor interacts with the
// page, so it starts on the first click, tap or key press unless they turned it off.
import { storage } from './lib';

const PREF_KEY = 'sp_sound';
const listeners = new Set();
let ctx = null;
let master = null;
let reverbIn = null;
let running = false;
let timers = [];
let beds = [];

// D "In" scale (miyako-bushi): D Eb G A Bb.
const KOTO = [293.66, 311.13, 392.0, 440.0, 466.16, 587.33, 622.25, 783.99];
const CHORDS = [
    [146.83, 220.0, 293.66], // D A D
    [98.0, 146.83, 233.08], // G D Bb
    [155.56, 196.0, 233.08], // Eb G Bb
    [146.83, 196.0, 220.0], // D G A
];

export const soundPref = () => storage.get(PREF_KEY, 'on');
export const isSoundOn = () => running;

const emit = () => listeners.forEach((fn) => fn({ on: running, pref: soundPref() }));
export const subscribeSound = (fn) => {
    listeners.add(fn);
    fn({ on: running, pref: soundPref() });
    return () => listeners.delete(fn);
};

const impulse = (seconds = 5.5, decay = 2.4) => {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
};

const setup = () => {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    const reverb = ctx.createConvolver();
    reverb.buffer = impulse();
    const wet = ctx.createGain();
    wet.gain.value = 0.7;
    reverb.connect(wet).connect(master);
    reverbIn = reverb;
    return true;
};

const send = (node, dry = 0.5) => {
    const d = ctx.createGain();
    d.gain.value = dry;
    node.connect(d).connect(master);
    node.connect(reverbIn);
};

const later = (fn, ms) => {
    const id = setTimeout(() => {
        timers = timers.filter((x) => x !== id);
        if (running) fn();
    }, ms);
    timers.push(id);
};

// A very quiet breeze under everything.
const breeze = () => {
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = last * 3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const amt = ctx.createGain();
    amt.gain.value = 0.03;
    lfo.connect(amt).connect(g.gain);
    src.connect(lp).connect(g);
    send(g, 0.7);
    src.start();
    lfo.start();
    beds.push(src, lfo);
};

// One pad chord that swells in and fades out over ~14 seconds.
let chordIdx = 0;
const pad = () => {
    const notes = CHORDS[chordIdx % CHORDS.length];
    chordIdx++;
    const t = ctx.currentTime;
    const dur = 15;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 5);
    g.gain.setValueAtTime(0.05, t + dur - 6);
    g.gain.linearRampToValueAtTime(0, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    lp.Q.value = 0.3;
    notes.forEach((f) => {
        [-4, 4].forEach((cents) => {
            const o = ctx.createOscillator();
            o.type = 'triangle';
            o.frequency.value = f;
            o.detune.value = cents;
            o.connect(lp);
            o.start(t);
            o.stop(t + dur + 0.1);
        });
    });
    lp.connect(g);
    send(g, 0.45);
    later(pad, (dur - 5) * 1000);
};

const pluck = (freq, vel) => {
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09 * vel, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(freq * 6, t);
    lp.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 1.2);
    [1, 1.002].forEach((detune, i) => {
        const o = ctx.createOscillator();
        o.type = i ? 'sine' : 'triangle';
        o.frequency.setValueAtTime(freq * detune, t);
        // A small bend at the end, like a koto string being pressed.
        o.frequency.linearRampToValueAtTime(freq * detune * 0.996, t + 3);
        o.connect(lp);
        o.start(t);
        o.stop(t + 3.8);
    });
    lp.connect(g);
    send(g, 0.4);
};

let degree = 3;
const melody = () => {
    degree = Math.max(0, Math.min(KOTO.length - 1, degree + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
    pluck(KOTO[degree], 0.5 + Math.random() * 0.4);
    if (Math.random() < 0.2) later(() => pluck(KOTO[Math.max(0, degree - 2)], 0.4), 260);
    // Plenty of silence between phrases keeps it peaceful.
    later(melody, 2400 + Math.random() * 3800 + (Math.random() < 0.25 ? 4000 : 0));
};

const bowl = () => {
    const t = ctx.currentTime;
    [1, 2.76, 5.4].forEach((ratio, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = 146.83 * ratio;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.035 / (i + 1), t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 8 - i);
        o.connect(g);
        send(g, 0.35);
        o.start(t);
        o.stop(t + 8.5);
    });
    later(bowl, 22000 + Math.random() * 16000);
};

export const startSound = async () => {
    if (running || !setup()) return;
    try {
        await ctx.resume();
    } catch {
        return;
    }
    if (ctx.state !== 'running') return;
    running = true;
    if (!beds.length) breeze();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.6, t + 4);
    pad();
    later(melody, 1800);
    later(bowl, 6000);
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

export const toggleSound = () => {
    if (running) {
        storage.set(PREF_KEY, 'off');
        stopSound();
    } else {
        storage.set(PREF_KEY, 'on');
        startSound();
    }
    emit();
};

// Start automatically: right away if the browser allows it, otherwise on the
// visitor's first interaction. Clicking the sound toggle itself is left to the toggle.
let armed = false;
export const armAutoplay = () => {
    if (armed || soundPref() === 'off') return () => {};
    armed = true;
    const GESTURES = ['pointerdown', 'keydown', 'touchend'];
    const disarm = () => {
        armed = false;
        GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    };
    const onGesture = (e) => {
        if (e.target?.closest?.('[data-sound-toggle]')) return disarm();
        if (soundPref() === 'off') return disarm();
        startSound().then(() => running && disarm());
    };
    GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
    // Some browsers already allow audio (for example on a return visit).
    if (navigator.userActivation?.hasBeenActive) startSound().then(() => running && disarm());
    return disarm;
};

// Pause while the tab is hidden.
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (!ctx || !running) return;
        if (document.hidden) ctx.suspend();
        else ctx.resume();
    });
}
