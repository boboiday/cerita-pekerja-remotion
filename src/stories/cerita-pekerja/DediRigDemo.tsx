import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DediRig, type DediHand, type DediHeld, type DediMood } from "../../kit/DediRig";
import { C, FONT } from "../../kit/style";

/**
 * DediRigDemo v2 — DRAFT PREVIEW demo gerak rig vektor Dedi (ditracing dari
 * sheet modular BARU dedi-modular-breakdown.jpg).
 *
 * BUKAN episode tayang dan BELUM dipakai episode mana pun. Bukti rig bekerja:
 *  0–90   jalan masuk (kaki mengayun di pinggul + lutut, lengan mengayun)
 *  90–120 berhenti + senyum
 *  120–180 melambai (bahu + siku + pergelangan tangan)
 *  180–240 jempol + ekspresi senyum -> tegas
 *  240–300 pegang helm (hero pose) + angguk kecil
 *
 * 30 fps, 300 frame (10 detik). Stills via workflow Stills
 * (scripts/stills.json -> "DediRigDemo").
 */

export const DEDI_RIG_DEMO_TOTAL = 300;

const Demo: React.FC = () => {
  const f = useCurrentFrame();

  // --- jalan masuk 0..90 ---
  const walk = 1 - interpolate(f, [88, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phase = (f / 9) * Math.PI; // periode langkah 18 frame
  const hipL = 16 * Math.sin(phase) * walk;
  const hipR = 16 * Math.sin(phase + Math.PI) * walk;
  const kneeL = 22 * Math.max(0, Math.sin(phase)) * walk;
  const kneeR = 22 * Math.max(0, Math.sin(phase + Math.PI)) * walk;
  const shoulderLWalk = 10 * Math.sin(phase + Math.PI) * walk;
  const shoulderRWalk = 10 * Math.sin(phase) * walk;
  const bounce = -6 * Math.abs(Math.sin(phase)) * walk;
  const x = interpolate(f, [0, 90], [-260, 540], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // --- melambai 120..180 ---
  const wave = interpolate(f, [120, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    * (1 - interpolate(f, [165, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const waveWrist = 18 * Math.sin(((f - 120) / 5) * Math.PI) * wave;

  // --- jempol + tegas 180..240 ---
  const thumb = interpolate(f, [180, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mood: DediMood = f < 100 ? "neutral" : f < 195 ? "smile" : "determined";

  // --- pegang helm 240..300 (jempol memudar saat helm masuk) ---
  const helm = interpolate(f, [240, 255], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const thumbActive = thumb * (1 - helm);
  const handR: DediHand = wave > 0.5 ? "telapak" : thumbActive > 0.5 ? "jempol" : "kepal";
  const heldL: DediHeld = helm > 0.5 ? "helm" : "none";
  const handL: DediHand = helm > 0.5 ? "kepal" : "telapak";

  // --- angguk 240..300 ---
  const nod = f >= 240 ? 3 * Math.sin(((f - 240) / 12) * Math.PI) : 0;

  const shoulderR =
    shoulderRWalk * (1 - wave) * (1 - thumbActive)
    + -150 * wave
    + -72 * thumbActive * (1 - wave);
  const elbowR =
    8 * walk * (1 - wave) * (1 - thumbActive)
    + -25 * wave
    + -18 * thumbActive * (1 - wave);

  const shoulderL = shoulderLWalk * (1 - helm) + 20 * helm;
  const elbowL = 8 * walk * (1 - helm) + 30 * helm;

  const label =
    f < 90
      ? "JALAN MASUK · pinggul + lutut mengayun"
      : f < 120
        ? "BERHENTI · SENYUM"
        : f < 180
          ? "MELAMBAI · bahu + siku + pergelangan"
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
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <DediRig
          x={x}
          floor={1500}
          scale={1.35}
          mood={mood}
          handL={handL}
          handR={handR}
          heldL={heldL}
          shoulderL={shoulderL}
          shoulderR={shoulderR}
          elbowL={elbowL}
          elbowR={elbowR}
          wristR={waveWrist}
          hipL={hipL}
          hipR={hipR}
          kneeL={kneeL}
          kneeR={kneeR}
          headTilt={nod}
          bounce={bounce}
        />
      </svg>
      {/* label fase */}
      <div style={{ position: "absolute", top: 1620, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: C.ink }}>
        {label}
      </div>
      <div style={{ position: "absolute", top: 1700, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: "#6b675f" }}>
        RIG VEKTOR DITRACING · SHEET MODULAR BARU
      </div>
    </AbsoluteFill>
  );
};

export const DediRigDemo: React.FC = () => <Demo />;
