import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../../kit/style";
import { DediSprite, type DediSpriteLeg, type DediSpriteMood } from "../../kit/DediSpriteRig";

/**
 * DediSpriteDemo v3 — MOTION NATURAL (bukan gambar ulang, bukan ubah sprite).
 * Shot sama seperti v2.1 (jalan masuk, berhenti senyum, melambai, jempol + tegas,
 * pegang helm hero — total 300 frame @ 30fps), yang berubah hanya CARA geraknya:
 *
 * - Easing di SEMUA transisi (easeInOutCubic / easeOutCubic / easeOutBack) —
 *   tidak ada lagi gerakan linear (dulu: x jalan linear, berhenti mendadak).
 * - Antisipasi sebelum gerakan besar (lengan sedikit ke belakang sebelum
 *   melambai/jempol, jongkok sedikit sebelum angkat helm).
 * - Overshoot + settle saat angkat lengan/helm (easeOutBack) dan saat berhenti
 *   jalan (skid teredam).
 * - Secondary motion: hip bob 2x per langkah, lengan berayun berlawanan kaki,
 *   dasi tertinggal (lag), badan condong ke depan saat jalan, berat badan
 *   berpindah kiri-kanan, napas halus saat diam (bounce + kepala).
 * - Melambai: ayunan mengecil (decay) + pergelangan counter-phase = lintasan
 *   melengkung, bukan ayunan kaku.
 * - Pergantian sprite lengan/kaki/tangan/helm dijadwalkan di tengah gerakan
 *   cepat (bukan saat diam) supaya swap tidak terlihat popping.
 *
 * DRAFT PREVIEW — bukan episode tayang, belum dipakai episode mana pun.
 */

export const DEDI_SPRITE_DEMO_TOTAL = 300;

// ---- easing helpers (semua transisi pakai ini) ----
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeInOutCubic = (t: number) => {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
// overshoot ringan (~7% dengan c1=1.2) lalu settle — untuk angkat lengan & helm
const easeOutBack = (t: number, c1 = 1.2) => {
  const u = clamp01(t);
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};
// osilasi teredam: 0 sebelum start, lalu amp * exp(-decay) * sin
const wob = (f: number, start: number, amp: number, freq: number, decay: number) =>
  f < start ? 0 : amp * Math.exp(-(f - start) * decay) * Math.sin((f - start) * freq);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

const Demo: React.FC = () => {
  const f = useCurrentFrame();

  // ============ SHOT 1 — JALAN MASUK (0..90) + berhenti/settle (90..105) ============
  // Posisi x mengikuti easeInOutCubic: akselerasi di awal, deselerasi di akhir
  // (dulu linear → berhenti mendadak). Fase langkah mengikuti JARAK, bukan frame,
  // supaya kaki tidak selip; total 5 siklus penuh → swing = 0 persis saat berhenti.
  const walkProg = easeInOutCubic(f / 90);
  const walkAmp = seg(f, 0, 10) * (1 - seg(f, 86, 98));
  const walkAmpLag = seg(f - 5, 0, 10) * (1 - seg(f - 5, 86, 98)); // kepala tertinggal 5 frame
  const phase = walkProg * 10 * Math.PI;
  const swing = Math.sin(phase);
  const xBase = -260 + 800 * walkProg;
  const xSettle = wob(f, 90, 10, 0.55, 0.11); // skid kecil ke depan lalu kembali
  const xWobble = 3 * swing * walkAmp; // berat badan pindah kiri-kanan tiap langkah
  const x = xBase + xSettle + xWobble;
  const hipL = 16 * swing * walkAmp;
  const hipR = -16 * swing * walkAmp;
  // Ganti sprite kaki hanya saat kaki lewat di bawah badan (swing ≈ 0) — paling
  // tidak terlihat; paksa lurus saat amplitudo jalan sudah kecil.
  const legL: DediSpriteLeg = walkAmp > 0.35 && swing > 0 ? "bent" : "straightL";
  const legR: DediSpriteLeg = walkAmp > 0.35 && swing <= 0 ? "bent" : "straightR";
  const shoulderLWalk = -10 * swing * walkAmp;
  const shoulderRWalk = 10 * swing * walkAmp;
  const lean = 5 * walkAmp; // condong ke depan saat jalan
  const headWalk = 3 * walkAmpLag; // kepala mengikuti badan dengan lag
  const bobWalk = -4.5 * Math.abs(Math.sin(phase)) * walkAmp; // hip bob 2x/langkah
  const settleDip = wob(f, 90, 2.2, 0.9, 0.14); // badan sedikit turun lalu naik
  const tieWalk =
    -10 * Math.sin(phase - 0.9) * walkAmp + wob(f, 90, -8, 0.7, 0.08); // dasi tertinggal

  // ============ NAPAS (idle — fade in setelah berhenti, jalan terus di sela gerakan) ====
  const breathAmp = seg(f, 95, 115);
  const breath = -1.1 * Math.sin((f * 2 * Math.PI) / 60) * breathAmp; // periode 2 detik
  const breathHead = 0.8 * Math.sin((f * 2 * Math.PI) / 60 + 0.6) * breathAmp;
  const bounce = bobWalk + settleDip + breath;

  // ============ SHOT 3 — MELAMBAI (antisipasi 112..120, angkat 120..138,
  //            ayunan 138..170, turun 170..185) ============
  const wAnt = easeInOutCubic(seg(f, 112, 120)); // lengan sedikit ke belakang dulu
  const wRaise = easeOutBack(seg(f, 120, 138)); // angkat + overshoot + settle
  const wLower = easeInOutCubic(seg(f, 170, 185));
  const waveAngle =
    wRaise <= 0
      ? 7 * wAnt
      : lerp(lerp(7, -152, wRaise), 0, wLower) +
        (f >= 138 ? 14 * (1 - seg(f, 138, 170)) * Math.sin((f - 138) * 0.45) : 0);
  // Pergelangan counter-phase + fade-in, supaya lambaian melengkung (arc),
  // amplitudo mengecil 2–3 ayunan.
  const wristWave =
    f >= 138
      ? 22 * (1 - seg(f, 138, 170)) * seg(f, 138, 146) * Math.sin((f - 138) * 0.45 - 0.9)
      : 0;
  const waveActive = wRaise > 0.5 && wLower < 0.5;

  // ============ SHOT 4 — JEMPOL + TEGAS (antisipasi 174..182, angkat 180..198,
  //            tahan 198..225, turun 225..240) ============
  const tAnt = easeInOutCubic(seg(f, 174, 182));
  const tRaise = easeOutBack(seg(f, 180, 198));
  const tLower = easeInOutCubic(seg(f, 225, 240));
  const thumbAngle = tRaise <= 0 ? 6 * tAnt : lerp(lerp(6, -122, tRaise), 0, tLower);
  // Ganti sprite lengan/tangan di tengah gerakan cepat (bukan saat diam).
  const thumbActive = tRaise > 0.4 && tLower < 0.5;
  const handThumb = tRaise > 0.5 && tLower < 0.5;
  const headThumb = 4 * tRaise * (1 - tLower); // kepala sedikit miring mengikuti

  // ============ SHOT 5 — PEGANG HELM / HERO (antisipasi 232..240, angkat 240..260,
  //            settle 260..270, angguk 268..290) ============
  const hAnt = easeInOutCubic(seg(f, 232, 240)); // jongkok sedikit sebelum angkat
  const hRaise = easeOutBack(seg(f, 240, 260));
  const hSway = wob(f, 260, 2.5, 0.6, 0.08); // ayunan kecil saat sampai di pose
  const helmAngle = hRaise <= 0 ? 5 * hAnt : lerp(5, 16, hRaise) + hSway;
  const shoulderL =
    shoulderLWalk * (1 - seg(f, 232, 244)) + helmAngle * seg(f, 232, 240);
  const armL = hRaise > 0.45 ? "bent3" : "straight"; // swap di tengah angkatan
  const heldL = hRaise > 0.5 ? "helm" : "none"; // helm muncul saat tangan bergerak
  const crouch = 2.5 * hAnt * (1 - hRaise); // jongkok terdalam tepat sebelum angkat
  const headHero = 3 * hRaise; // kepala tegak bangga mengikuti angkatan
  const nodBump = (a: number, b: number, amp: number) =>
    f >= a && f <= b ? amp * Math.sin(((f - a) / (b - a)) * Math.PI) : 0;
  const nod = nodBump(268, 278, 4) + nodBump(280, 290, 3); // dua anggukan lembut

  // ============ gabungan ============
  const shoulderR = shoulderRWalk + waveAngle + thumbAngle;
  const armR = thumbActive ? "bent1" : "straight";
  const handR = waveActive ? "palm" : handThumb ? "thumb" : "fist";
  const wristR = wristWave + 8 * tRaise * (1 - tLower);
  const headTilt = headWalk + breathHead + headThumb + headHero + nod;
  const bounceTotal = bounce + crouch;
  const tieSwing = tieWalk;

  const mood: DediSpriteMood =
    f < 95 ? "normal" : f < 188 ? "happy" : f < 250 ? "angry" : "normal";

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
        heldL={heldL}
        headTilt={headTilt}
        bounce={bounceTotal}
        lean={lean}
        tieSwing={tieSwing}
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
