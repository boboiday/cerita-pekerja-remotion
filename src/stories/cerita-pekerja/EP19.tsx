import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { SIT, STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, SkylineFar, SkylineNear } from "../../kit/Backgrounds";

/**
 * EP19 — "Gaji di Bawah UMK" (24 fps, 1080x1920, 56.0 detik).
 * Bayu, 24 th, operator packing di Surabaya 8 bulan: gaji Rp4.200.000/bulan,
 * padahal UMK Kota Surabaya 2026 = Rp5.288.796/bulan (Kepgub Jatim
 * No. 100.3.3.1/937/013/2025). Selisih Rp1.088.796/bulan; 8 bulan total
 * kurang bayar Rp8.710.368. HRD: "perusahaan belum mampu" — tapi
 * perusahaan tidak pernah mengajukan pengecualian ke gubernur, satu-satunya
 * jalan legal membayar di bawah UMK.
 * Hukum: UU 27/2026 Pasal 140 ayat (5) — "Pengusaha dilarang membayar Upah
 * lebih rendah dari Upah minimum." + Pasal 140 ayat (1) (UMK berlaku bagi
 * pekerja < 1 tahun) + Pasal 140 ayat (6) (pengecualian hanya lewat
 * gubernur, bipartit + audit) + Pasal 288 ayat (1) (penjara maks 4 tahun
 * dan/atau denda maks kategori IV = Rp200 juta).
 * VO: Sulafat 56.00 dtk (public/voice_over_ep19.mp3; raw 68.85 dtk, trim +
 * atempo 1.221), word timings dari alignment.json faster-whisper small
 * (103 kata; koreksi: peking->packing, Dipapan->Di papan, Undang + -undang
 * ->Undang-Undang, angka dieja, Tahun/Pasal kapital).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 * Perbaikan gambar kecil vs EP18: set pabrik plastik BARU yang detail
 * (mesin packing + konveyor + kardus + papan pengumuman UMK + papan
 * PABRIK SURABAYA) + prop slip gaji + salinan pasal sebagai prop kunci.
 */

export const EP19_TOTAL = 1344; // 56.00 s @ 24 fps

/** Bayu: kemeja putih, dasi hitam, celana hitam + name tag "BAYU". */
const BAYU: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f", nameTag: "BAYU" };
/** Bu Ratna (HRD): blus hijau-teal, rambut bun. */
const RATNA: Look = { body: "#3f7a6a", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };

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

/** Matahari pagi + langit krem (dipakai S01/S02/S08). */
const MorningSky: React.FC = () => (
  <g>
    <circle cx={880} cy={250} r={92} fill="#db483b" opacity={0.9} />
    <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
  </g>
);

/** Slip gaji: kertas putih + "SLIP GAJI" + "Rp4.200.000" merah. */
const PaySlip: React.FC = () => (
  <g>
    <rect x={-70} y={-90} width={140} height={200} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={17} fill={C.ink} textAnchor="middle">SLIP GAJI</text>
    <line x1={-52} y1={-44} x2={52} y2={-44} stroke="#b9b6ae" strokeWidth={3} />
    <text x={0} y={-6} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill="#c0241c" textAnchor="middle">Rp4.200.000</text>
    <line x1={-52} y1={12} x2={52} y2={12} stroke="#b9b6ae" strokeWidth={3} />
    <text x={0} y={44} fontFamily={FONT.mono} fontWeight={700} fontSize={14} fill="#6b675f" textAnchor="middle">BAYU</text>
    <text x={0} y={66} fontFamily={FONT.mono} fontWeight={700} fontSize={14} fill="#6b675f" textAnchor="middle">NOV 2026</text>
    <path d="M-70,110 L-52,96 L-35,110 L-18,96 L0,110 L18,96 L35,110 L52,96 L70,110 L70,90 L-70,90 Z" fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Amplop gaji: amplop krem + segel merah "GAJI". */
const Envelope: React.FC = () => (
  <g>
    <rect x={-80} y={-55} width={160} height={110} fill="#f5f2e8" stroke={C.ink} strokeWidth={5} />
    <path d="M-80,-55 L0,25 L80,-55" fill="none" stroke={C.ink} strokeWidth={4} />
    <path d="M-80,55 L-10,-5 L80,55" fill="none" stroke={C.ink} strokeWidth={4} />
    <circle cx={0} cy={0} r={20} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={6} fontFamily={FONT.mono} fontWeight={800} fontSize={12} fill="#fdf8ea" textAnchor="middle">GAJI</text>
  </g>
);

/** Map cokelat berlabel PASAL 140 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 30 : 24} fill="#fdf8ea" textAnchor="middle">140</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Papan pengumuman UMK: papan cokelat + kertas UMK SURABAYA 2026. */
const AnnouncementBoard: React.FC = () => (
  <g>
    <rect x={-260} y={-190} width={520} height={380} fill="#6b4a38" stroke={C.ink} strokeWidth={6} />
    <rect x={-230} y={-160} width={460} height={320} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-104} fontFamily={FONT.mono} fontWeight={800} fontSize={34} fill={C.ink} textAnchor="middle">UMK SURABAYA</text>
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">2026</text>
    <text x={0} y={14} fontFamily={FONT.mono} fontWeight={800} fontSize={44} fill="#c0241c" textAnchor="middle">Rp5.288.796</text>
    <text x={0} y={66} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">Kepgub Jatim</text>
    <text x={0} y={96} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">100.3.3.1/937/013/2025</text>
  </g>
);

/** Set pabrik plastik: dinding + jendela + papan UMK + mesin packing + konveyor + kardus + papan PABRIK SURABAYA. */
const FactoryBg: React.FC = () => (
  <g>
    {/* dinding + jendela tinggi */}
    <rect x={0} y={0} width={1080} height={1420} fill="#e8e0c8" />
    <rect x={70} y={180} width={260} height={300} fill="#cfe3ee" stroke={C.ink} strokeWidth={5} />
    <line x1={200} y1={180} x2={200} y2={480} stroke={C.ink} strokeWidth={4} />
    <line x1={70} y1={330} x2={330} y2={330} stroke={C.ink} strokeWidth={4} />
    <circle cx={900} cy={280} r={70} fill="#ffe9a8" opacity={0.8} />
    {/* papan nama pabrik */}
    <rect x={380} y={200} width={640} height={100} fill="#23282e" stroke={C.ink} strokeWidth={5} />
    <text x={700} y={268} fontFamily={FONT.mono} fontWeight={800} fontSize={46} fill="#fdf8ea" textAnchor="middle">PABRIK SURABAYA</text>
    {/* papan pengumuman UMK */}
    <g transform="translate(540,760)">
      <AnnouncementBoard />
    </g>
    {/* mesin packing: badan + corong + tombol */}
    <g>
      <rect x={80} y={980} width={220} height={220} rx={12} fill="#3f7a6a" stroke={C.ink} strokeWidth={5} />
      <rect x={110} y={900} width={160} height={80} fill="#2f5d52" stroke={C.ink} strokeWidth={4} />
      <circle cx={130} cy={1040} r={16} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
      <circle cx={180} cy={1040} r={16} fill="#ffe9a8" stroke={C.ink} strokeWidth={3} />
      <circle cx={230} cy={1040} r={16} fill="#3a3a3f" stroke={C.ink} strokeWidth={3} />
      <rect x={110} y={1100} width={160} height={60} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
      <text x={190} y={1140} fontFamily={FONT.mono} fontWeight={800} fontSize={22} fill={C.ink} textAnchor="middle">PACKING</text>
    </g>
    {/* konveyor: sabuk + rol */}
    <g>
      <rect x={330} y={1150} width={420} height={50} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
      {[360, 430, 500, 570, 640, 710].map((cx, i) => (
        <circle key={i} cx={cx} cy={1175} r={16} fill="#5c564a" stroke={C.ink} strokeWidth={3} />
      ))}
      <rect x={360} y={1080} width={120} height={70} fill="#c49a6a" stroke={C.ink} strokeWidth={3} />
      <line x1={420} y1={1080} x2={420} y2={1150} stroke="#7a5a34" strokeWidth={3} />
      <rect x={560} y={1090} width={110} height={60} fill="#b98a5a" stroke={C.ink} strokeWidth={3} />
      <line x1={615} y1={1090} x2={615} y2={1150} stroke="#7a5a34" strokeWidth={3} />
    </g>
    {/* kardus bertumpuk kanan */}
    <g>
      <rect x={830} y={1020} width={170} height={130} fill="#c49a6a" stroke={C.ink} strokeWidth={4} />
      <line x1={915} y1={1020} x2={915} y2={1150} stroke="#7a5a34" strokeWidth={3} />
      <rect x={850} y={900} width={130} height={120} fill="#b98a5a" stroke={C.ink} strokeWidth={4} />
      <line x1={915} y1={900} x2={915} y2={1020} stroke="#7a5a34" strokeWidth={3} />
      <rect x={830} y={1150} width={170} height={50} fill="#a87a4a" stroke={C.ink} strokeWidth={3} />
    </g>
  </g>
);

/** Shot 1 (0–240): rumah malam. Bayu membuka amplop gaji di meja, pill + big text. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–80f): Bayu berdiri di meja, pill muncul. Beat 2 (80–160f): angkat amplop. Beat 3 (160–240f): big text.
  const showEnvelope = frame >= 80;
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        {/* meja + lampu meja + amplop */}
        <rect x={180} y={1150} width={720} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={1176} width={680} height={224} fill="#4a3428" />
        <rect x={780} y={980} width={14} height={170} fill={C.ink} />
        <path d="M787,980 L700,930 L874,930 Z" fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
        <circle cx={787} cy={975} r={26} fill="#ffe9a8" opacity={0.85} />
        <g transform="translate(560,1090)">
          <Envelope />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick x={300} floor={FLOOR} scale={0.95} look={BAYU} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.06 }} mood="worried" lookAt={0.5} holdF={showEnvelope ? <Envelope /> : undefined} />
      </Canvas>
      {/* pill hook */}
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 52, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          RP4,2 <span style={{ color: C.capYellow }}>JUTA.</span>
        </span>
      </div>
      <KineticText words={["GAJI", "RP4,2", "JUTA"]} at={160} stagger={3} top={460} fontSize={96} accent={["JUTA"]} />
    </Camera>
  );
};

/** Shot 2 (0–202): tracking shot jalan pagi. Bayu menyeberang penuh kiri -> kanan, parallax 2 lapis, gerbang pabrik di kanan. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 130;
  return (
    <Camera dur={dur} move="static">
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
        {/* gerbang pabrik */}
        <g>
          <rect x={800} y={1080} width={220} height={320} fill="#23282e" stroke={C.ink} strokeWidth={5} />
          <text x={910} y={1180} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill="#fdf8ea" textAnchor="middle">PABRIK</text>
          <text x={910} y={1220} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill="#fdf8ea" textAnchor="middle">SURABAYA</text>
        </g>
        <Stick x={x} floor={FLOOR} scale={0.95} look={BAYU} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["8", "BULAN", "OPERATOR", "PACKING"]} at={60} stagger={3} top={420} fontSize={80} accent={["PACKING"]} />
    </Camera>
  );
};

/** Shot 3 (0–165): pabrik plastik. Bayu membaca papan pengumuman UMK; big text merah. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–55f): Bayu masuk, melihat papan (worried). Beat 2 (55–110f): "UMK SURABAYA RP5.288.796" (shocked). Beat 3 (110–165f): menatap angka, menunduk (sad).
  const mood = frame < 55 ? "worried" : frame < 110 ? "shocked" : "sad";
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%" shake={2}>
      <Canvas bg="#f7f1e3">
        <FactoryBg />
        <Stick
          x={540}
          floor={FLOOR}
          scale={0.95}
          look={BAYU}
          pose={{ ...STAND, armF: [0.4, 0.5], armB: [0.3, 0.5], lean: 0.03, headTilt: frame >= 110 ? 0.2 : 0.06 }}
          mood={mood}
          lookAt={0.5}
        />
      </Canvas>
      <KineticText words={["UMK", "SURABAYA", "RP5.288.796"]} at={55} stagger={3} top={420} fontSize={76} accent={["RP5.288.796"]} />
    </Camera>
  );
};

/** Shot 4 (0–92): close-up Bayu membandingkan slip gaji dengan pengumuman, kamera lebih dekat. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 46 ? "shocked" : "sad";
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%" shake={1}>
      <Canvas bg="#f7f1e3">
        <FactoryBg />
        <Stick
          x={540}
          floor={FLOOR}
          scale={1.15}
          look={BAYU}
          pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.18 }}
          mood={mood}
          lookAt={0.5}
          holdF={<PaySlip />}
        />
      </Canvas>
      <KineticText words={["SELISIH", "RP1.088.796"]} at={30} stagger={3} top={420} fontSize={84} accent={["RP1.088.796"]} />
    </Camera>
  );
};

/** Shot 5a (0–120): kantor HRD. Bu Ratna bilang perusahaan belum mampu; Bayu memegang slip gaji. */
const Shot05a: React.FC = () => {
  const frame = useCurrentFrame();
  const dismiss = frame >= 60;
  return (
    <Camera dur={120} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        {/* kantor HRD: meja + kursi + papan */}
        <rect x={0} y={0} width={1080} height={1420} fill="#e8e0c8" />
        <rect x={360} y={200} width={360} height={90} fill="#23282e" stroke={C.ink} strokeWidth={5} />
        <text x={540} y={262} fontFamily={FONT.mono} fontWeight={800} fontSize={44} fill="#fdf8ea" textAnchor="middle">HRD</text>
        <rect x={60} y={1180} width={600} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={80} y={1206} width={560} height={194} fill="#4a3428" />
        <rect x={140} y={1090} width={180} height={90} fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
        <Stick x={300} floor={FLOOR} scale={0.95} look={BAYU} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: 0.03, headTilt: 0.1 }} mood="sad" lookAt={1} holdF={<PaySlip />} />
        <Stick x={780} floor={FLOOR} scale={1.0} look={RATNA} pose={{ ...STAND, armF: dismiss ? [-1.5, -0.15] : [0.3, 0.1], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 }} mood="determined" lookAt={-0.6} />
      </Canvas>
      <KineticText words={["BELUM", "MAMPU?"]} at={60} stagger={3} top={420} fontSize={96} accent={["MAMPU?"]} />
    </Camera>
  );
};

/** Shot 5b (0–71): kembali ke rumah malam. Bayu duduk murung menatap slip gaji di meja. */
const Shot05b: React.FC = () => {
  return (
    <Camera dur={71} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        {/* meja + slip gaji */}
        <rect x={180} y={1150} width={720} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={1176} width={680} height={224} fill="#4a3428" />
        <g transform="translate(560,1090)">
          <PaySlip />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick x={300} floor={FLOOR} scale={0.95} look={BAYU} pose={SIT} mood="sad" lookAt={0.9} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5 (0–191): kantor HRD -> rumah malam (cut internal lewat slip gaji). */
const Shot05: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={120}>
      <Shot05a />
    </Sequence>
    <Sequence from={120}>
      <Shot05b />
    </Sequence>
  </>
);

/** Shot 6 (0–138): rumah malam. Bayu mengangkat salinan pasal; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–48f): jalan masuk ke meja. Beat 2 (48–100f): angkat pasal + big text stagger. Beat 3 (100–138f): menatap big text.
  const walking = frame < 48;
  const x = walking ? interpolate(frame, [0, 48], [80, 420], { extrapolateRight: "clamp" }) : 420;
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
          {frame < 48 ? <PasalFolder big /> : null}
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={BAYU}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 48 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["DILARANG", "BAYAR", "DI", "BAWAH", "UMK"]} at={48} stagger={3} top={420} fontSize={80} accent={["UMK"]} />
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

/** Shot 7 (0–91): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Bayu menunjuk item 1-2 (0–36f), lalu 3-4 (36–72f), item 5 tercentang (72f+).
  const pointY = frame < 36 ? 0 : frame < 72 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Bayu kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={BAYU}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: C.alertRed }}>PASAL 140 AYAT 5</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · UPAH MINIMUM</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          Pengusaha dilarang membayar upah lebih rendah dari upah minimum
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 140 ayat 5)</div>
          <span style={{ fontFamily: FONT.title, fontSize: 64, color: "#c0241c", lineHeight: 1 }}>140</span>
        </LawItem>
        <LawItem at={18}>
          Upah minimum berlaku bagi pekerja &lt; 1 tahun
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 140 ayat 1)</div>
        </LawItem>
        <LawItem at={36}>
          Pengecualian hanya lewat gubernur — bipartit + audit
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 140 ayat 6)</div>
        </LawItem>
        <LawItem at={54}>
          Pelanggar: penjara maks 4 tahun dan/atau denda maks Rp200 juta
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 288 ayat 1)</div>
        </LawItem>
        <LawItem at={72}>
          Selisih 8 bulan Bayu: Rp8.710.368 harus dibayar
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–110): Bayu jalan kembali ke pabrik membawa salinan pasal. */
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
          look={BAYU}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–115): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
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
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Selisih delapan bulan harus dibayar.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Gajimu pernah di bawah UMK? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–225): kembali bekerja -> end card. */
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

export const EP19: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 267, words: timedCaptions([["Bayu", 0, 520], ["membuka", 520, 1080], ["amplop", 1080, 1660], ["gajinya,", 1660, 2180], ["empat", 2680, 3240], ["juta", 3240, 3740], ["dua", 3740, 3980], ["ratus", 3980, 4220], ["ribu", 4220, 4920], ["rupiah.", 4920, 5320], ["Di", 6200, 6410], ["papan", 6410, 6620], ["pengumuman", 6620, 7180], ["pabrik,", 7180, 7620], ["tertulis", 7940, 8580], ["angka", 8580, 8940], ["yang", 8940, 9120], ["jauh", 9120, 9520], ["lebih", 9520, 9680], ["besar.", 9680, 9980]], 0), yellow: ["GAJI", "EMPAT", "JUTA", "PENGUMUMAN"] },
    { start: 267, end: 468, words: timedCaptions([["Bayu", 11130, 11630], ["operator", 11630, 12170], ["packing", 12170, 12630], ["di", 12630, 12830], ["Surabaya.", 12830, 13210], ["Delapan", 13970, 14310], ["bulan", 14310, 14650], ["bekerja,", 14650, 15150], ["gajinya", 15530, 15850], ["tak", 15850, 16050], ["pernah", 16050, 16270], ["naik,", 16270, 16630], ["dan", 17010, 17210], ["tak", 17210, 17370], ["pernah", 17370, 17650], ["ia", 17650, 17910], ["tanyakan.", 17910, 18350]], 11130), yellow: ["SURABAYA", "DELAPAN", "BULAN", "PACKING"] },
    { start: 468, end: 639, words: timedCaptions([["Ternyata", 19480, 20040], ["UMK", 20040, 20700], ["Surabaya", 20700, 21240], ["lima", 21240, 21720], ["juta", 21720, 22260], ["dua", 22260, 22540], ["ratus", 22540, 22820], ["delapan", 22820, 23100], ["puluh", 23100, 23380], ["delapan", 23380, 23660], ["ribu", 23660, 24220], ["tujuh", 24220, 24436], ["ratus", 24436, 24652], ["sembilan", 24652, 24868], ["puluh", 24868, 25084], ["enam", 25084, 25300], ["rupiah.", 25300, 26060]], 19480), yellow: ["UMK", "SURABAYA", "LIMA", "JUTA"] },
    { start: 639, end: 722, words: timedCaptions([["Selisihnya", 26640, 27380], ["lebih", 27380, 27620], ["dari", 27620, 27920], ["satu", 27920, 28180], ["juta", 28180, 28500], ["setiap", 28500, 28840], ["bulan.", 28840, 29140]], 26640), yellow: ["SELISIH", "SATU", "JUTA", "BULAN"] },
    { start: 722, end: 912, words: timedCaptions([["HRD", 30100, 30720], ["menjawab.", 30720, 31240], ["Perusahaan", 31800, 32440], ["belum", 32440, 32600], ["mampu,", 32600, 33060], ["tapi", 33360, 33940], ["tak", 33940, 34140], ["ada", 34140, 34320], ["surat", 34320, 34600], ["pengecualian", 34600, 35200], ["dari", 35200, 35440], ["Gubernur.", 35440, 35940], ["Hanya", 36360, 36660], ["alasan.", 36660, 37060]], 30100), yellow: ["HRD", "BELUM", "MAMPU", "GUBERNUR"] },
    { start: 912, end: 1045, words: timedCaptions([["Undang-Undang", 38000, 38640], ["Nomor", 38640, 38880], ["27", 38880, 39340], ["Tahun", 39340, 39800], ["2026,", 39800, 40740], ["Pasal", 41200, 41480], ["140", 41480, 41980], ["ayat", 41980, 42580], ["5.", 42580, 42820]], 38000), yellow: ["UNDANG-UNDANG", "PASAL", "140"] },
    { start: 1045, end: 1142, words: timedCaptions([["Pengusaha", 43560, 44120], ["dilarang", 44120, 44600], ["membayar", 44600, 44940], ["upah", 44940, 45240], ["lebih", 45240, 45500], ["rendah", 45500, 45900], ["dari", 45900, 46100], ["upah", 46100, 46400], ["minimum.", 46400, 46640]], 43560), yellow: ["PENGUSAHA", "DILARANG", "MINIMUM"] },
    { start: 1142, end: 1344, words: timedCaptions([["Bayu", 47570, 48030], ["kembali", 48030, 48430], ["keesokan", 48430, 48930], ["harinya,", 48930, 49290], ["dengan", 49650, 49890], ["salinan", 49890, 50330], ["pasal", 50330, 50690], ["di", 50690, 50830], ["tangannya.", 50830, 51190], ["Selisih", 51810, 52250], ["delapan", 52250, 52510], ["bulan", 52510, 52870], ["harus", 52870, 53090], ["dibayar,", 53090, 53590], ["karena", 53910, 54190], ["setiap", 54190, 54630], ["pekerja", 54630, 55070], ["punya", 55070, 55470], ["cerita.", 55470, 55810]], 47570), yellow: ["SALINAN", "PASAL", "DELAPAN", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep19.mp3")} />
      <Sequence durationInFrames={240}>
        <Shot01 dur={240} />
      </Sequence>
      <Sequence from={240} durationInFrames={202}>
        <Shot02 dur={202} />
      </Sequence>
      <Sequence from={442} durationInFrames={165}>
        <Shot03 dur={165} />
      </Sequence>
      <Sequence from={607} durationInFrames={92}>
        <Shot04 dur={92} />
      </Sequence>
      <Sequence from={699} durationInFrames={191}>
        <Shot05 dur={191} />
      </Sequence>
      <Sequence from={890} durationInFrames={138}>
        <Shot06 dur={138} />
      </Sequence>
      <Sequence from={1028} durationInFrames={91}>
        <Shot07 />
      </Sequence>
      <Sequence from={1119}>
        <Shot08 dur={225} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
