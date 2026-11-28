import React from "react";
import { staticFile } from "remotion";

/**
 * DediSpriteRig — rig puppet Dedi dari crop sheet modular ASLI.
 *
 * TIDAK ada gambar baru di sini: semua bagian adalah crop langsung dari
 * `dedi-modular-breakdown.jpg` (file Avenir), background dihapus flood-fill.
 * Yang diatur hanya transform: posisi / rotasi / skala / opacity.
 *
 * Ruang koordinat figure (sheet px, dari turnaround-front):
 *   lebar 138, tinggi 332, lantai y=328, tengah x=69.
 *   kepala: rambut y~4, dagu y~104, leher y~112.
 *   rompi: y 98..214 (top diselaraskan ke garis merah rompi).
 *   bahu: (24,128) kiri / (114,128) kanan. pinggul: (56,216) / (82,216).
 *   Lengan/kaki diskala ke panjang figure (bukan ke skala detail sheet),
 *   karena panel modular digambar lebih besar dari figure turnaround.
 *
 * DRAFT PREVIEW — bukan episode tayang, belum dipakai episode mana pun.
 */

const FIG_CX = 69;
const FIG_FLOOR = 328;

export type DediSpriteMood = "normal" | "happy" | "angry" | "worried" | "sad" | "surprised";
export type DediSpriteHand = "palm" | "fist" | "point" | "thumb";
export type DediSpriteArm = "straight" | "bent1" | "bent2" | "bent3";
export type DediSpriteLeg = "straightL" | "straightR" | "bent";

type PartProps = {
  src: string;
  cropW: number;
  cropH: number;
  scaleX: number;
  scaleY: number;
  /** pivot dalam crop px — titik yang menempel di anchor */
  pivotCropX: number;
  pivotCropY: number;
  /** posisi pivot dalam koordinat figure */
  anchorX: number;
  anchorY: number;
  rot?: number;
  flip?: boolean;
  opacity?: number;
  x: number;
  floor: number;
  S: number;
};

const Part: React.FC<PartProps> = ({
  src, cropW, cropH, scaleX, scaleY,
  pivotCropX, pivotCropY, anchorX, anchorY,
  rot = 0, flip = false, opacity = 1, x, floor, S,
}) => {
  const w = cropW * scaleX * S;
  const h = cropH * scaleY * S;
  const px = pivotCropX * scaleX * S;
  const py = pivotCropY * scaleY * S;
  const ax = x + (anchorX - FIG_CX) * S;
  const ay = floor + (anchorY - FIG_FLOOR) * S;
  return (
    <div
      style={{
        position: "absolute",
        left: ax - px,
        top: ay - py,
        width: w,
        height: h,
        transform: `rotate(${rot}deg)${flip ? " scaleX(-1)" : ""}`,
        transformOrigin: `${px}px ${py}px`,
        opacity,
      }}
    >
      <img src={src} style={{ width: "100%", height: "100%", display: "block" }} draggable={false} />
    </div>
  );
};

/** Rotasi vektor (x,y) sebesar deg derajat (koordinat layar, y ke bawah). */
const rotVec = (vx: number, vy: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: vx * c - vy * s, y: vx * s + vy * c };
};

/** Bola sendi diukur dari crop (centroid piksel opaque 30 baris atas/bawah). */
const ARMS: Record<DediSpriteArm, { file: string; cropW: number; cropH: number; top: [number, number]; bot: [number, number]; scale: number }> = {
  straight: { file: "arm-4.png", cropW: 33, cropH: 112, top: [15.1, 16.2], bot: [16.6, 94.7], scale: 0.95 },
  bent1: { file: "arm-1.png", cropW: 49, cropH: 109, top: [30.4, 16.7], bot: [31.5, 91.4], scale: 0.95 },
  bent2: { file: "arm-2.png", cropW: 47, cropH: 109, top: [30.3, 16.7], bot: [29.7, 91.6], scale: 0.95 },
  bent3: { file: "arm-3.png", cropW: 42, cropH: 109, top: [24.2, 16.4], bot: [24.8, 91.4], scale: 0.95 },
};

const LEGS: Record<DediSpriteLeg, { file: string; cropW: number; cropH: number; hip: [number, number]; scale: number }> = {
  straightL: { file: "leg-1.png", cropW: 73, cropH: 205, hip: [54.5, 16.5], scale: 0.59 },
  straightR: { file: "leg-4.png", cropW: 76, cropH: 205, hip: [17.0, 16.5], scale: 0.59 },
  bent: { file: "leg-3.png", cropW: 92, cropH: 188, hip: [62.3, 16.6], scale: 0.59 },
};

const FACES: Record<DediSpriteMood, { file: string; cropW: number; cropH: number }> = {
  normal: { file: "face-normal.png", cropW: 142, cropH: 148 },
  happy: { file: "face-happy.png", cropW: 139, cropH: 149 },
  angry: { file: "face-angry.png", cropW: 141, cropH: 148 },
  worried: { file: "face-worried.png", cropW: 140, cropH: 152 },
  sad: { file: "face-sad.png", cropW: 138, cropH: 148 },
  surprised: { file: "face-surprised.png", cropW: 129, cropH: 149 },
};

const HANDS: Record<DediSpriteHand, { file: string; cropW: number; cropH: number; scale: number }> = {
  palm: { file: "hand-palm.png", cropW: 64, cropH: 58, scale: 0.22 },
  fist: { file: "hand-fist.png", cropW: 49, cropH: 51, scale: 0.29 },
  point: { file: "hand-point.png", cropW: 50, cropH: 54, scale: 0.28 },
  thumb: { file: "hand-thumb-a.png", cropW: 44, cropH: 56, scale: 0.32 },
};

export type DediSpriteProps = {
  x: number;
  floor: number;
  /** screen px per figure px — 2.26 ≈ figure 750px di kanvas 1080x1920 */
  S?: number;
  mood?: DediSpriteMood;
  armL?: DediSpriteArm;
  armR?: DediSpriteArm;
  /** rotasi bahu, derajat CSS (positif = searah jarum jam, 0 = lengan menggantung) */
  shoulderL?: number;
  shoulderR?: number;
  handL?: DediSpriteHand;
  handR?: DediSpriteHand;
  /** rotasi tambahan pergelangan tangan */
  wristL?: number;
  wristR?: number;
  legL?: DediSpriteLeg;
  legR?: DediSpriteLeg;
  /** rotasi pinggul, derajat CSS (0 = kaki lurus ke bawah) */
  hipL?: number;
  hipR?: number;
  heldL?: "none" | "helm";
  /** angguk kepala, derajat (pivot leher) */
  headTilt?: number;
  /** pantulan jalan, figure px (negatif = naik) */
  bounce?: number;
};

export const DediSprite: React.FC<DediSpriteProps> = ({
  x,
  floor,
  S = 2.26,
  mood = "normal",
  armL = "straight",
  armR = "straight",
  shoulderL = 0,
  shoulderR = 0,
  handL = "fist",
  handR = "fist",
  wristL = 0,
  wristR = 0,
  legL = "straightL",
  legR = "straightR",
  hipL = 0,
  hipR = 0,
  heldL = "none",
  headTilt = 0,
  bounce = 0,
}) => {
  const floorEff = floor + bounce * S;
  const base = { x, floor: floorEff, S };

  const face = FACES[mood];
  const armSpecL = ARMS[armL];
  const armSpecR = ARMS[armR];
  const legSpecL = LEGS[legL];
  const legSpecR = LEGS[legR];
  const handSpecL = HANDS[handL];
  const handSpecR = HANDS[handR];

  // Posisi pergelangan = pivot bahu + vektor (bola bawah - bola atas) yang dirotasi.
  const wristOffL = {
    x: (armSpecL.bot[0] - armSpecL.top[0]) * armSpecL.scale,
    y: (armSpecL.bot[1] - armSpecL.top[1]) * armSpecL.scale,
  };
  const wristOffR = {
    x: (armSpecR.bot[0] - armSpecR.top[0]) * armSpecR.scale,
    y: (armSpecR.bot[1] - armSpecR.top[1]) * armSpecR.scale,
  };
  const wL = rotVec(wristOffL.x, wristOffL.y, shoulderL);
  const wR = rotVec(wristOffR.x, wristOffR.y, shoulderR);
  const wristLFig = { x: 24 + wL.x, y: 128 + wL.y };
  const wristRFig = { x: 114 + wR.x, y: 128 + wR.y };

  // Lengan bengkok: siku mengarah ke kiri di crop — di lengan kanan dibalik.
  const flipArmR = armR !== "straight";
  // Kaki bengkok: sepatu tertinggal ke kiri di crop — di kaki kanan dibalik.
  const flipLegR = legR === "bent";

  return (
    <>
      {/* kaki (di belakang rompi) */}
      <Part {...base} src={staticFile(`dedi-sprite/${legSpecL.file}`)}
        cropW={legSpecL.cropW} cropH={legSpecL.cropH} scaleX={legSpecL.scale} scaleY={legSpecL.scale}
        pivotCropX={legSpecL.hip[0]} pivotCropY={legSpecL.hip[1]} anchorX={56} anchorY={216} rot={hipL} />
      <Part {...base} src={staticFile(`dedi-sprite/${legSpecR.file}`)}
        cropW={legSpecR.cropW} cropH={legSpecR.cropH} scaleX={legSpecR.scale} scaleY={legSpecR.scale}
        pivotCropX={legSpecR.hip[0]} pivotCropY={legSpecR.hip[1]} anchorX={82} anchorY={216} rot={hipR} flip={flipLegR} />
      {/* rompi + dasi */}
      <Part {...base} src={staticFile("dedi-sprite/vest-front.png")}
        cropW={93} cropH={147} scaleX={1.01} scaleY={0.79}
        pivotCropX={46.5} pivotCropY={0} anchorX={69} anchorY={98} />
      <Part {...base} src={staticFile("dedi-sprite/tie-blade.png")}
        cropW={44} cropH={120} scaleX={0.4} scaleY={0.4}
        pivotCropX={22} pivotCropY={0} anchorX={69} anchorY={120} />
      {/* kepala (di atas rompi, kerah menutup sambungan leher) */}
      <Part {...base} src={staticFile(`dedi-sprite/${face.file}`)}
        cropW={face.cropW} cropH={face.cropH} scaleX={0.8} scaleY={0.8}
        pivotCropX={face.cropW / 2} pivotCropY={135} anchorX={69} anchorY={112} rot={headTilt} />
      {/* lengan */}
      <Part {...base} src={staticFile(`dedi-sprite/${armSpecL.file}`)}
        cropW={armSpecL.cropW} cropH={armSpecL.cropH} scaleX={armSpecL.scale} scaleY={armSpecL.scale}
        pivotCropX={armSpecL.top[0]} pivotCropY={armSpecL.top[1]} anchorX={24} anchorY={128} rot={shoulderL} />
      <Part {...base} src={staticFile(`dedi-sprite/${armSpecR.file}`)}
        cropW={armSpecR.cropW} cropH={armSpecR.cropH} scaleX={armSpecR.scale} scaleY={armSpecR.scale}
        pivotCropX={armSpecR.top[0]} pivotCropY={armSpecR.top[1]} anchorX={114} anchorY={128} rot={shoulderR} flip={flipArmR} />
      {/* tangan (di pergelangan) */}
      <Part {...base} src={staticFile(`dedi-sprite/${handSpecL.file}`)}
        cropW={handSpecL.cropW} cropH={handSpecL.cropH} scaleX={handSpecL.scale} scaleY={handSpecL.scale}
        pivotCropX={handSpecL.cropW / 2} pivotCropY={handSpecL.cropH / 2}
        anchorX={wristLFig.x} anchorY={wristLFig.y} rot={shoulderL + wristL} />
      <Part {...base} src={staticFile(`dedi-sprite/${handSpecR.file}`)}
        cropW={handSpecR.cropW} cropH={handSpecR.cropH} scaleX={handSpecR.scale} scaleY={handSpecR.scale}
        pivotCropX={handSpecR.cropW / 2} pivotCropY={handSpecR.cropH / 2}
        anchorX={wristRFig.x} anchorY={wristRFig.y} rot={shoulderR + wristR} />
      {/* helm di tangan kiri (hero pose) */}
      {heldL === "helm" && (
        <Part {...base} src={staticFile("dedi-sprite/helmet.png")}
          cropW={147} cropH={105} scaleX={0.4} scaleY={0.4}
          pivotCropX={73.5} pivotCropY={52.5}
          anchorX={wristLFig.x + 8} anchorY={wristLFig.y + 12} rot={-15} />
      )}
    </>
  );
};
