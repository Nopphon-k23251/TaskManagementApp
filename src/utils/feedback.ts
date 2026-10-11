/**
 * Web Audio & Confetti Feedback Utility for Dopamine Rewards & Productivity Motivation
 */

let sharedAudioCtx: AudioContext | null = null;
let currentAlarmTimer: number | null = null;
let isAlarmLoopRunning = false;

/**
 * Initializes or wakes up the browser Web Audio context on user interaction
 */
export function initAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// Sound effects using Web Audio API (100% offline, zero network requests)
export function playCompletionSound() {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Pleasant two-tone ascending chord (C5 -> G5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

    osc2.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  } catch {
    // Audio might be blocked by browser autoplay policy before user interaction
  }
}

/**
 * Plays a single bright, rich 4-tone melodic chime burst
 */
function playChimeBurst(ctx: AudioContext, baseVolume = 0.35) {
  const now = ctx.currentTime;
  const notes = [
    { freq: 783.99, delay: 0 },       // G5
    { freq: 987.77, delay: 0.12 },    // B5
    { freq: 1318.51, delay: 0.24 },   // E6
    { freq: 1567.98, delay: 0.38 },   // G6 (crisp peak)
  ];

  notes.forEach(({ freq, delay }) => {
    try {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + delay;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      // Subtle octave shimmer for rich resonance
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.5, start);

      gain.gain.setValueAtTime(baseVolume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc2.start(start);
      osc.stop(start + 0.45);
      osc2.stop(start + 0.45);
    } catch {
      // Audio error
    }
  });
}

/**
 * Immediately tests the alarm sound with a single preview burst
 */
export function testAlarmSound() {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    playChimeBurst(ctx, 0.35);
  } catch {
    // ignore
  }
}

/**
 * Starts an insistent, pleasant repeating alarm sequence (e.g. 8 bursts across ~12 seconds)
 * until dismissed by user via stopTimerAlarm()
 */
export function startTimerAlarm(): () => void {
  try {
    stopTimerAlarm();
    const ctx = initAudioContext();
    if (!ctx) return () => {};

    isAlarmLoopRunning = true;
    let burstIndex = 0;
    const maxBursts = 8; // Rings for ~12 seconds unless dismissed

    const runLoop = () => {
      if (!isAlarmLoopRunning) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      playChimeBurst(ctx, 0.38);
      burstIndex++;

      if (burstIndex < maxBursts && isAlarmLoopRunning) {
        currentAlarmTimer = window.setTimeout(runLoop, 1500);
      } else {
        isAlarmLoopRunning = false;
      }
    };

    runLoop();
    return stopTimerAlarm;
  } catch {
    return () => {};
  }
}

/**
 * Stops any active alarm ringtone sequence immediately
 */
export function stopTimerAlarm() {
  isAlarmLoopRunning = false;
  if (currentAlarmTimer) {
    clearTimeout(currentAlarmTimer);
    currentAlarmTimer = null;
  }
}

/**
 * Convenience function to trigger timer finish alarm
 */
export function playTimerFinishSound() {
  startTimerAlarm();
}

/**
 * Lightweight canvas confetti blast to celebrate finishing tasks
 */
export function triggerConfetti() {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (typeof navigator !== 'undefined' && navigator.userAgent?.includes('jsdom')) return;
    const canvas = document.createElement('canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) {
      return;
    }

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ['#06b6d4', '#10b981', '#6366f1', '#f43f5e', '#f59e0b', '#ec4899', '#38bdf8'];
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      alpha: number;
    }[] = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height * 0.45,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        alpha: 1,
      });
    }

    let animationFrameId: number;
    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      if (alive && elapsed < 2000) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
        canvas.remove();
      }
    };

    render();
  } catch {
    // ignore
  }
}
