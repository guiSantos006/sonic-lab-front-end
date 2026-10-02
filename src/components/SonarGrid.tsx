"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface SonarGridProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  /** Distance between dots in CSS pixels. */
  spacing?: number;
  /** Dot radius at rest, in CSS pixels. */
  dotRadius?: number;
  /** Resting dot opacity (0–1). Dots on a wavefront go to 1. */
  baseOpacity?: number;
  /** Any CSS color. Defaults to the theme's primary color, so it adapts to light/dark and brand themes. */
  color?: string;
  /** Seconds between ambient pings. Set 0 to disable them. */
  pingEvery?: number;
  /** Wavefront speed in CSS pixels per second. */
  speed?: number;
  /** Thickness of the wavefront in CSS pixels. */
  ringWidth?: number;
  /** How much a dot grows at the wave peak (0 = no growth, 2 = triple size). */
  amplitude?: number;
  /** Emit a ping where the user taps or clicks. */
  interactive?: boolean;
  /** Track user cursor movement and illuminate nearby dots with a trailing decay wake. */
  trackCursor?: boolean;
  /** Radius of influence around the mouse cursor in pixels. */
  cursorRadius?: number;
  /** Trailing decay speed (smaller = longer lingering trail). */
  cursorDecay?: number;
  /** Maximum simultaneous rings. Older rings are dropped first. */
  maxRings?: number;
  /** Start with one ring already mid-expansion so the very first frame shows the idea. */
  seedPing?: boolean;
  /** Where ambient pings (and the seed ping) may spawn, as fractions of width/height: [x0, y0, x1, y1]. */
  pingArea?: [number, number, number, number];
  /** Also trigger rings on global viewport clicks (useful when used as a fixed background). */
  listenWindowClicks?: boolean;
  /** Also track mouse across the entire window viewport (essential for background layers). */
  listenWindowMove?: boolean;
}

interface Ring {
  x: number;
  y: number;
  born: number;
}

const MAX_DPR = 2;
const TAU = Math.PI * 2;

/**
 * SonarGrid — a decorative dot field that answers taps with expanding rings
 * and dynamically reacts to the user's mouse cursor with glowing trails and proximity waves.
 * Canvas-based and theme-aware (it reads the resolved text color), it idles
 * when no ring or cursor is active, pauses off-screen and in hidden tabs, and renders a still grid
 * under `prefers-reduced-motion`. Children render on top of the field.
 */
export function SonarGrid({
  spacing = 24,
  dotRadius = 0.65,
  baseOpacity = 0.12,
  color,
  pingEvery = 2.8,
  speed = 220,
  ringWidth = 55,
  amplitude = 0.8,
  interactive = true,
  trackCursor = true,
  cursorRadius = 90,
  cursorDecay = 0.05,
  maxRings = 6,
  seedPing = true,
  pingArea = [0.15, 0.2, 0.85, 0.8],
  listenWindowClicks = false,
  listenWindowMove = true,
  className,
  children,
  ...rest
}: SonarGridProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ringsRef = React.useRef<Ring[]>([]);
  const refreshRef = React.useRef<() => void>(() => {});
  const mouseRef = React.useRef({ x: -10000, y: -10000, active: false });
  const intensitiesRef = React.useRef<{ array: Float32Array; cols: number; rows: number }>({
    array: new Float32Array(0),
    cols: 0,
    rows: 0,
  });

  // The render loop reads props through this ref so knob changes apply live without restarting it.
  const opts = React.useRef({
    spacing,
    dotRadius,
    baseOpacity,
    pingEvery,
    speed,
    ringWidth,
    amplitude,
    interactive,
    trackCursor,
    cursorRadius,
    cursorDecay,
    maxRings,
    seedPing,
    pingArea,
    listenWindowClicks,
    listenWindowMove,
  });
  opts.current = {
    spacing,
    dotRadius,
    baseOpacity,
    pingEvery,
    speed,
    ringWidth,
    amplitude,
    interactive,
    trackCursor,
    cursorRadius,
    cursorDecay,
    maxRings,
    seedPing,
    pingArea,
    listenWindowClicks,
    listenWindowMove,
  };

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let raf = 0;
    let timer = 0;
    let visible = true;
    let seeded = false;
    let stroke = "";
    let nextPing = performance.now() + opts.current.pingEvery * 1000;

    const readColor = () => {
      if (color) {
        stroke = color;
      } else {
        stroke = getComputedStyle(canvas).color || (document.documentElement.classList.contains("dark") ? "#ffffff" : "#000000");
      }
    };

    const addRing = (x: number, y: number, born: number) => {
      readColor();
      const rings = ringsRef.current;
      rings.push({ x, y, born });
      while (rings.length > opts.current.maxRings) rings.shift();
    };

    let hasActiveCursor = false;

    const draw = (now: number) => {
      const o = opts.current;
      const lifetime = (Math.hypot(width, height) + o.ringWidth) / o.speed; // seconds until a ring leaves the canvas
      ringsRef.current = ringsRef.current.filter((r) => (now - r.born) / 1000 < lifetime);
      const live = ringsRef.current.map((r) => {
        const age = (now - r.born) / 1000;
        const radius = age * o.speed;
        return { x: r.x, y: r.y, radius, reach: radius + o.ringWidth, fade: 1 - age / lifetime };
      });

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = stroke;

      const cols = Math.ceil(width / o.spacing) + 1;
      const rows = Math.ceil(height / o.spacing) + 1;
      const offsetX = (width - (cols - 1) * o.spacing) / 2;
      const offsetY = (height - (rows - 1) * o.spacing) / 2;

      const { x: mouseX, y: mouseY, active: mouseActive } = mouseRef.current;
      const { array: intensities } = intensitiesRef.current;
      const cursorRadius = o.cursorRadius;
      hasActiveCursor = false;

      // Pass 1: every resting dot in a single path and a single fill.
      const hot: number[] = [];
      ctx.globalAlpha = o.baseOpacity;
      ctx.beginPath();

      let idx = 0;
      for (let i = 0; i < cols; i++) {
        const cx = offsetX + i * o.spacing;
        for (let j = 0; j < rows; j++, idx++) {
          const cy = offsetY + j * o.spacing;

          // 1. Ring wave energy
          let ringEnergy = 0;
          for (const r of live) {
            if (Math.abs(cx - r.x) > r.reach || Math.abs(cy - r.y) > r.reach) continue;
            const dist = Math.abs(Math.hypot(cx - r.x, cy - r.y) - r.radius);
            if (dist >= o.ringWidth) continue;
            const t = 1 - dist / o.ringWidth;
            const k = t * t * (3 - 2 * t) * r.fade; // smoothstep, fading with age
            if (k > ringEnergy) ringEnergy = k;
          }

          // 2. Cursor interaction (using PixelCanvas smooth falloff & trailing decay)
          let targetIntensity = 0;
          if (o.trackCursor && mouseActive) {
            const dist = Math.hypot(cx - mouseX, cy - mouseY);
            if (dist < cursorRadius) {
              const falloff = 1 - dist / cursorRadius;
              targetIntensity = Math.pow(falloff, 1.5);
            }
          }

          const prev = intensities[idx] ?? 0;
          const lerpSpeed = targetIntensity > prev ? 0.35 : o.cursorDecay;
          const currentIntensity = prev + (targetIntensity - prev) * lerpSpeed;
          if (intensities.length > idx) {
            intensities[idx] = currentIntensity;
          }

          if (currentIntensity > 0.008) {
            hasActiveCursor = true;
          }

          const totalEnergy = Math.max(ringEnergy, currentIntensity);

          if (totalEnergy < 0.01) {
            ctx.moveTo(cx + o.dotRadius, cy);
            ctx.arc(cx, cy, o.dotRadius, 0, TAU);
          } else {
            hot.push(cx, cy, totalEnergy, currentIntensity);
          }
        }
      }
      ctx.fill();

      // Pass 2: only the dots on a wavefront or cursor wake get their own alpha and radius.
      for (let k = 0; k < hot.length; k += 4) {
        const cx = hot[k] ?? 0;
        const cy = hot[k + 1] ?? 0;
        const energy = hot[k + 2] ?? 0;
        const cursorVal = hot[k + 3] ?? 0;

        // Subtle soft halo for dots directly energized under the cursor
        if (cursorVal > 0.35) {
          ctx.globalAlpha = (cursorVal - 0.35) * 0.22;
          ctx.beginPath();
          ctx.arc(cx, cy, o.dotRadius * (1.8 + cursorVal * 2.2), 0, TAU);
          ctx.fill();
        }

        ctx.globalAlpha = Math.min(1, o.baseOpacity + (1 - o.baseOpacity) * energy);
        ctx.beginPath();
        ctx.arc(cx, cy, o.dotRadius * (1 + o.amplitude * energy), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / opts.current.spacing) + 1;
      const rows = Math.ceil(height / opts.current.spacing) + 1;
      if (intensitiesRef.current.cols !== cols || intensitiesRef.current.rows !== rows) {
        intensitiesRef.current = {
          array: new Float32Array(cols * rows),
          cols,
          rows,
        };
      }

      if (!seeded) {
        seeded = true;
        const [x0, y0, x1, y1] = opts.current.pingArea;
        if (opts.current.seedPing && !reduceMotion.matches)
          addRing(width * (x0 + (x1 - x0) * 0.68), height * (y0 + (y1 - y0) * 0.34), performance.now() - 500);
      }
      draw(performance.now());
    };

    const scheduleIdle = (delay: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => tick(performance.now()), Math.max(16, delay));
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (reduceMotion.matches) {
        ringsRef.current = [];
        draw(now);
        return;
      }
      const o = opts.current;
      if (o.pingEvery > 0 && now >= nextPing) {
        const [x0, y0, x1, y1] = o.pingArea;
        addRing(width * (x0 + Math.random() * (x1 - x0)), height * (y0 + Math.random() * (y1 - y0)), now);
        nextPing = now + o.pingEvery * 1000;
      }
      draw(now);
      if (ringsRef.current.length > 0 || hasActiveCursor || (o.trackCursor && mouseRef.current.active)) {
        raf = requestAnimationFrame(tick);
      } else if (o.pingEvery > 0) {
        scheduleIdle(nextPing - now);
      }
    };

    const wake = () => {
      if (!raf) {
        window.clearTimeout(timer);
        raf = requestAnimationFrame(tick);
      }
    };

    refreshRef.current = () => {
      readColor();
      nextPing = Math.min(nextPing, performance.now() + opts.current.pingEvery * 1000);
      wake();
    };

    let mouseIdleTimer: number | null = null;

    const updateMouse = (clientX: number, clientY: number) => {
      if (!opts.current.trackCursor || reduceMotion.matches) return;
      const rect = host.getBoundingClientRect();
      mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        active: true,
      };
      if (mouseIdleTimer !== null) {
        window.clearTimeout(mouseIdleTimer);
      }
      mouseIdleTimer = window.setTimeout(() => {
        mouseRef.current.active = false;
        wake();
      }, 350);
      wake();
    };

    const onPointerMove = (e: PointerEvent | MouseEvent) => {
      updateMouse(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && e.touches[0]) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseLeave = () => {
      if (mouseIdleTimer !== null) {
        window.clearTimeout(mouseIdleTimer);
      }
      mouseRef.current.active = false;
      wake();
    };

    const onDown = (e: PointerEvent) => {
      if (!opts.current.interactive || reduceMotion.matches) return;
      const rect = host.getBoundingClientRect();
      addRing(e.clientX - rect.left, e.clientY - rect.top, performance.now());
      wake();
    };

    const onWindowDown = (e: PointerEvent) => {
      if (!opts.current.interactive || !opts.current.listenWindowClicks || reduceMotion.matches) return;
      const rect = host.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        addRing(e.clientX - rect.left, e.clientY - rect.top, performance.now());
        wake();
      }
    };

    const onVisibility = () => {
      if (!document.hidden) wake();
    };

    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible) wake();
      },
      { threshold: 0 }
    );
    const mo = new MutationObserver(() => refreshRef.current());

    readColor();
    resize();
    ro.observe(host);
    io.observe(host);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    host.addEventListener("pointerdown", onDown);
    if (opts.current.listenWindowClicks) {
      window.addEventListener("pointerdown", onWindowDown, { passive: true });
    }
    if (opts.current.listenWindowMove) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onMouseLeave);
      document.addEventListener("mouseleave", onMouseLeave);
    } else {
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("touchmove", onTouchMove, { passive: true });
      host.addEventListener("touchend", onMouseLeave);
      host.addEventListener("pointerleave", onMouseLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", wake);
    wake();

    return () => {
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      host.removeEventListener("pointerdown", onDown);
      if (opts.current.listenWindowClicks) {
        window.removeEventListener("pointerdown", onWindowDown);
      }
      if (opts.current.listenWindowMove) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onMouseLeave);
        document.removeEventListener("mouseleave", onMouseLeave);
      } else {
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("touchmove", onTouchMove);
        host.removeEventListener("touchend", onMouseLeave);
        host.removeEventListener("pointerleave", onMouseLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", wake);
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      if (mouseIdleTimer !== null) {
        window.clearTimeout(mouseIdleTimer);
      }
      refreshRef.current = () => {};
    };
  }, [color]);

  // Prop changes while the loop is asleep still repaint immediately.
  React.useEffect(() => {
    refreshRef.current();
  }, [
    spacing,
    dotRadius,
    baseOpacity,
    color,
    pingEvery,
    speed,
    ringWidth,
    amplitude,
    interactive,
    trackCursor,
    cursorRadius,
    cursorDecay,
    maxRings,
    pingArea,
    listenWindowClicks,
    listenWindowMove,
  ]);

  return (
    <div
      ref={hostRef}
      data-slot="sonar-grid"
      className={cn("relative isolate overflow-hidden", className)}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="text-neutral-900 dark:text-neutral-100 pointer-events-none absolute inset-0 -z-10 size-full"
        style={color ? { color } : undefined}
      />
      {children}
    </div>
  );
}

export default SonarGrid;
