"use client";

import { Sparkles } from "@react-three/drei";
import { experience } from "@/config/experience";
import { openGalleryPhoto, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";
import { GALLERY_FRAMES } from "@/components/three/stations";
import { PolaroidFrame } from "@/components/three/PolaroidFrame";
import { CloudDisc, DriftingMotes } from "@/components/three/CloudDisc";
import { FloatingHearts } from "@/components/three/FloatingHearts";

/** The memory gallery: five floating polaroids in a dreamy space. */
export function GalleryScene3D() {
  const focus = useExperience((s) => s.galleryFocus);

  return (
    <group>
      <CloudDisc radius={6.4} y={-2.6} opacity={0.32} />
      <DriftingMotes count={50} radius={7} />
      <FloatingHearts count={16} area={[13, 7, 6]} center={[0, 0.4, -1]} />

      {experience.photos.map((photo, i) => (
        <PolaroidFrame
          key={photo.src}
          photo={photo}
          index={i}
          position={GALLERY_FRAMES[i].pos}
          rotation={GALLERY_FRAMES[i].rot}
          focused={focus === i}
          onClick={() => {
            openGalleryPhoto(i);
            audio.playSfx("chime");
          }}
        />
      ))}

      {focus !== null && (
        <group position={GALLERY_FRAMES[focus].pos}>
          <Sparkles
            key={`s${focus}`}
            count={34}
            scale={[2.6, 2.6, 1.6]}
            position={[0, 0.1, 0.4]}
            size={3}
            speed={0.35}
            color="#f5b8cf"
          />
        </group>
      )}
    </group>
  );
}