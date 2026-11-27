import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, OfficeBg, SkylineFar, SkylineNear } from "../../kit/Backgrounds";

/**
 * EP21 — "Kompensasi Resign Tidak Dibayar" (24 fps, 1080x1920, 71,13 detik).
 * Format >60 detik (naskah 148 kata, pita 140–150; pace 0,481 dtk/kata).
 * Mira, 27 th, staf administrasi perusahaan distribusi di Medan, 4 tahun:
 * resign tertib (surat tertulis 30 hari sebelumnya) tapi uang pisah Rp0
 * dan sisa cuti 5 hari tidak dibayar. Saksi: Yuni, rekan di meja sebelah —
 * resign bulan lalu, uang pisahnya juga nol.
 * Hukum: UU 27/2026 Pasal 233 ayat (2) — bila perusahaan tidak mengatur
 * besaran uang pisah, paling sedikit 1 bulan upah + Pasal 242 ayat (1)
 * (resign tertib berhak UPH + uang pisah) + Pasal 231 huruf i (syarat
 * resign tertib) + Pasal 232 ayat (4). Pesangon/UPMK TIDAK berlaku
 * untuk resign — yang dibayar hanya UPH + uang pisah.
 * VO: Sulafat 71,13 dtk (public/voice_over_ep21.mp3; raw 68,21 dtk, trim
 * jeda max 0,4 dtk -> 64,03 dtk, atempo 0.90), word timings dari
 * alignment.json faster-whisper small (143 token; koreksi: risain->resign,
 * 27->dua puluh tujuh, 2026->dua ribu dua puluh enam, 233->dua ratus tiga
 * puluh tiga, 4->empat, 1->satu, 30->tiga puluh, 2.->dua., angka dieja,
 * Tahun/Pasal/Nomor kapital, Perusahaan/Distribusi kecil).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap, beat saksi Yuni (S05).
 * Render: GitHub Actions. Set kantor distribusi (OfficeBg + meja Mira +
 * slip gaji + surat resign + meja HR) + rumah malam (HomeInteriorBg night).
 * Mood "calm" BUKAN mood valid di kit — S03 memakai hopeful -> worried.
 */

export const EP21_TOTAL = 1707; // 71,13 s @ 24 fps

/** Mira: blus krem, celana hitam, rambut diikat (bun) + name tag "MIRA". */
const MIRA: Look = { body: "#f5eeda", pants: "#1d1d1f", bun: true, hair: "#2a1a12", nameTag: "MIRA" };
/** Yuni: blus biru dusty, celana hitam, rambut pendek + name tag "YUNI". */
const YUNI: Look = { body: "#5b7a9a", pants: "#1d1d1f", shortHair: "#3a2a1a", nameTag: "YUNI" };
/** Bu Ratna HRD: blazer gelap + name tag "BU RATNA". */
const RATNA: Look = { body: "#23282e", pants: "#1d1d1f", shortHair: "#1a1a1a", nameTag: "BU RATNA" };

const FLOOR = 1400;

/** Word timings dari alignment (ms, absolut). startMs relatif ke awal shot. */
const timedCaptions = (words: [string, number, number][], lineStartMs: number): Caption[] =>
  words.map(([w, s, e], i) => ({
    text: (i ? " " : "") + w,
    startMs: Math.round(s - lineStartMs),
    endMs: Math.round(e - lineStartMs),
    timestampMs: Math.round((s + e) / 2 - lineStartMs),
    confidence: null,
  }));

/** SVG canvas dalam ruang piksel komposisi. */
const Canvas: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = "#1e2436" }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, background: bg }}>
      <StickDefs />
      {children}
    </svg>
  );
};

/** Matahari pagi + langit krem (dipakai S02/S08a). */
const MorningSky: React.FC = () => (
  <g>
    <circle cx={880} cy={250} r={92} fill="#db483b" opacity={0.9} />
    <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
  </g>
);

/** Slip gaji terakhir Mira: gaji pokok Rp4.500.000, uang pisah Rp 0, sisa cuti 5 hari Rp 0. */
const SlipGaji: React.FC<{ mini?: boolean }> = ({ mini = false }) => {
  if (mini) {
    return (
      <g>
        <rect x={-28} y={-40} width={56} height={80} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
        <line x1={-18} y1={-24} x2={18} y2={-24} stroke={C.ink} strokeWidth={3} />
        <line x1={-18} y1={-10} x2={18} y2={-10} stroke={C.ink} strokeWidth={3} />
        <line x1={-18} y1={8} x2={18} y2={8} stroke="#c0241c" strokeWidth={4} />
        <line x1={-18} y1={22} x2={18} y2={22} stroke="#c0241c" strokeWidth={4} />
      </g>
    );
  }
  return (
    <g>
      <rect x={-180} y={-240} width={360} height={480} rx={10} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
      <rect x={-180} y={-240} width={360} height={62} rx={10} fill="#1d1d1f" />
      <rect x={-180} y={-198} width={360} height={20} fill="#1d1d1f" />
      <text x={0} y={-198} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#fdf8ea" textAnchor="middle">SLIP GAJI</text>
      <text x={0} y={-130} fontFamily={FONT.mono} fontWeight={800} fontSize={22} fill={C.ink} textAnchor="middle">MIRA — STAF ADMIN</text>
      <text x={0} y={-90} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">4 TAHUN KERJA</text>
      <line x1={-150} y1={-60} x2={150} y2={-60} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      <text x={0} y={-10} fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill={C.ink} textAnchor="middle">GAJI POKOK</text>
      <text x={0} y={28} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill={C.ink} textAnchor="middle">Rp4.500.000</text>
      <text x={0} y={88} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill="#c0241c" textAnchor="middle">UANG PISAH</text>
      <text x={0} y={140} fontFamily={FONT.mono} fontWeight={800} fontSize={46} fill="#c0241c" textAnchor="middle">Rp 0</text>
      <text x={0} y={196} fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill="#c0241c" textAnchor="middle">SISA CUTI 5 HARI: Rp 0</text>
    </g>
  );
};

/** Amplop kosong dari HRD (S04). */
const Envelope: React.FC<{ mini?: boolean }> = ({ mini = false }) => {
  if (mini) {
    return (
      <g>
        <rect x={-26} y={-18} width={52} height={36} rx={3} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
        <polyline points="-26,-18 0,4 26,-18" fill="none" stroke={C.ink} strokeWidth={3} />
      </g>
    );
  }
  return (
    <g>
      <rect x={-70} y={-48} width={140} height={96} rx={6} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
      <polyline points="-70,-48 0,10 70,-48" fill="none" stroke={C.ink} strokeWidth={4} />
      <polyline points="-70,48 0,10 70,48" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.6} />
    </g>
  );
};

/** Ponsel (dipakai Yuni di S05, mini saja). */
const ChatPhone: React.FC<{ mini?: boolean }> = ({ mini = false }) => {
  if (mini) {
    return (
      <g>
        <rect x={-28} y={-60} width={56} height={120} rx={10} fill="#1d1d1f" stroke={C.ink} strokeWidth={4} />
        <rect x={-28} y={-60} width={56} height={22} rx={10} fill="#075e54" />
        <circle cx={0} cy={48} r={6} fill="#3a3a3f" stroke={C.ink} strokeWidth={2} />
      </g>
    );
  }
  return (
    <g>
      <rect x={-120} y={-200} width={240} height={400} rx={22} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
      <rect x={-108} y={-188} width={216} height={376} rx={14} fill="#ece5dd" />
    </g>
  );
};

/** Map cokelat berlabel PASAL 233 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 28 : 22} fill="#fdf8ea" textAnchor="middle">233</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Kartu nama di meja: "MIRA — STAF ADMIN". */
const NameCard: React.FC<{ name?: string; role?: string }> = ({ name = "MIRA", role = "STAF ADMIN" }) => (
  <g>
    <rect x={-55} y={-22} width={110} height={44} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-4} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill={C.ink} textAnchor="middle">{name}</text>
    <text x={0} y={14} fontFamily={FONT.mono} fontWeight={700} fontSize={11} fill="#6b675f" textAnchor="middle">{role}</text>
  </g>
);

/** Shot 1 (0–202): kantor distribusi pagi. Mira menatap slip gaji terakhir; big text. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Beat 1 (0–40f): Mira di meja, slip gaji di tangan. Beat 2 (40–100f): angka Rp 0 muncul. Beat 3 (100–202f): big text.
  const showSlip = frame >= 40;
  const bubble = frame < 60 ? 0 : spring({ frame: frame - 60, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        {/* slip gaji besar di meja */}
        <g transform="translate(540,1010)">
          <SlipGaji />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={320} floor={FLOOR} scale={0.95} look={MIRA} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.06 }} mood={frame < 100 ? "worried" : "shocked"} lookAt={0.5} holdF={showSlip ? <SlipGaji mini /> : undefined} />
      </Canvas>
      {/* bubble angka Rp 0 (HTML, terbaca) */}
      <div style={{ position: "absolute", top: 290, left: "50%", transform: `translateX(-50%) scale(${bubble})`, opacity: bubble, width: 860, background: "white", borderRadius: 24, padding: "22px 30px", boxShadow: "0 8px 0 rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, color: "#c0241c", lineHeight: 1.25 }}>
          Uang pisah: Rp 0
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: "#6b675f", marginTop: 8 }}>Slip gaji terakhir • 4 tahun kerja</div>
      </div>
      <KineticText words={["RESIGN", "=", "NOL", "RUPIAH?"]} at={100} stagger={3} top={520} fontSize={80} accent={["RUPIAH?"]} />
    </Camera>
  );
};

/** Shot 2 (0–326): tracking shot jalan pagi Medan. Mira menyeberang penuh kiri -> kanan, parallax 2 lapis, gerbang distribusi di kanan. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 130;
  return (
    <Camera dur={dur} move="static" blur>
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <Parallax dur={dur}>
          <ParallaxLayer speed={260}>
            <SkylineFar />
          </ParallaxLayer>
          <ParallaxLayer speed={620}>
            <SkylineNear />
          </ParallaxLayer>
        </Parallax>
        {/* jalan + trotoar */}
        <rect x={0} y={1400} width={1080} height={520} fill="#3a3a3f" />
        <rect x={0} y={1400} width={1080} height={16} fill="#5c564a" />
        <rect x={0} y={1460} width={1080} height={10} fill="#e2a748" strokeDasharray="40 30" />
        {/* gerbang distribusi */}
        <g>
          <rect x={800} y={1080} width={220} height={320} fill="#23282e" stroke={C.ink} strokeWidth={5} />
          <text x={910} y={1180} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill="#fdf8ea" textAnchor="middle">DISTRIBUSI</text>
          <text x={910} y={1220} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill="#fdf8ea" textAnchor="middle">MEDAN</text>
        </g>
        <Stick x={x} floor={FLOOR} scale={0.95} look={MIRA} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["RESIGN", "TERTIB,", "SURAT", "30", "HARI"]} at={60} stagger={3} top={420} fontSize={64} accent={["HARI"]} />
    </Camera>
  );
};

/** Shot 3 (0–166): kantor distribusi. Mira mengetik di meja (hopeful), lalu menatap surat resign (worried). */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat tenang (0–85f): hopeful — "calm" bukan Mood valid di kit.
  const m = frame < 85 ? "hopeful" : "worried";
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        <g transform="translate(480,1130)">
          <NameCard />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick
          x={320}
          floor={FLOOR}
          scale={0.95}
          look={MIRA}
          pose={{ ...STAND, armF: [0.45, 0.55], armB: [0.3, 0.5], lean: 0.03, headTilt: frame >= 85 ? 0.12 : 0 }}
          mood={m}
          lookAt={0.5}
          holdF={frame >= 85 ? <SlipGaji mini /> : undefined}
        />
      </Canvas>
      <KineticText words={["4", "TAHUN,", "TAK", "PERNAH", "DITEGUR"]} at={85} stagger={3} top={420} fontSize={64} accent={["DITEGUR"]} />
    </Camera>
  );
};

/** Shot 4 (0–197): close-up meja HR. Bu Ratna menyerahkan amplop kosong; Mira menunduk. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 2 (100f+): Mira membuka amplop — kosong; ekspresi worried -> sad.
  const m = frame < 100 ? "worried" : "sad";
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={MIRA} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.1 }} mood={m} lookAt={1} holdF={frame >= 100 ? <Envelope mini /> : undefined} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={RATNA} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: 0.02, headTilt: 0.1 }} mood="worried" lookAt={-0.6} holdF={<Envelope mini />} />
      </Canvas>
      <KineticText words={["TANGAN", "KOSONG"]} at={40} stagger={3} top={420} fontSize={88} accent={["KOSONG"]} />
    </Camera>
  );
};

/** Shot 5 (0–185): Yuni di meja sebelah membuka ponselnya juga — "bukan cuma aku". */
const Shot05: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 90 ? "resigned" : "determined";
  return (
    <Camera dur={dur} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={MIRA} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.12 }} mood="worried" lookAt={1} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={YUNI} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.06 }} mood={mood} lookAt={-0.6} holdF={frame >= 40 ? <ChatPhone mini /> : undefined} />
      </Canvas>
      <KineticText words={["BUKAN", "CUMA", "AKU"]} at={30} stagger={3} top={420} fontSize={88} accent={["AKU"]} />
    </Camera>
  );
};

/** Shot 6 (0–164): rumah malam. Mira mengangkat salinan pasal; big text kinetik. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–50f): jalan masuk ke meja. Beat 2 (50–164f): angkat pasal + big text.
  const walking = frame < 50;
  const x = walking ? interpolate(frame, [0, 50], [80, 420], { extrapolateRight: "clamp" }) : 420;
  const pose: Pose = walking
    ? walk((x - 80) / walkCycle(0.9, 0.95), 0.9)
    : { ...STAND, armF: [1.0, 0.25], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.08 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        {/* meja + lampu meja + salinan pasal */}
        <rect x={180} y={1150} width={720} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={1176} width={680} height={224} fill="#4a3428" />
        <rect x={780} y={980} width={14} height={170} fill={C.ink} />
        <path d="M787,980 L700,930 L874,930 Z" fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
        <circle cx={787} cy={975} r={26} fill="#ffe9a8" opacity={0.85} />
        <g transform="translate(560,1090)">
          {frame < 50 ? <PasalFolder big /> : null}
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={MIRA}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 50 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["PASAL", "233", "AYAT", "2"]} at={50} stagger={3} top={420} fontSize={88} accent={["233"]} />
    </Camera>
  );
};

/** Item kartu hukum: centang muncul progresif mengikuti narasi. */
const LawItem: React.FC<{ at: number; children: React.ReactNode; big?: React.ReactNode }> = ({ at, children, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { stiffness: 300, damping: 14 } });
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 24, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`, opacity: s }}>
      <div style={{ flexShrink: 0, width: 50, height: 50, borderRadius: "50%", background: "#c0241c", color: "white", fontFamily: FONT.title, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>✓</div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, lineHeight: 1.3, color: C.ink }}>
        {children}
        {big}
      </div>
    </div>
  );
};

/** Shot 7 (0–200): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Mira menunjuk item 1-2 (0–60f), lalu 3-4 (60–120f), item 5 tercentang (120f+).
  const pointY = frame < 60 ? 0 : frame < 120 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Mira kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={MIRA}
          pose={{ ...STAND, armF: [1.35, 0.12], armB: [-0.15, 0.1], lean: 0.04, headTilt: pointY === 2 ? 0 : -0.04 }}
          mood="determined"
          lookAt={1}
        />
      </svg>
      {/* kartu hukum krem */}
      <div
        style={{
          position: "absolute", left: 400, top: 240, width: 620, background: C.paper, border: `5px solid ${C.ink}`,
          boxShadow: "10px 12px 0 rgba(0,0,0,0.45)", padding: "28px 32px 36px", transform: `scale(${cardIn})`, opacity: cardIn,
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: C.alertRed }}>PASAL 233 AYAT 2</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · UANG PISAH RESIGN</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          Resign tertib: surat tertulis 30 hari sebelumnya, tanpa ikatan dinas, tetap bekerja sampai tanggalnya
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 231 huruf i)</div>
        </LawItem>
        <LawItem at={30}>
          Resign yang memenuhi syarat berhak atas uang penggantian hak dan uang pisah
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 242 ayat 1)</div>
        </LawItem>
        <LawItem at={60}>
          Bila perusahaan tidak mengatur, uang pisah paling sedikit 1 bulan upah
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 233 ayat 2)</div>
        </LawItem>
        <LawItem at={90}>
          Mira: gaji Rp4.500.000 → uang pisah minimal Rp4.500.000 + sisa cuti 5 hari diganti uang
        </LawItem>
        <LawItem at={120}>
          Pesangon/UPMK TIDAK berlaku untuk resign — yang dibayar hanya UPH + uang pisah
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–110): Mira jalan kembali ke kantor membawa salinan pasal. */
const Shot08a: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 110], [120, 700], { extrapolateRight: "clamp" });
  return (
    <Camera dur={110} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <CitySkylineBg variant="day" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={MIRA}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–157): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
const Shot08b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 2 ? 0 : spring({ frame: frame - 2, fps, config: { stiffness: 260, damping: 13 } });
  const line = frame < 18 ? 0 : spring({ frame: frame - 18, fps, config: { stiffness: 260, damping: 13 } });
  const q = frame < 36 ? 0 : spring({ frame: frame - 36, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", transform: `scale(${title})`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 118, color: "white", textShadow: "0 6px 16px rgba(0,0,0,0.8)" }}>CERITA PEKERJA</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#c9c4b4", marginTop: 16 }}>SETIAP PEKERJA PUNYA CERITA</div>
      </div>
      <div style={{ position: "absolute", top: 820, width: "100%", textAlign: "center", transform: `scale(${line})`, opacity: line }}>
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Resign tertib tetap punya hak.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah resign tapi uang pisahmu nol? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–267): kembali bekerja -> end card. */
const Shot08: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={110}>
      <Shot08a />
    </Sequence>
    <Sequence from={110}>
      <Shot08b />
    </Sequence>
  </>
);

export const EP21: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 202, words: timedCaptions([["Mira", 0, 300], ["menatap", 300, 960], ["slip", 960, 1180], ["gaji", 1180, 1660], ["terakhirnya,", 1660, 2420], ["empat", 2880, 3220], ["tahun", 3220, 3540], ["kerja,", 3540, 4120], ["dan", 4480, 4880], ["tidak", 4880, 5200], ["ada", 5200, 5620], ["satu", 5620, 5940], ["rupiah", 5940, 6400], ["pun", 6400, 6660], ["uang", 6660, 7000], ["pisah", 7000, 7380], ["di", 7380, 7540], ["sana.", 7540, 7860]], 0), yellow: ["RESIGN", "NOL", "RUPIAH", "PISAH"] },
    { start: 202, end: 528, words: timedCaptions([["Mira,", 8400, 8700], ["dua", 9280, 9460], ["puluh", 9460, 9640], ["tujuh", 9640, 9820], ["tahun,", 9820, 10500], ["staf", 11080, 11380], ["administrasi", 11380, 12300], ["di", 12300, 12440], ["perusahaan", 12440, 13120], ["distribusi", 13120, 13720], ["di", 13720, 13960], ["Medan.", 13960, 14380], ["Gajinya", 14920, 15360], ["empat", 15360, 15670], ["juta", 15670, 15980], ["lima", 15980, 16290], ["ratus", 16290, 16600], ["ribu", 16600, 17000], ["rupiah,", 17000, 17420], ["dan", 18040, 18120], ["ia", 18120, 18400], ["resign", 18400, 18900], ["dengan", 18900, 19160], ["surat", 19160, 19600], ["tertulis", 19600, 20100], ["tiga", 20100, 20250], ["puluh", 20250, 20400], ["hari", 20400, 20880], ["sebelumnya.", 20880, 21520]], 8400), yellow: ["MEDAN", "LIMA", "SURAT", "HARI"] },
    { start: 528, end: 694, words: timedCaptions([["Empat", 21980, 22260], ["tahun,", 22260, 22700], ["ia", 22980, 23080], ["datang", 23080, 23500], ["tepat", 23500, 23740], ["waktu,", 23740, 24120], ["lembur", 24780, 25200], ["saat", 25200, 25480], ["stok", 25480, 25930], ["opname,", 25930, 26380], ["dan", 26760, 27040], ["tidak", 27040, 27320], ["pernah", 27320, 27720], ["sekalipun", 27720, 28380], ["ditegur.", 28380, 28900]], 21980), yellow: ["TEPAT", "LEMBUR", "DITEGUR"] },
    { start: 694, end: 891, words: timedCaptions([["Tapi", 28900, 29780], ["bagi", 29780, 30180], ["perusahaan,", 30180, 30940], ["resign", 31420, 31820], ["berarti", 31820, 32280], ["pulang", 32280, 32680], ["dengan", 32680, 32900], ["tangan", 32900, 33300], ["kosong,", 33300, 33780], ["seolah", 34140, 34700], ["empat", 34700, 35020], ["tahun", 35020, 35340], ["itu", 35340, 35660], ["tidak", 35660, 35980], ["pernah", 35980, 36280], ["ada.", 36280, 36660]], 28900), yellow: ["TANGAN", "KOSONG"] },
    { start: 891, end: 1076, words: timedCaptions([["Di", 37120, 37360], ["meja", 37360, 37640], ["sebelah,", 37640, 38200], ["Yuni", 38620, 38860], ["membuka", 38860, 39340], ["ponselnya", 39340, 39980], ["juga.", 39980, 40280], ["Ia", 40840, 41120], ["resign", 41120, 41520], ["bulan", 41520, 41860], ["lalu,", 41860, 42240], ["dan", 42600, 42840], ["uang", 42840, 43180], ["pisahnya", 43180, 43740], ["juga", 43740, 44040], ["nol.", 44040, 44420]], 37120), yellow: ["YUNI", "NOL"] },
    { start: 1076, end: 1240, words: timedCaptions([["Undang-Undang", 44840, 45620], ["Nomor", 45620, 45920], ["dua", 45920, 46107], ["puluh", 46107, 46293], ["tujuh", 46293, 46480], ["Tahun", 46480, 47100], ["dua", 47100, 47340], ["ribu", 47340, 47580], ["dua", 47580, 47820], ["puluh", 47820, 48060], ["enam", 48060, 48300], ["Pasal", 48300, 49280], ["dua", 49280, 49544], ["ratus", 49544, 49808], ["tiga", 49808, 50072], ["puluh", 50072, 50336], ["tiga", 50336, 50600], ["ayat", 50600, 50980], ["dua.", 50980, 51240]], 44840), yellow: ["UNDANG-UNDANG", "PASAL", "DUA"] },
    { start: 1240, end: 1440, words: timedCaptions([["Dalam", 51680, 52140], ["hal", 52140, 52300], ["perusahaan", 52300, 53040], ["tidak", 53040, 53260], ["mengatur", 53260, 53780], ["besaran", 53780, 54180], ["uang", 54180, 54560], ["pisah,", 54560, 55000], ["maka", 55000, 55720], ["dapat", 55720, 55940], ["ditetapkan", 55940, 56620], ["besaran", 56620, 57000], ["uang", 57000, 57380], ["pisah", 57380, 57760], ["paling", 57760, 58060], ["sedikit", 58060, 58520], ["satu", 58520, 58880], ["bulan", 58880, 59240], ["upah.", 59240, 59660]], 51680), yellow: ["PISAH", "UPAH", "BULAN"] },
    { start: 1440, end: 1707, words: timedCaptions([["Mira", 60020, 60340], ["kembali", 60340, 60840], ["keesokan", 60840, 61420], ["harinya", 61420, 61820], ["dengan", 61820, 62100], ["salinan", 62100, 62660], ["pasal.", 62660, 63120], ["Resign", 63560, 64020], ["tertib", 64020, 64440], ["tetap", 64440, 64900], ["punya", 64900, 65100], ["hak.", 65100, 65400], ["Uang", 65880, 66100], ["pisah", 66100, 66520], ["dan", 66520, 66660], ["sisa", 66660, 67020], ["cuti", 67020, 67360], ["tidak", 67360, 67620], ["boleh", 67620, 67900], ["nol,", 67900, 68260], ["karena", 68640, 68940], ["setiap", 68940, 69460], ["pekerja", 69460, 69940], ["punya", 69940, 70320], ["cerita.", 70320, 70760]], 60020), yellow: ["SALINAN", "PASAL", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep21.mp3")} />
      <Sequence durationInFrames={202}>
        <Shot01 dur={202} />
      </Sequence>
      <Sequence from={202} durationInFrames={326}>
        <Shot02 dur={326} />
      </Sequence>
      <Sequence from={528} durationInFrames={166}>
        <Shot03 dur={166} />
      </Sequence>
      <Sequence from={694} durationInFrames={197}>
        <Shot04 dur={197} />
      </Sequence>
      <Sequence from={891} durationInFrames={185}>
        <Shot05 dur={185} />
      </Sequence>
      <Sequence from={1076} durationInFrames={164}>
        <Shot06 dur={164} />
      </Sequence>
      <Sequence from={1240} durationInFrames={200}>
        <Shot07 />
      </Sequence>
      <Sequence from={1440}>
        <Shot08 dur={267} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
