import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Cam, Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";

/**
 * EP12 — "Kerja di Hari Libur" (24 fps, 1080x1920, 55.9 detik).
 * Sari, kasir minimarket: disuruh masuk sehari sebelum Lebaran, diancam
 * potong gaji, upah lembur hari liburnya tidak dibayar.
 * Hukum: UU 27/2026 Pasal 125 ayat (1) + ayat (3) — verbatim.
 * VO: Sulafat 55.0 dtk (public/voice_over_ep12.mp3), word timings dari
 * alignment.json faster-whisper (120 kata, dinormalisasi: "minimarket",
 * "di sini", "Undang-Undang", "pekerja").
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 */

export const EP12_TOTAL = 1342; // 55.9 s @ 24 fps

/** Sari "maya": kemeja putih, rok/celana hitam, rambut panjang (bun = varian perempuan kit). */
const SARI: Look = { body: "#f5f2e8", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };
/** Atasan: kemeja biru-abu, dasi merah. */
const BOSS: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };

const FLOOR = 1400;

/** Word timings dari alignment (ms, absolut). startMs relatif ke awal baris. */
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

/** Matahari pagi + langit krem (dipakai S01/S02/S08). */
const MorningSky: React.FC = () => (
  <g>
    <circle cx={880} cy={250} r={92} fill="#db483b" opacity={0.9} />
    <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
  </g>
);

/** Shot 1 (0–142): depan minimarket, pagi Hari Raya. Sari jalan masuk, push-in, pill hook. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–48f): jalan masuk kiri -> pintu. Beat 2 (48–96f): berhenti, menatap spanduk. Beat 3 (96–142f): menatap kamera, dorong pintu.
  const walking = frame < 48;
  const walkDist = walking ? interpolate(frame, [0, 48], [0, 560]) : 560;
  const x = 60 + walkDist;
  const pose = walking ? { ...walk(walkDist / walkCycle(0.9, 0.95), 0.9), headTilt: 0 } : { ...STAND, headTilt: frame < 96 ? 0.14 : 0, lean: 0.02 };
  const doorOpen = frame >= 120 ? interpolate(frame, [120, 142], [0, 0.5], { extrapolateRight: "clamp" }) : 0;
  return (
    <Cam dur={dur} from={1} to={1.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        {/* toko tutup kiri-kanan: rolling door abu-abu */}
        <g>
          <rect x={0} y={700} width={240} height={700} fill="#b9b6ae" stroke={C.ink} strokeWidth={8} />
          {[760, 830, 900, 970, 1040, 1110, 1180, 1250, 1320].map((y) => (
            <line key={y} x1={0} y1={y} x2={240} y2={y} stroke="#8a877f" strokeWidth={5} />
          ))}
          <rect x={840} y={700} width={240} height={700} fill="#b9b6ae" stroke={C.ink} strokeWidth={8} />
          {[760, 830, 900, 970, 1040, 1110, 1180, 1250, 1320].map((y) => (
            <line key={y} x1={840} y1={y} x2={1080} y2={y} stroke="#8a877f" strokeWidth={5} />
          ))}
          <text x={120} y={660} fontFamily={FONT.mono} fontWeight={800} fontSize={34} fill="#6b675f" textAnchor="middle">TUTUP</text>
          <text x={960} y={660} fontFamily={FONT.mono} fontWeight={800} fontSize={34} fill="#6b675f" textAnchor="middle">TUTUP</text>
        </g>
        {/* minimarket tengah: etalase + spanduk Hari Raya + pintu */}
        <rect x={260} y={620} width={560} height={780} fill="#fdf8ea" stroke={C.ink} strokeWidth={8} />
        <rect x={300} y={660} width={480} height={180} fill="#c0241c" stroke={C.ink} strokeWidth={6} />
        <text x={540} y={730} fontFamily={FONT.title} fontSize={58} fill="white" textAnchor="middle">SELAMAT</text>
        <text x={540} y={800} fontFamily={FONT.title} fontSize={58} fill="white" textAnchor="middle">HARI RAYA</text>
        <rect x={300} y={880} width={220} height={520} fill="#bfe3f2" stroke={C.ink} strokeWidth={6} />
        <line x1={410} y1={880} x2={410} y2={1400} stroke={C.ink} strokeWidth={5} />
        {/* pintu (terbuka sedikit di beat 3) */}
        <g transform={`rotate(${-doorOpen * 40} 560 1400)`}>
          <rect x={560} y={880} width={220} height={520} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
          <circle cx={740} cy={1150} r={12} fill="#c9a24a" stroke={C.ink} strokeWidth={4} />
        </g>
        <text x={540} y={600} fontFamily={FONT.mono} fontWeight={800} fontSize={40} fill={C.ink} textAnchor="middle">MINIMARKET</text>
        {/* jalan + trotoar */}
        <rect x={0} y={1400} width={1080} height={520} fill="#8a7a5c" />
        <rect x={0} y={1400} width={1080} height={18} fill="#6b5e46" />
        <Stick x={x} floor={FLOOR} scale={0.95} look={SARI} pose={pose} mood="worried" lookAt={frame >= 96 ? 0.5 : 0.9} />
      </Canvas>
      {/* pill hook */}
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 56, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          HARI RAYA. <span style={{ color: C.capYellow }}>SARI DISURUH MASUK KERJA.</span>
        </span>
      </div>
    </Cam>
  );
};

/** Shot 2 (0–148): tracking shot jalan siang. Sari menyeberang penuh kiri -> kanan, parallax 2 lapis. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const farX = -t * 260; // ruko jauh: lambat
  const nearX = -t * 620; // lampu jalan + trotoar: cepat
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 108;
  return (
    <Cam dur={dur} from={1.02} to={1.02} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        {/* lapis jauh: ruko */}
        <g transform={`translate(${farX},0)`}>
          {[0, 420, 840, 1260].map((bx) => (
            <g key={bx}>
              <rect x={bx} y={760} width={360} height={640} fill="#d8cdb2" stroke={C.ink} strokeWidth={7} />
              <rect x={bx + 40} y={820} width={120} height={140} fill="#bfe3f2" stroke={C.ink} strokeWidth={5} />
              <rect x={bx + 200} y={820} width={120} height={140} fill="#bfe3f2" stroke={C.ink} strokeWidth={5} />
              <rect x={bx + 130} y={1060} width={100} height={340} fill="#8a5a34" stroke={C.ink} strokeWidth={5} />
            </g>
          ))}
        </g>
        {/* lapis dekat: lampu jalan + trotoar */}
        <g transform={`translate(${nearX},0)`}>
          {[120, 640, 1160, 1680].map((lx) => (
            <g key={lx}>
              <rect x={lx} y={900} width={16} height={500} fill={C.ink} />
              <circle cx={lx + 8} cy={880} r={34} fill="#ffe9a8" stroke={C.ink} strokeWidth={6} />
            </g>
          ))}
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#8a7a5c" />
        <rect x={0} y={1400} width={1080} height={18} fill="#6b5e46" />
        <Stick x={x} floor={FLOOR} scale={0.95} look={SARI} pose={pose} lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
    </Cam>
  );
};

/** Kalender dinding: grid tanggal + lingkaran merah di tanggal Lebaran. */
const Calendar: React.FC<{ x: number; y: number; circleScale: number }> = ({ x, y, circleScale }) => (
  <g>
    <rect x={x} y={y} width={300} height={340} fill="#fdf8ea" stroke={C.ink} strokeWidth={7} />
    <rect x={x} y={y} width={300} height={64} fill="#c0241c" />
    <text x={x + 150} y={y + 46} fontFamily={FONT.mono} fontWeight={800} fontSize={34} fill="white" textAnchor="middle">LEBARAN</text>
    {[0, 1, 2, 3].map((r) =>
      [0, 1, 2, 3].map((c) => (
        <rect key={`${r}${c}`} x={x + 24 + c * 64} y={y + 88 + r * 58} width={48} height={44} fill="none" stroke="#b9b6ae" strokeWidth={3} />
      )),
    )}
    <g transform={`translate(${x + 150},${y + 204}) scale(${circleScale})`}>
      <circle r={34} fill="none" stroke="#c0241c" strokeWidth={9} />
    </g>
  </g>
);

/** Shot 3 (0–178): ruang belakang. Sari masuk kiri, atasan masuk kanan, menunjuk kalender. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const circle = frame < 60 ? 0 : spring({ frame: frame - 60, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–60f): keduanya jalan masuk. Beat 2 (60–120f): atasan menunjuk kalender. Beat 3 (120–178f): atasan menunjuk Sari, Sari menunduk.
  const sariX = interpolate(frame, [0, 60], [60, 380], { extrapolateRight: "clamp" });
  const bossX = interpolate(frame, [0, 60], [1020, 760], { extrapolateRight: "clamp" });
  const sariPose: Pose = frame < 60 ? walk((sariX - 60) / walkCycle(0.9, 0.95), 0.9) : { ...STAND, headTilt: frame >= 120 ? 0.2 : 0.08, lean: frame >= 120 ? -0.04 : 0 };
  const bossPose: Pose = frame < 60
    ? walk((1020 - bossX) / walkCycle(0.9, 1.0), 0.9)
    : { ...STAND, armF: frame >= 120 ? [1.5, 0.15] : [1.25, 0.2], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 };
  return (
    <Cam dur={dur} from={1} to={1.04} origin="50% 50%" shake={2}>
      <Canvas bg="#e8e0c8">
        {/* rak stok + kardus */}
        <rect x={60} y={800} width={300} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={60} y={1060} width={300} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={90} y={660} width={110} height={120} fill="#c9a86a" stroke={C.ink} strokeWidth={5} />
        <rect x={220} y={660} width={110} height={120} fill="#d8bc82" stroke={C.ink} strokeWidth={5} />
        <rect x={90} y={920} width={110} height={120} fill="#b3945e" stroke={C.ink} strokeWidth={5} />
        <rect x={220} y={920} width={110} height={120} fill="#c9a86a" stroke={C.ink} strokeWidth={5} />
        <rect x={80} y={1240} width={180} height={160} fill="#b3945e" stroke={C.ink} strokeWidth={5} />
        <Calendar x={620} y={420} circleScale={circle} />
        {/* pintu gudang kiri: cahaya masuk */}
        <rect x={0} y={700} width={40} height={700} fill="#f5f2e8" opacity={0.7} />
        <rect x={0} y={1400} width={1080} height={520} fill="#6b5e46" />
        <rect x={0} y={1400} width={1080} height={18} fill="#4a3f2e" />
        <Stick x={sariX} floor={FLOOR} scale={0.95} look={SARI} pose={sariPose} mood="worried" lookAt={1} />
        <Stick x={bossX} floor={FLOOR} scale={1.0} look={BOSS} pose={bossPose} mood="determined" lookAt={-0.6} />
      </Canvas>
    </Cam>
  );
};

/** Shot 4 (0–139): pertemuan yang sama, lebih dekat. Sari protes, atasan mengacungkan slip gaji. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame * 0.25) * 0.12;
  // Beat 1 (0–36f): Sari angkat tangan protes. Beat 2 (36–84f): atasan acungkan slip gaji, Sari mundur. Beat 3 (84–139f): Sari scared, atasan menunjuk pintu.
  const sariX = frame < 84 ? 540 : interpolate(frame, [84, 100], [540, 500], { extrapolateRight: "clamp" });
  const mood = frame < 84 ? "determined" : "scared";
  const sariPose: Pose = frame < 36
    ? { ...STAND, armF: [2.3, 0.25], armB: [-0.1, 0.1], lean: 0.06, headTilt: -0.06 }
    : { ...STAND, armF: [0.4, 0.1], armB: [-0.2, 0.1], lean: frame < 84 ? 0.02 : -0.08, headTilt: frame < 84 ? 0 : 0.12 };
  const bossPose: Pose = frame < 84
    ? { ...STAND, armF: [1.1, 0.2], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 }
    : { ...STAND, armF: [1.5, 0.15], armB: [0.3, 0.1], lean: -0.08, headTilt: -0.05 };
  return (
    <Cam dur={dur} from={1} to={1.08} origin="50% 45%" shake={2}>
      <Canvas bg="#e8e0c8">
        <Calendar x={80} y={380} circleScale={1} />
        <rect x={0} y={1400} width={1080} height={520} fill="#6b5e46" />
        <rect x={0} y={1400} width={1080} height={18} fill="#4a3f2e" />
        <Stick x={sariX} floor={FLOOR} scale={1.0} look={SARI} pose={sariPose} mood={mood} lookAt={1} />
        <Stick
          x={760}
          floor={FLOOR}
          scale={1.05}
          look={BOSS}
          pose={bossPose}
          mood="determined"
          lookAt={-0.7}
          holdF={
            <g transform={`rotate(${swing * 57})`}>
              <rect x={-50} y={-70} width={100} height={140} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
              <text x={0} y={-20} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill={C.ink} textAnchor="middle">SLIP</text>
              <text x={0} y={18} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill={C.ink} textAnchor="middle">GAJI</text>
              <line x1={-34} y1={40} x2={34} y2={40} stroke="#c0241c" strokeWidth={5} />
            </g>
          }
        />
      </Canvas>
    </Cam>
  );
};

/** Shot 5a (0–72): kasir sepi, Hari Raya. Sari lelah menatap pintu kosong. */
const Shot05a: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Cam dur={72} from={1} to={1.03} origin="50% 50%">
      <Canvas bg="#dfe8ea">
        {/* rak + etalase kosong */}
        <rect x={60} y={700} width={960} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={90} y={560} width={130} height={120} fill="#c9a86a" stroke={C.ink} strokeWidth={5} />
        <rect x={250} y={560} width={130} height={120} fill="#d8bc82" stroke={C.ink} strokeWidth={5} />
        <rect x={700} y={560} width={130} height={120} fill="#c9a86a" stroke={C.ink} strokeWidth={5} />
        <rect x={860} y={560} width={130} height={120} fill="#b3945e" stroke={C.ink} strokeWidth={5} />
        {/* meja kasir + scanner */}
        <rect x={240} y={1150} width={600} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={240} y={1176} width={600} height={224} fill="#5c4033" />
        <rect x={660} y={1060} width={120} height={90} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
        <line x1={660} y1={1060} x2={620} y2={1000} stroke={C.ink} strokeWidth={6} />
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={18} fill="#5c564a" />
        <Stick x={540} floor={FLOOR} scale={0.95} look={SARI} pose={{ ...STAND, lean: 0.1, headTilt: 0.1 }} mood="tired" eyesClosed={frame % 72 > 40} lookAt={0.9} />
      </Canvas>
    </Cam>
  );
};

/** Shot 5b (0–149): Sari memegang amplop gaji tipis. Big text "UPAH BIASA SAJA". */
const Shot05b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const big = frame < 12 ? 0 : spring({ frame: frame - 12, fps, config: { stiffness: 260, damping: 12 } });
  return (
    <Cam dur={149} from={1} to={1.06} origin="50% 40%">
      <Canvas bg="#e8e0c8">
        <rect x={0} y={1400} width={1080} height={520} fill="#6b5e46" />
        <rect x={0} y={1400} width={1080} height={18} fill="#4a3f2e" />
        <Stick
          x={540}
          floor={FLOOR}
          scale={1.0}
          look={SARI}
          pose={{ ...STAND, armF: [0.7, 0.35], armB: [0.5, 0.3], lean: 0.1, headTilt: 0.16 }}
          mood="tired"
          lookAt={frame > 90 ? 0.5 : 0.9}
          holdF={
            <g transform="rotate(-12)">
              <rect x={-90} y={-30} width={180} height={110} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
              <line x1={-90} y1={-30} x2={90} y2={25} stroke="#b9b6ae" strokeWidth={3} />
              <line x1={90} y1={-30} x2={-90} y2={25} stroke="#b9b6ae" strokeWidth={3} />
              <text x={0} y={70} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill={C.ink} textAnchor="middle">GAJI</text>
            </g>
          }
        />
      </Canvas>
      <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", transform: `scale(${big}) rotate(-2deg)`, opacity: big }}>
        <div style={{ fontFamily: FONT.title, fontSize: 96, lineHeight: 1.02, color: "white", textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>UPAH BIASA</div>
        <div style={{ fontFamily: FONT.title, fontSize: 96, lineHeight: 1.02, color: C.alertRed, textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>SAJA</div>
      </div>
    </Cam>
  );
};

/** Shot 5 (0–221): kasir -> amplop gaji (cut internal lewat tangan Sari). */
const Shot05: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={72}>
      <Shot05a />
    </Sequence>
    <Sequence from={72}>
      <Shot05b />
    </Sequence>
  </>
);

/** Shot 6 (0–151): rumah Sari, malam. Angkat buku hukum; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["TIDAK", "WAJIB", "KERJA", "DI", "HARI", "LIBUR"];
  // Beat 1 (0–48f): jalan masuk ke meja. Beat 2 (48–108f): angkat buku + big text stagger. Beat 3 (108–151f): menatap big text.
  const walking = frame < 48;
  const x = walking ? interpolate(frame, [0, 48], [80, 420], { extrapolateRight: "clamp" }) : 420;
  const pose: Pose = walking
    ? walk((x - 80) / walkCycle(0.9, 0.95), 0.9)
    : { ...STAND, armF: [1.0, 0.25], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.08 };
  return (
    <Cam dur={dur} from={1} to={1.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        {/* meja + lampu meja + buku hukum */}
        <rect x={180} y={1150} width={720} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={1176} width={680} height={224} fill="#4a3428" />
        <rect x={780} y={980} width={14} height={170} fill={C.ink} />
        <path d="M787,980 L700,930 L874,930 Z" fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
        <circle cx={787} cy={975} r={26} fill="#ffe9a8" opacity={0.85} />
        <g transform="translate(560,1090)">
          <rect x={-90} y={-50} width={90} height={100} fill="#8a2a22" stroke={C.ink} strokeWidth={5} transform="skewY(-6)" />
          <rect x={0} y={-56} width={90} height={100} fill="#a83a2e" stroke={C.ink} strokeWidth={5} transform="skewY(6)" />
          <text x={-45} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={22} fill="white" textAnchor="middle" transform="skewY(-6)">UU</text>
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick x={x} floor={FLOOR} scale={0.95} look={SARI} pose={pose} mood="determined" lookAt={0.5} />
      </Canvas>
      {/* big text kinetik: satu kata satu pop, stagger 3 frame */}
      <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center", padding: "0 60px" }}>
        {words.map((w, i) => {
          const at = 48 + i * 3;
          const s = frame < at ? 0 : spring({ frame: frame - at, fps, config: { stiffness: 300, damping: 13 } });
          const red = w === "TIDAK" || w === "WAJIB";
          return (
            <span key={w} style={{ display: "inline-block", fontFamily: FONT.title, fontSize: 104, lineHeight: 1.05, color: red ? C.alertRed : "white", textShadow: "0 6px 0 rgba(0,0,0,0.55)", transform: `scale(${s})`, opacity: s, margin: "0 0.14em" }}>
              {w}
            </span>
          );
        })}
      </div>
    </Cam>
  );
};

/** Item kartu hukum: centang muncul progresif mengikuti narasi. */
const LawItem: React.FC<{ at: number; children: React.ReactNode; big?: React.ReactNode }> = ({ at, children, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { stiffness: 300, damping: 14 } });
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 26, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`, opacity: s }}>
      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: "50%", background: "#c0241c", color: "white", fontFamily: FONT.title, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>✓</div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 33, lineHeight: 1.3, color: C.ink }}>
        {children}
        {big}
      </div>
    </div>
  );
};

/** Shot 7 (0–151): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Sari menunjuk item 1-2 (0-48f), lalu 3-4 (48-108f), item 5 tercentang (108f+).
  const pointY = frame < 48 ? 0 : frame < 108 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Sari kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={SARI}
          pose={{ ...STAND, armF: [1.35, 0.12], armB: [-0.15, 0.1], lean: 0.04, headTilt: pointY === 2 ? 0 : -0.04 }}
          mood="determined"
          lookAt={1}
        />
      </svg>
      {/* kartu hukum krem */}
      <div
        style={{
          position: "absolute", left: 400, top: 260, width: 620, background: C.paper, border: `5px solid ${C.ink}`,
          boxShadow: "10px 12px 0 rgba(0,0,0,0.45)", padding: "30px 34px 40px", transform: `scale(${cardIn})`, opacity: cardIn,
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.alertRed }}>PASAL 125 AYAT 1</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · KERJA DI HARI LIBUR</div>
        <div style={{ height: 4, background: C.ink, marginTop: 20, opacity: 0.85 }} />
        <LawItem at={0}>Tidak wajib kerja di hari libur resmi</LawItem>
        <LawItem at={19}>Kalau bekerja, wajib dibayar upah lembur</LawItem>
        <LawItem at={48}>
          <div>Jam 1–7 dibayar</div>
          <div>
            <span style={{ fontFamily: FONT.title, fontSize: 72, color: "#c0241c", lineHeight: 1 }}>2×</span>
            <span> upah sejam</span>
          </div>
          <div style={{ fontSize: 26, color: "#6b675f", marginTop: 4 }}>(pola 6 hari kerja)</div>
        </LawItem>
        <LawItem at={77}>Upah 1 jam = upah pokok + tunjangan tetap ÷ 173</LawItem>
        <LawItem at={108}>Pasal 125 ayat 1 dan ayat 3</LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–72): Sari jalan kembali ke minimarket membawa surat UU. */
const Shot08a: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 72], [120, 700], { extrapolateRight: "clamp" });
  return (
    <Cam dur={72} from={1} to={1.03} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <rect x={0} y={1400} width={1080} height={520} fill="#8a7a5c" />
        <rect x={0} y={1400} width={1080} height={18} fill="#6b5e46" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={SARI}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="relieved"
          holdF={
            <g transform="rotate(-8)">
              <rect x={-70} y={-90} width={120} height={160} fill="white" stroke={C.ink} strokeWidth={5} />
              <line x1={-52} y1={-58} x2={32} y2={-58} stroke={C.ink} strokeWidth={4} />
              <line x1={-52} y1={-30} x2={32} y2={-30} stroke={C.ink} strokeWidth={4} />
              <line x1={-52} y1={-2} x2={32} y2={-2} stroke={C.ink} strokeWidth={4} />
              <text x={-19} y={42} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#c0241c">UU</text>
            </g>
          }
        />
      </Canvas>
    </Cam>
  );
};

/** Shot 8b (0–140): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
const Shot08b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 260, damping: 13 } });
  const line = frame < 30 ? 0 : spring({ frame: frame - 30, fps, config: { stiffness: 260, damping: 13 } });
  const q = frame < 72 ? 0 : spring({ frame: frame - 72, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", transform: `scale(${title})`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 118, color: "white", textShadow: "0 6px 16px rgba(0,0,0,0.8)" }}>CERITA PEKERJA</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#c9c4b4", marginTop: 16 }}>SETIAP PEKERJA PUNYA CERITA</div>
      </div>
      <div style={{ position: "absolute", top: 820, width: "100%", textAlign: "center", transform: `scale(${line})`, opacity: line }}>
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Hari liburmu bukan gratis.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah disuruh masuk di hari libur? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–212): kembali bekerja -> end card. */
const Shot08: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={72}>
      <Shot08a />
    </Sequence>
    <Sequence from={72}>
      <Shot08b />
    </Sequence>
  </>
);

export const EP12: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 142, words: timedCaptions([["Hari", 0, 440], ["Raya.", 440, 1020], ["Semua", 1640, 2040], ["orang", 2040, 2400], ["pulang", 2400, 2800], ["kampung.", 2800, 3260], ["Sari", 3800, 4320], ["justru", 4320, 4880], ["disuruh", 4880, 5220], ["masuk", 5220, 5400], ["kerja.", 5400, 5880]], 0), yellow: ["RAYA", "MASUK", "KERJA"] },
    { start: 142, end: 290, words: timedCaptions([["Sari", 6320, 6920], ["kasir", 6920, 7660], ["minimarket", 7660, 8140], ["di", 8140, 8340], ["kota", 8340, 8520], ["ini.", 8520, 8780], ["Dua", 9400, 9640], ["tahun", 9640, 9920], ["bekerja", 9920, 10340], ["di sini,", 10340, 10700], ["tidak", 11080, 11300], ["pernah", 11300, 11580], ["sekalipun", 11580, 12080], ["absen.", 12080, 12480]], 5900), yellow: ["DUA", "TAHUN", "ABSEN"] },
    { start: 290, end: 468, words: timedCaptions([["Sehari", 12980, 13460], ["sebelum", 13460, 13820], ["lebaran,", 13820, 14280], ["atasannya", 14760, 15100], ["bilang.", 15100, 15400], ["Toko", 16020, 16400], ["tetap", 16400, 16640], ["buka,", 16640, 16960], ["dan", 17340, 17540], ["semua", 17540, 17820], ["kasir", 17820, 18220], ["wajib", 18220, 18540], ["masuk.", 18540, 18800], ["Sari", 19300, 19660]], 12100), yellow: ["LEBARAN", "WAJIB", "MASUK"] },
    { start: 468, end: 607, words: timedCaptions([["protes.", 19660, 20160], ["Tapi", 20620, 21000], ["atasannya", 21000, 21480], ["mengancam.", 21480, 21980], ["Kalau", 22500, 22760], ["tidak", 22760, 22960], ["masuk,", 22960, 23320], ["gajinya", 23760, 24000], ["dipotong.", 24000, 24480], ["Sari", 24920, 25340]], 19500), yellow: ["PROTES", "DIPOTONG"] },
    { start: 607, end: 828, words: timedCaptions([["masuk.", 25340, 25560], ["Gajian", 26160, 26520], ["tiba,", 26520, 26840], ["upahnya", 27400, 27800], ["tetap", 27800, 28160], ["seperti", 28160, 28320], ["biasa.", 28320, 28780], ["Tidak", 28780, 29660], ["ada", 29660, 29800], ["upah", 29800, 30020], ["lembur", 30020, 30340], ["hari", 30340, 30560], ["Libur.", 30560, 30980], ["Padahal", 31420, 31960], ["ia", 31960, 32160], ["bekerja", 32160, 32620], ["di", 32620, 32740], ["hari", 32740, 32880], ["semua", 32880, 33140], ["orang", 33140, 33360], ["Libur.", 33360, 33800], ["Undang-Undang", 34220, 34860]], 25300), yellow: ["LEMBUR", "LIBUR"] },
    { start: 828, end: 979, words: timedCaptions([["No.", 34860, 35000], ["27", 35140, 35580], ["Tahun", 35580, 36140], ["2026.", 36140, 37060], ["Pasal", 37560, 37940], ["125", 37940, 38420], ["ayat", 38420, 39160], ["1.", 39160, 39440], ["Pekerja", 40040, 40440], ["tidak", 40440, 40600], ["wajib", 40600, 40980]], 34500), yellow: ["TIDAK", "WAJIB", "LIBUR"] },
    { start: 979, end: 1130, words: timedCaptions([["bekerja", 40980, 41320], ["di", 41320, 41440], ["hari", 41440, 41540], ["Libur", 41540, 41800], ["resmi.", 41800, 42080], ["Kalau", 42600, 42820], ["bekerja,", 42820, 43300], ["jam", 43640, 43840], ["pertama", 43840, 44080], ["sampai", 44080, 44400], ["ketujuh", 44400, 44880], ["dibayar", 44880, 45220], ["dua", 45220, 45400], ["kali", 45400, 45620], ["upah", 45620, 45880], ["sejam.", 45880, 46240], ["Sari", 46720, 47060], ["kembali", 47060, 47320]], 40800), yellow: ["DUA", "KALI"] },
    { start: 1130, end: 1342, words: timedCaptions([["bekerja", 47320, 47740], ["keesokan", 47740, 48140], ["harinya,", 48140, 48480], ["dengan", 48940, 49160], ["surat", 49160, 49520], ["undang-undang", 49520, 50000], ["di", 50000, 50140], ["tangannya.", 50140, 50460], ["Hari", 51040, 51240], ["Liburmu", 51240, 51660], ["bukan", 51660, 51900], ["gratis.", 51900, 52460], ["Karena", 52840, 53180], ["setiap", 53180, 53620], ["pekerja", 53620, 54020], ["punya", 54020, 54300], ["cerita.", 54300, 54680]], 47100), yellow: ["GRATIS", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep12.mp3")} />
      <Sequence durationInFrames={142}>
        <Shot01 dur={142} />
      </Sequence>
      <Sequence from={142} durationInFrames={148}>
        <Shot02 dur={148} />
      </Sequence>
      <Sequence from={290} durationInFrames={178}>
        <Shot03 dur={178} />
      </Sequence>
      <Sequence from={468} durationInFrames={139}>
        <Shot04 dur={139} />
      </Sequence>
      <Sequence from={607} durationInFrames={221}>
        <Shot05 dur={221} />
      </Sequence>
      <Sequence from={828} durationInFrames={151}>
        <Shot06 dur={151} />
      </Sequence>
      <Sequence from={979} durationInFrames={151}>
        <Shot07 />
      </Sequence>
      <Sequence from={1130}>
        <Shot08 dur={212} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
