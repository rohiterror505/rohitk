"use client";

import * as THREE from "three";

/* Tiny canvas-painted sprite textures: soft glows, little hearts,
   sparkles. Generated once, cached forever. */

const cache = new Map<string, THREE.CanvasTexture>();

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function make(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

function finish(canvas: HTMLCanvasElement, key: string): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}

export function radialGlowTexture(color = "#ffffff", size = 128): THREE.CanvasTexture {
  const key = `glow:${color}:${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [canvas, ctx] = make(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, hexToRgba(color, 1));
  g.addColorStop(0.25, hexToRgba(color, 0.55));
  g.addColorStop(0.6, hexToRgba(color, 0.12));
  g.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return finish(canvas, key);
}

export function heartSpriteTexture(color = "#f5b8cf", size = 96): THREE.CanvasTexture {
  const key = `heart:${color}:${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [canvas, ctx] = make(size);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.16;
  const w = size;
  ctx.beginPath();
  const cx = w / 2;
  ctx.moveTo(cx, w * 0.78);
  ctx.bezierCurveTo(w * 0.02, w * 0.55, w * 0.1, w * 0.14, cx, w * 0.34);
  ctx.bezierCurveTo(w * 0.9, w * 0.14, w * 0.98, w * 0.55, cx, w * 0.78);
  ctx.fill();
  // soften edges into a glow
  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createRadialGradient(cx, w * 0.5, 0, cx, w * 0.5, w / 2);
  mask.addColorStop(0, "rgba(255,255,255,1)");
  mask.addColorStop(0.72, "rgba(255,255,255,0.9)");
  mask.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, size, size);
  return finish(canvas, key);
}

export function sparkleTexture(color = "#fff6e8", size = 96): THREE.CanvasTexture {
  const key = `sparkle:${color}:${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [canvas, ctx] = make(size);
  const c = size / 2;
  const flare = ctx.createRadialGradient(c, c, 0, c, c, c);
  flare.addColorStop(0, hexToRgba(color, 1));
  flare.addColorStop(0.18, hexToRgba(color, 0.35));
  flare.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = flare;
  ctx.fillRect(0, 0, size, size);
  // four-point star
  ctx.strokeStyle = hexToRgba(color, 0.9);
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.lineWidth = size * 0.035;
  ctx.beginPath();
  ctx.moveTo(c, size * 0.06);
  ctx.lineTo(c, size * 0.94);
  ctx.moveTo(size * 0.06, c);
  ctx.lineTo(size * 0.94, c);
  ctx.stroke();
  return finish(canvas, key);
}

export function cloudTexture(size = 256): THREE.CanvasTexture {
  const key = `cloud:${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [canvas, ctx] = make(size);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, "rgba(247,239,226,0.85)");
  g.addColorStop(0.5, "rgba(201,167,235,0.28)");
  g.addColorStop(1, "rgba(201,167,235,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // a few soft puffs
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const px = c + Math.cos(angle) * size * 0.24;
    const py = c + Math.sin(angle) * size * 0.24;
    const r = size * (0.1 + Math.random() * 0.08);
    const puff = ctx.createRadialGradient(px, py, 0, px, py, r);
    puff.addColorStop(0, "rgba(247,239,226,0.32)");
    puff.addColorStop(1, "rgba(247,239,226,0)");
    ctx.fillStyle = puff;
    ctx.fillRect(0, 0, size, size);
  }
  return finish(canvas, key);
}