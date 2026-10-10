"use client";

import * as THREE from "three";

/* Preloads the five photographs once, shares the textures with the whole
   3D world, and knows each photo's aspect ratio so frames fit perfectly. */

const textures = new Map<string, THREE.Texture>();
const aspects = new Map<string, number>();
const loader = new THREE.TextureLoader();

function onLoad(src: string, texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  textures.set(src, texture);
  const image = texture.image as { width?: number; height?: number } | undefined;
  if (image && image.width && image.height) {
    aspects.set(src, image.width / image.height);
  }
}

export function getPhotoTexture(src: string): THREE.Texture {
  const existing = textures.get(src);
  if (existing) return existing;
  const texture = loader.load(src, (t) => onLoad(src, t));
  onLoad(src, texture);
  return texture;
}

export function getPhotoAspect(src: string): number {
  return aspects.get(src) ?? 0.8;
}

export function preloadPhotos(
  sources: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  let done = 0;
  const total = sources.length;
  return Promise.all(
    sources.map(
      (src) =>
        new Promise<void>((resolve) => {
          const already = textures.get(src);
          if (already) {
            done++;
            onProgress?.(done, total);
            resolve();
            return;
          }
          loader.load(
            src,
            (texture) => {
              onLoad(src, texture);
              done++;
              onProgress?.(done, total);
              resolve();
            },
            undefined,
            () => {
              // a photo failed to load — never block the whole universe
              done++;
              onProgress?.(done, total);
              resolve();
            }
          );
        })
    )
  ).then(() => undefined);
}