"use client";

import * as THREE from "three";

/* The signature glowing heart, built from bézier curves. */

export function createHeartShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(2.5, 2.5);
  shape.bezierCurveTo(2.5, 2.5, 2.0, 0, 0, 0);
  shape.bezierCurveTo(-3.0, 0, -3.0, 3.5, -3.0, 3.5);
  shape.bezierCurveTo(-3.0, 5.5, -1.5, 7.7, 2.5, 9.5);
  shape.bezierCurveTo(6.0, 7.7, 8.0, 5.5, 8.0, 3.5);
  shape.bezierCurveTo(8.0, 3.5, 8.0, 0, 5.0, 0);
  shape.bezierCurveTo(3.5, 0, 2.5, 2.5, 2.5, 2.5);
  return shape;
}

/** A centered heart, point down, roughly 1 unit tall at scale = 1. */
export function createHeartGeometry(depth = 0.42, scale = 0.13): THREE.ExtrudeGeometry {
  const shape = createHeartShape();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: depth * 0.28,
    bevelThickness: depth * 0.22,
    bevelSegments: 3,
    curveSegments: 26,
  });
  geometry.rotateZ(Math.PI);
  geometry.center();
  geometry.scale(scale, scale, scale);
  return geometry;
}

/** A five-pointed star shape, centered. */
export function createStarShape(outer = 1, inner = 0.42, points = 5): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/** A soft teardrop petal shape with its base at the origin. */
export function createPetalShape(length = 1, width = 0.55): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.6, length * 0.12, width * 0.72, length * 0.62, 0, length);
  shape.bezierCurveTo(-width * 0.72, length * 0.62, -width * 0.6, length * 0.12, 0, 0);
  return shape;
}

/** A butterfly wing shape with its base at the origin. */
export function createWingShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.55, 0.1, 0.85, 0.6, 0.42, 1.0);
  shape.bezierCurveTo(0.28, 1.15, 0.1, 1.1, 0.02, 0.9);
  shape.bezierCurveTo(-0.05, 1.18, -0.42, 1.15, -0.5, 0.75);
  shape.bezierCurveTo(-0.56, 0.45, -0.3, 0.12, 0, 0);
  return shape;
}