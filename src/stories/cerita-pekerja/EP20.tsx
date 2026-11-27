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
 * EP20 — "Fresh Graduate Tanpa Kontrak Jelas" (24 fps, 1080x1920, 72,08 detik).
 * EPISODE PERTAMA format >60 detik (naskah 148 kata, pita 140–150;
 * pace 0,484 dtk/kata). Nadia, 22 th, fresh graduate, staf admin startup
 * di Bandung 5 bulan: tidak pernah menandatangani kontrak apa pun —
 * perekrutan + janji gaji Rp3.000.000/bulan hanya lewat chat WhatsApp.
 * Suatu pagi bosnya (Pak Rendra) mengirim pesan: "Kontrakmu habis, besok
 * tidak usah masuk." Padahal tidak ada kontrak tertulis yang bisa habis.
 * Saksi: Sinta, rekan di meja sebelah — janjinya sama, hanya lewat chat.
 * Hukum: UU 27/2026 Pasal 85 — "Perjanjian Kerja waktu tertentu
 * sebagaimana dimaksud dalam Pasal 83 ayat (1) yang tidak dibuat secara
 * tertulis demi hukum menjadi Perjanjian Kerja waktu tidak tertentu."
 * + Pasal 83 ayat (1) (PKWT harus tertulis) + Pasal 82 ayat (2) (PKWT
 * max 2 tahun + max 2x perpanjangan @ max 1 tahun) + Pasal 87 ayat (1)–(2)
 * (PKWT hanya untuk pekerjaan tidak tetap) + Pasal 87 ayat (3) (wajib
 * dicatatkan max 3 hari kerja).
 * VO: Sulafat 72,08 dtk (public/voice_over_ep20.mp3; raw 83,97 dtk, trim +
 * atempo 1.15), word timings dari alignment.json faster-whisper small
 * (148 kata; koreksi: Kontrak+mu->kontrakmu, Undang+-undang->
 * Undang-Undang, sebagai+bagaimana->sebagaimana, apapun.->apa pun.,
 * staff->staf, sinta->Sinta, nomor->Nomor, angka dieja, Tahun/Pasal kapital).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap, beat saksi Sinta (S04–S05).
 * Render: GitHub Actions. Perbaikan gambar kecil vs EP19: set kantor
 * startup BARU yang detail (OfficeBg + 2 meja bersebelahan + ponsel chat
 * WA + kartu nama) + beat saksi divisualkan sebagai 2 shot.
 */

export const EP20_TOTAL = 1730; // 72,08 s @ 24 fps

/** Nadia: blus krem, celana hitam, rambut diikat (bun) + name tag "NADIA". */
const NADIA: Look = { body: "#f5eeda", pants: "#1d1d1f", bun: true, hair: "#2a1a12", nameTag: "NADIA" };
/** Sinta: blus biru dusty, celana hitam, rambut pendek + name tag "SINTA". */
const SINTA: Look = { body: "#5b7a9a", pants: "#1d1d1f", shortHair: "#3a2a1a", nameTag: "SINTA" };

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

/** Ponsel chat WA: header hijau Pak Rendra + bubble bos + bubble balasan Nadia. */
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
      {/* header WA */}
      <rect x={-108} y={-188} width={216} height={54} rx={14} fill="#075e54" />
      <rect x={-108} y={-148} width={216} height={14} fill="#075e54" />
      <circle cx={-82} cy={-161} r={15} fill="#f5f2e8" stroke={C.ink} strokeWidth={3} />
      <text x={-58} y={-154} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill="#fdf8ea">Pak Rendra</text>
      <text x={-58} y={-134} fontFamily={FONT.mono} fontWeight={700} fontSize={13} fill="#bfe3d0">online</text>
      {/* bubble bos */}
      <rect x={-94} y={-108} width={184} height={112} rx={12} fill="#ffffff" stroke="#d8d5c8" strokeWidth={2} />
      <text x={-82} y={-76} fontFamily={FONT.mono} fontWeight={700} fontSize={18} fill={C.ink}>Kontrakmu habis,</text>
      <text x={-82} y={-50} fontFamily={FONT.mono} fontWeight={700} fontSize={18} fill={C.ink}>besok tidak usah</text>
      <text x={-82} y={-24} fontFamily={FONT.mono} fontWeight={700} fontSize={18} fill={C.ink}>masuk.</text>
      <text x={52} y={-2} fontFamily={FONT.mono} fontWeight={700} fontSize={13} fill="#6b675f">07:42 ✓✓</text>
      {/* bubble balasan Nadia */}
      <rect x={-52} y={28} width={148} height={104} rx={12} fill="#dcf8c6" stroke="#c5e0ae" strokeWidth={2} />
      <text x={-40} y={56} fontFamily={FONT.mono} fontWeight={700} fontSize={18} fill={C.ink}>Tapi Pak, saya</text>
      <text x={-40} y={82} fontFamily={FONT.mono} fontWeight={700} fontSize={18} fill={C.ink}>tidak pernah</text>
      <text x={-40} y={108} fontFamily={FONT.mono} fontWeight={700} fontSize={18} fill={C.ink}>tanda tangan.</text>
      <text x={52} y={126} fontFamily={FONT.mono} fontWeight={700} fontSize={13} fill="#6b675f">07:44 ✓✓</text>
    </g>
  );
};

/** Map cokelat berlabel PASAL 85 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 30 : 24} fill="#fdf8ea" textAnchor="middle">85</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Kartu nama Nadia di meja: "NADIA — STAF ADMIN". */
const NameCard: React.FC = () => (
  <g>
    <rect x={-55} y={-22} width={110} height={44} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-4} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill={C.ink} textAnchor="middle">NADIA</text>
    <text x={0} y={14} fontFamily={FONT.mono} fontWeight={700} fontSize={11} fill="#6b675f" textAnchor="middle">STAF ADMIN</text>
  </g>
);

/** Shot 1 (0–297): kantor startup pagi. Nadia membuka ponsel; bubble chat WA; big text. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Beat 1 (0–100f): Nadia di meja, ponsel di tangan. Beat 2 (100–200f): bubble chat muncul. Beat 3 (200–297f): big text.
  const showPhone = frame >= 60;
  const bubble = frame < 100 ? 0 : spring({ frame: frame - 100, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        {/* ponsel besar di meja */}
        <g transform="translate(540,1010)">
          <ChatPhone />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={320} floor={FLOOR} scale={0.95} look={NADIA} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.06 }} mood={frame < 100 ? "worried" : "shocked"} lookAt={0.5} holdF={showPhone ? <ChatPhone mini /> : undefined} />
      </Canvas>
      {/* bubble chat WA (HTML, terbaca) */}
      <div style={{ position: "absolute", top: 290, left: "50%", transform: `translateX(-50%) scale(${bubble})`, opacity: bubble, width: 860, background: "white", borderRadius: 24, padding: "22px 30px", boxShadow: "0 8px 0 rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, color: C.ink, lineHeight: 1.25 }}>
          “Kontrakmu habis, besok tidak usah masuk.”
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: "#075e54", marginTop: 8 }}>Pak Rendra • WhatsApp • 07:42</div>
      </div>
      <KineticText words={["DIPECAT", "LEWAT", "CHAT"]} at={150} stagger={3} top={520} fontSize={88} accent={["CHAT"]} />
    </Camera>
  );
};

/** Shot 2 (0–282): tracking shot jalan pagi Bandung. Nadia menyeberang penuh kiri -> kanan, parallax 2 lapis, gerbang startup di kanan. */
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
        {/* gerbang startup */}
        <g>
          <rect x={800} y={1080} width={220} height={320} fill="#23282e" stroke={C.ink} strokeWidth={5} />
          <text x={910} y={1180} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill="#fdf8ea" textAnchor="middle">STARTUP</text>
          <text x={910} y={1220} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill="#fdf8ea" textAnchor="middle">BANDUNG</text>
        </g>
        <Stick x={x} floor={FLOOR} scale={0.95} look={NADIA} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["TANPA", "SELEMBAR", "SURAT"]} at={60} stagger={3} top={420} fontSize={80} accent={["SURAT"]} />
    </Camera>
  );
};

/** Shot 3 (0–283): kantor startup. Nadia mengetik di meja (calm), lalu menatap ponsel (worried). */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat tenang (0–140f): hopeful — "calm" bukan Mood valid di kit.
  const m = frame < 140 ? "hopeful" : "worried";
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
          look={NADIA}
          pose={{ ...STAND, armF: [0.45, 0.55], armB: [0.3, 0.5], lean: 0.03, headTilt: frame >= 140 ? 0.12 : 0 }}
          mood={m}
          lookAt={0.5}
          holdF={frame >= 140 ? <ChatPhone mini /> : undefined}
        />
      </Canvas>
      <KineticText words={["DATANG", "AWAL", "PULANG", "TERAKHIR"]} at={140} stagger={3} top={420} fontSize={76} accent={["TERAKHIR"]} />
    </Camera>
  );
};

/** Shot 4 (0–140): close-up dua meja. Nadia + Sinta; Sinta membuka ponselnya juga. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={NADIA} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.1 }} mood="worried" lookAt={1} holdF={<ChatPhone mini />} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={SINTA} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: 0.02, headTilt: 0.1 }} mood="worried" lookAt={-0.6} holdF={frame >= 40 ? <ChatPhone mini /> : undefined} />
      </Canvas>
      <KineticText words={["JANJINYA", "SAMA"]} at={40} stagger={3} top={420} fontSize={88} accent={["SAMA"]} />
    </Camera>
  );
};

/** Shot 5 (0–97): Sinta menatap Nadia — "berarti bukan cuma aku tanpa kontrak". */
const Shot05: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 48 ? "resigned" : "determined";
  return (
    <Camera dur={dur} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={NADIA} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.12 }} mood="worried" lookAt={1} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={SINTA} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.06 }} mood={mood} lookAt={-0.6} />
      </Canvas>
      <KineticText words={["BUKAN", "CUMA", "AKU"]} at={30} stagger={3} top={420} fontSize={88} accent={["AKU"]} />
    </Camera>
  );
};

/** Shot 6 (0–122): rumah malam. Nadia mengangkat salinan pasal; big text kinetik. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–40f): jalan masuk ke meja. Beat 2 (40–122f): angkat pasal + big text.
  const walking = frame < 40;
  const x = walking ? interpolate(frame, [0, 40], [80, 420], { extrapolateRight: "clamp" }) : 420;
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
          {frame < 40 ? <PasalFolder big /> : null}
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={NADIA}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 40 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["PASAL", "85"]} at={40} stagger={3} top={420} fontSize={110} accent={["85"]} />
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

/** Shot 7 (0–247): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Nadia menunjuk item 1-2 (0–72f), lalu 3-4 (72–144f), item 5 tercentang (144f+).
  const pointY = frame < 72 ? 0 : frame < 144 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Nadia kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={NADIA}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: C.alertRed }}>PASAL 85</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · PKWT TIDAK TERTULIS</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          PKWT harus tertulis, bahasa Indonesia, huruf Latin
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 83 ayat 1)</div>
          <span style={{ fontFamily: FONT.title, fontSize: 64, color: "#c0241c", lineHeight: 1 }}>85</span>
        </LawItem>
        <LawItem at={36}>
          PKWT tidak tertulis demi hukum menjadi PKWTT
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 85)</div>
        </LawItem>
        <LawItem at={72}>
          PKWT hanya untuk pekerjaan tidak tetap; admin tetap tak memenuhi syarat
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 87 ayat 1–2)</div>
        </LawItem>
        <LawItem at={108}>
          Pemberi kerja wajib mencatat PKWT max 3 hari kerja
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 87 ayat 3)</div>
        </LawItem>
        <LawItem at={144}>
          Nadia: 5 bulan tanpa kontrak → karyawan tetap; PHK tak bisa seenaknya
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–110): Nadia jalan kembali ke kantor membawa salinan pasal. */
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
          look={NADIA}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–152): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
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
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Tanpa kontrak tertulis, ia karyawan tetap.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Kerjamu ada kontrak tertulisnya? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–262): kembali bekerja -> end card. */
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

export const EP20: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 297, words: timedCaptions([["Nadia", 0, 580], ["membuka", 580, 1300], ["pesan", 1300, 1720], ["WhatsApp", 1720, 2140], ["dari", 2140, 2500], ["bosnya.", 2500, 2980], ["kontrakmu", 3600, 4140], ["habis,", 4140, 4600], ["besok", 5160, 5600], ["tidak", 5600, 5840], ["usah", 5840, 6100], ["masuk.", 6100, 6440], ["Padahal,", 7040, 7800], ["lima", 8000, 8300], ["bulan,", 8300, 8720], ["tanpa", 9100, 9500], ["pernah", 9500, 9860], ["menandatangani", 9860, 10780], ["kontrak", 10780, 11220], ["apa", 11220, 11500], ["pun.", 11500, 11780]], 0), yellow: ["WHATSAPP", "KONTRAKMU", "HABIS", "BULAN"] },
    { start: 297, end: 579, words: timedCaptions([["Nadia,", 12360, 13000], ["dua", 13320, 13460], ["puluh", 13460, 13600], ["dua", 13600, 13740], ["tahun,", 13740, 14260], ["fresh", 14780, 15020], ["graduate,", 15020, 15500], ["staf", 16060, 16260], ["admin", 16260, 16720], ["di", 16720, 16940], ["sebuah", 16940, 17240], ["startup", 17240, 17640], ["di", 17640, 17920], ["Bandung.", 17920, 18300], ["Gaji", 18720, 19200], ["tiga", 19200, 19540], ["juta", 19540, 19780], ["rupiah,", 19780, 20180], ["dijanjikan", 20680, 21280], ["lewat", 21280, 21600], ["chat", 21600, 21920], ["tanpa", 21920, 22560], ["selembar", 22560, 22980], ["surat", 22980, 23280], ["pun.", 23280, 23480]], 12360), yellow: ["FRESH", "GRADUATE", "BANDUNG", "TIGA"] },
    { start: 579, end: 862, words: timedCaptions([["Tiap", 24120, 24500], ["pagi", 24500, 24940], ["ia", 24940, 25280], ["datang", 25280, 25600], ["paling", 25600, 25800], ["awal,", 25800, 26220], ["pulang", 26580, 26920], ["terakhir,", 26920, 27440], ["laptop", 27780, 28200], ["dan", 28200, 28460], ["kartu", 28460, 28780], ["nama", 28780, 29020], ["di", 29020, 29180], ["meja.", 29180, 29520], ["Tapi", 29980, 30480], ["bagi", 30480, 30860], ["perusahaan,", 30860, 31600], ["ia", 31960, 32180], ["pekerja", 32180, 32680], ["kontrak", 32680, 33100], ["yang", 33100, 33420], ["bisa", 33420, 33720], ["disudahi", 33720, 34280], ["lewat", 34280, 34640], ["pesan", 34640, 34940], ["singkat.", 34940, 35320]], 24120), yellow: ["PALING", "AWAL", "TERAKHIR", "SINGKAT"] },
    { start: 862, end: 1002, words: timedCaptions([["Di", 35920, 36140], ["meja", 36140, 36400], ["sebelah,", 36400, 36900], ["Sinta", 37120, 37380], ["membuka", 37380, 37800], ["ponselnya", 37800, 38260], ["juga.", 38260, 38500], ["Janjinya", 39180, 39580], ["sama,", 39580, 39880], ["hanya", 40340, 40620], ["lewat", 40620, 40900], ["chat.", 40900, 41160]], 35920), yellow: ["SINTA", "PONSELNYA", "JANJINYA", "CHAT"] },
    { start: 1002, end: 1099, words: timedCaptions([["Ia", 41760, 42100], ["menatap", 42100, 42520], ["Nadia,", 42520, 42880], ["berarti", 43320, 43760], ["bukan", 43760, 44040], ["cuma", 44040, 44280], ["aku", 44280, 44600], ["tanpa", 44600, 44880], ["kontrak.", 44880, 45240]], 41760), yellow: ["NADIA", "BUKAN", "CUMA", "KONTRAK"] },
    { start: 1099, end: 1221, words: timedCaptions([["Undang-Undang", 45780, 46660], ["Nomor", 46660, 46960], ["dua", 46960, 47113], ["puluh", 47113, 47267], ["tujuh", 47267, 47420], ["Tahun", 47420, 47980], ["dua", 47980, 48184], ["ribu", 48184, 48388], ["dua", 48388, 48592], ["puluh", 48592, 48796], ["enam", 48796, 49000], ["Pasal", 49000, 49500], ["delapan", 49500, 49693], ["puluh", 49693, 49887], ["lima.", 49887, 50080]], 45780), yellow: ["UNDANG-UNDANG", "NOMOR", "PASAL", "LIMA"] },
    { start: 1221, end: 1468, words: timedCaptions([["Perjanjian", 50860, 51580], ["kerja", 51580, 51880], ["waktu", 51880, 52100], ["tertentu", 52100, 52700], ["sebagaimana", 52700, 53200], ["dimaksud", 53200, 53640], ["dalam", 53640, 53860], ["Pasal", 53860, 54200], ["delapan", 54200, 54367], ["puluh", 54367, 54533], ["tiga", 54533, 54700], ["ayat", 54700, 55220], ["satu", 55220, 55520], ["yang", 55520, 56040], ["tidak", 56040, 56320], ["dibuat", 56320, 56760], ["secara", 56760, 57040], ["tertulis", 57040, 57580], ["demi", 57580, 57820], ["hukum", 57820, 58280], ["menjadi", 58280, 58500], ["perjanjian", 58500, 59120], ["kerja", 59120, 59480], ["waktu", 59480, 59740], ["tidak", 59740, 60060], ["tertentu.", 60060, 60660]], 50860), yellow: ["PERJANJIAN", "TERTULIS", "TIDAK", "HUKUM"] },
    { start: 1468, end: 1730, words: timedCaptions([["Nadia", 61180, 61660], ["kembali", 61660, 62100], ["keesokan", 62100, 62620], ["harinya", 62620, 62980], ["dengan", 62980, 63220], ["salinan", 63220, 63660], ["pasal.", 63660, 64080], ["Tanpa", 64560, 64860], ["kontrak", 64860, 65200], ["tertulis,", 65200, 65740], ["ia", 65840, 66000], ["karyawan", 66000, 66400], ["tetap.", 66400, 66840], ["Pemutusan", 67180, 67600], ["hubungan", 67600, 67980], ["kerja", 67980, 68340], ["tidak", 68340, 68580], ["bisa", 68580, 68920], ["seenaknya,", 68920, 69480], ["karena", 69800, 70140], ["setiap", 70140, 70660], ["pekerja", 70660, 71120], ["punya", 71120, 71440], ["cerita.", 71440, 71840]], 61180), yellow: ["SALINAN", "PASAL", "TETAP", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep20.mp3")} />
      <Sequence durationInFrames={297}>
        <Shot01 dur={297} />
      </Sequence>
      <Sequence from={297} durationInFrames={282}>
        <Shot02 dur={282} />
      </Sequence>
      <Sequence from={579} durationInFrames={283}>
        <Shot03 dur={283} />
      </Sequence>
      <Sequence from={862} durationInFrames={140}>
        <Shot04 dur={140} />
      </Sequence>
      <Sequence from={1002} durationInFrames={97}>
        <Shot05 dur={97} />
      </Sequence>
      <Sequence from={1099} durationInFrames={122}>
        <Shot06 dur={122} />
      </Sequence>
      <Sequence from={1221} durationInFrames={247}>
        <Shot07 />
      </Sequence>
      <Sequence from={1468}>
        <Shot08 dur={262} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
