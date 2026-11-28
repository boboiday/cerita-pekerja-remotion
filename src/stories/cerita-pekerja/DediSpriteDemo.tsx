import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../../kit/style";
import { DediSprite, type DediSpriteLeg, type DediSpriteMood } from "../../kit/DediSpriteRig";

/**
 * DediSpriteDemo — demo 10 detik rig sprite Dedi (300 frame @ 30fps).
 * Sama dengan DediRigDemo: jalan masuk, berhenti senyum, melambai,
 * jempol + tegas, pegang helm (hero pose) — hanya transform.
 * Bedanya: semua bagian adalah crop sheet modular ASLI (bukan gambar ulang).
 *
 * DRAFT PREVIEW — bukan episode tayang, belum dipakai episode mana pun.
 */

export const DEDI_SPRITE_DEMO_TOTAL = 300;

const ramp = (f: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (f - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const Demo: React.FC = () => {
  const f = useCurrentFrame();

  const walk = f < 90 ? 1 : 0;
  const x = interpolate(f, [0, 90], [-260, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- jalan 0..90 ---
  const phase = f * 0.35;
  const swing = Math.sin(phase);
  const hipL = 16 * swing * walk;
  const hipR = -16 * swing * walk;
  // Kaki yang terangkat pakai kaki bengkok (lutut tertekuk).
  const legL: DediSpriteLeg = swing > 0 ? "bent" : "straightL";
  const legR: DediSpriteLeg = swing > 0 ? "straightR" : "bent";
  const shoulderLWalk = -10 * swing * walk;
  const shoulderRWalk = 10 * swing * walk;
  const bounce = walk ? -5 * Math.abs(Math.sin(phase)) : 0;

  // --- fase-fase ---
  const wave = ramp(f, 120, 135) * (1 - ramp(f, 170, 185));
  const thumb = ramp(f, 180, 195) * (1 - ramp(f, 230, 245));
  const helm = ramp(f, 240, 255);

  const mood: DediSpriteMood =
    f < 90 ? "normal" : f < 180 ? "happy" : f < 240 ? "angry" : "normal";

  const shoulderR =
    shoulderRWalk * (1 - wave) * (1 - thumb) * (1 - helm)
    + -150 * wave
    + -120 * thumb * (1 - wave)
    + 35 * helm;
  const armR = wave > 0.5 ? "straight" : thumb > 0.5 ? "bent1" : helm > 0.5 ? "bent2" : "straight";
  const handR = wave > 0.5 ? "palm" : thumb > 0.5 ? "thumb" : "fist";
  const wristR = 12 * Math.sin(f * 0.5) * wave;

  // Hero: tangan kiri pegang helm di sisi badan, tangan kanan di pinggang.
  const shoulderL = shoulderLWalk * (1 - helm) + 15 * helm;
  const armL = helm > 0.5 ? "bent3" : "straight";

  // --- angguk 240..300 ---
  const nod = f >= 240 ? 3 * Math.sin(((f - 240) / 12) * Math.PI) : 0;

  const label =
    f < 90
      ? "JALAN MASUK · pinggul + lutut mengayun"
      : f < 120
        ? "BERHENTI · SENYUM"
        : f < 180
          ? "MELAMBAI · bahu + pergelangan"
          : f < 240
            ? "JEMPOL + EKSPRESI TEGAS"
            : "PEGANG HELM · HERO POSE";

  return (
    <AbsoluteFill style={{ background: "#fbf6e9" }}>
      {/* lantai */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, height: 420, background: "#f1e8d2" }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 1498, height: 4, background: "#d8cdb2" }} />
      {/* judul */}
      <div style={{ position: "absolute", top: 36, right: 40, fontFamily: FONT.mono, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: "white", background: "#c0241c", padding: "10px 18px", borderRadius: 999 }}>
        DRAFT PREVIEW
      </div>
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", fontFamily: FONT.title, fontSize: 96, color: C.ink }}>
        DEDI SANTOSO
      </div>
      <div style={{ position: "absolute", top: 232, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: "#6b675f" }}>
        OPERATOR PABRIK GARMEN · BEKASI
      </div>
      {/* rig */}
      <DediSprite
        x={x}
        floor={1500}
        mood={mood}
        armL={armL}
        armR={armR}
        shoulderL={shoulderL}
        shoulderR={shoulderR}
        handL="fist"
        handR={handR}
        wristR={wristR}
        legL={legL}
        legR={legR}
        hipL={hipL}
        hipR={hipR}
        heldL={helm > 0.5 ? "helm" : "none"}
        headTilt={nod + 3 * helm}
        bounce={bounce}
      />
      {/* label fase */}
      <div style={{ position: "absolute", top: 1620, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: C.ink }}>
        {label}
      </div>
      <div style={{ position: "absolute", top: 1700, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: "#6b675f" }}>
        RIG SPRITE · ASET MODULAR ASLI
      </div>
    </AbsoluteFill>
  );
};

export const DediSpriteDemo: React.FC = () => <Demo />;
