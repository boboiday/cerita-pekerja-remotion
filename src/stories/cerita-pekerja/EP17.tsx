import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { CARRY, SIT, STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, SkylineFar, SkylineNear } from "../../kit/Backgrounds";
import { PASSENGERS } from "../../kit/Stick";

/**
 * EP17 — "Sakit Dianggap Bolos" (24 fps, 1080x1920, 55.0 detik).
 * Tono, operator mesin jahit di pabrik garmen Sidoarjo 5 tahun: sakit
 * demam 39°C dengan surat dokter 3 hari, tetap dianggap bolos — gaji
 * 3 hari dipotong dan diancam surat peringatan.
 * Hukum: UU 27/2026 Pasal 149 ayat (2) huruf a + ayat (3) — sakit →
 * upah wajib dibayar, 4 bulan pertama 100% — + Pasal 231 huruf j
 * (mangkir = 5 hari berturut-turut TANPA keterangan tertulis berbukti
 * sah; surat dokter = bukti sah). TIDAK ADA pasal "larangan menganggap
 * sakit sebagai bolos" khusus; tidak ada klaim pembatalan sanksi otomatis.
 * VO: Sulafat 54.98 dtk (public/voice_over_ep17.mp3), word timings dari
 * alignment.json faster-whisper (117 kata; "Tonno"->"Tono",
 * "dikasur"->"di kasur", "doktor"->"dokter", "Sido"+"Arjo"->"Sidoarjo",
 * "5"->"Lima", "telefon"->"telepon", "100"->"seratus",
 * "Undang"+"-undang"->"Undang-Undang").
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 * Perbaikan gambar kecil vs EP14: set pabrik garmen baru yang detail
 * (meja mesin jahit + gulungan kain + rak benang + pakaian gantung +
 * jendela pabrik) + prop termometer + surat dokter sebagai prop kunci.
 */

export const EP17_TOTAL = 1320; // 55.0 s @ 24 fps

/** Tono: kemeja putih, dasi hitam, celana hitam + name tag "TONO". */
const TONO: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f", nameTag: "TONO" };
/** Pak Darman (mandor): kemeja biru-abu, dasi merah. */
const DARMAN: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };
/** Lilis (istri Tono): ungu, rambut bun. */
const LILIS: Look = { body: "#8a5bb5", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };

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

/** Surat dokter: kertas putih + stempel merah "SURAT DOKTER" + "3 hari". */
const DoctorNote: React.FC = () => (
  <g>
    <rect x={-55} y={-80} width={110} height={190} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={-40} y1={-60} x2={40} y2={-60} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-40} y1={-44} x2={40} y2={-44} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-40} y1={-28} x2={40} y2={-28} stroke="#b9b6ae" strokeWidth={3} />
    <text x={0} y={-8} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">SURAT</text>
    <text x={0} y={16} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">DOKTER</text>
    <circle cx={0} cy={58} r={26} fill="none" stroke="#c0241c" strokeWidth={4} />
    <text x={0} y={64} fontFamily={FONT.mono} fontWeight={800} fontSize={13} fill="#c0241c" textAnchor="middle">3 HARI</text>
    <path d="M-55,110 L-40,96 L-25,110 L-10,96 L5,110 L20,96 L35,110 L55,96 L55,110 Z" fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Termometer kecil dengan angka 39. */
const Thermometer: React.FC = () => (
  <g>
    <rect x={-11} y={-90} width={22} height={150} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <circle cx={0} cy={70} r={26} fill="#c0241c" stroke={C.ink} strokeWidth={5} />
    <rect x={-4} y={-20} width={8} height={80} fill="#c0241c" />
    <text x={30} y={-40} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill="#c0241c">39°C</text>
  </g>
);

/** Map cokelat berlabel PASAL 149 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 30 : 24} fill="#fdf8ea" textAnchor="middle">149</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Kasur + bantal + selimut merah (kamar Tono). */
const Bed: React.FC = () => (
  <g>
    <rect x={60} y={1180} width={500} height={60} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={60} y={1120} width={500} height={60} fill="#f5f2e8" stroke={C.ink} strokeWidth={5} />
    <rect x={80} y={1130} width={130} height={40} rx={14} fill="#ffffff" stroke={C.ink} strokeWidth={3} />
    <rect x={230} y={1130} width={310} height={50} fill="#b3352b" />
    <rect x={60} y={1240} width={500} height={160} fill="#4a3428" />
  </g>
);

/** Meja kecil kamar: termometer + gelas obat. */
const Nightstand: React.FC = () => (
  <g>
    <rect x={820} y={1150} width={180} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={840} y={1176} width={140} height={224} fill="#4a3428" />
    <g transform="translate(880,1090)">
      <Thermometer />
    </g>
    <rect x={940} y={1080} width={44} height={70} fill="#cfe3ee" stroke={C.ink} strokeWidth={4} />
    <rect x={940} y={1080} width={44} height={18} fill="#7fb3d5" />
  </g>
);

/** Set pabrik garmen: meja mesin jahit + gulungan kain + rak benang + pakaian gantung + jendela. */
const GarmentFactoryBg: React.FC = () => (
  <g>
    {/* dinding + jendela pabrik */}
    <rect x={0} y={0} width={1080} height={1420} fill="#e8e0c8" />
    <rect x={70} y={180} width={260} height={300} fill="#cfe3ee" stroke={C.ink} strokeWidth={5} />
    <line x1={200} y1={180} x2={200} y2={480} stroke={C.ink} strokeWidth={4} />
    <line x1={70} y1={330} x2={330} y2={330} stroke={C.ink} strokeWidth={4} />
    <circle cx={900} cy={280} r={70} fill="#ffe9a8" opacity={0.8} />
    {/* rel pakaian gantung */}
    <line x1={60} y1={560} x2={1020} y2={560} stroke={C.ink} strokeWidth={6} />
    {[
      { x: 120, c: "#b3352b" }, { x: 230, c: "#3f7a4a" }, { x: 340, c: "#e2a748" },
      { x: 450, c: "#5a5a8a" }, { x: 560, c: "#8a5bb5" }, { x: 670, c: "#c0241c" },
    ].map(({ x, c }) => (
      <g key={x}>
        <path d={`M${x + 25},560 L${x + 25},590`} stroke={C.ink} strokeWidth={4} />
        <rect x={x} y={590} width={50} height={110} fill={c} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    {/* rak benang */}
    <rect x={760} y={760} width={260} height={16} fill="#6b4a38" stroke={C.ink} strokeWidth={3} />
    <rect x={760} y={880} width={260} height={16} fill="#6b4a38" stroke={C.ink} strokeWidth={3} />
    {[
      { x: 780, c: "#c0241c" }, { x: 830, c: "#3f7a4a" }, { x: 880, c: "#e2a748" },
      { x: 930, c: "#5a5a8a" }, { x: 780, c: "#8a5bb5", y: 880 }, { x: 830, c: "#b3352b", y: 880 },
      { x: 880, c: "#2f6f4f", y: 880 }, { x: 930, c: "#d97b2f", y: 880 },
    ].map(({ x, c, y = 760 }) => (
      <g key={`${x}-${y}`}>
        <rect x={x} y={y - 58} width={34} height={58} rx={6} fill={c} stroke={C.ink} strokeWidth={3} />
        <rect x={x + 8} y={y - 70} width={18} height={12} fill="#d9c9a8" stroke={C.ink} strokeWidth={2} />
      </g>
    ))}
    {/* gulungan kain */}
    {[
      { x: 90, c: "#b3352b" }, { x: 170, c: "#3f7a4a" }, { x: 250, c: "#e2a748" },
    ].map(({ x, c }) => (
      <g key={x}>
        <ellipse cx={x + 30} cy={1090} rx={30} ry={26} fill={c} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={x + 30} cy={1090} rx={12} ry={10} fill="#f5f2e8" stroke={C.ink} strokeWidth={3} />
        <rect x={x} y={1090} width={60} height={90} fill={c} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    {/* meja mesin jahit */}
    <rect x={60} y={1180} width={600} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={80} y={1206} width={560} height={194} fill="#4a3428" />
    <rect x={140} y={1090} width={180} height={90} fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
    <rect x={150} y={1050} width={160} height={40} fill="#cfe3ee" stroke={C.ink} strokeWidth={3} />
    <line x1={230} y1={1090} x2={230} y2={1040} stroke={C.ink} strokeWidth={4} />
    <rect x={340} y={1140} width={220} height={40} fill="#f5f2e8" stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Shot 1 (0–183): kamar pagi. Tono menggigil di kasur, termometer, surat dokter. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–60f): Tono duduk menggigil (wobble halus), pill muncul. Beat 2 (60–120f): termometer. Beat 3 (120–183f): angkat surat dokter.
  const shiver = Math.sin(frame * 0.9) * 3;
  const showNote = frame >= 120;
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <rect x={0} y={0} width={1080} height={1420} fill="#f7f1e3" />
        <rect x={700} y={180} width={260} height={300} fill="#cfe3ee" stroke={C.ink} strokeWidth={5} />
        <line x1={830} y1={180} x2={830} y2={480} stroke={C.ink} strokeWidth={4} />
        <line x1={700} y1={330} x2={960} y2={330} stroke={C.ink} strokeWidth={4} />
        <Bed />
        <Nightstand />
        <g transform={`translate(${shiver},0)`}>
          <Stick x={300} floor={FLOOR} scale={0.95} look={TONO} pose={{ ...SIT, headTilt: 0.14, lean: 0.05 }} mood="tired" lookAt={0.5} holdF={showNote ? <DoctorNote /> : undefined} />
        </g>
      </Canvas>
      {/* pill hook */}
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 52, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          DEMAM <span style={{ color: C.capYellow }}>39°C.</span>
        </span>
      </div>
      <KineticText words={["SURAT", "DOKTER", "3", "HARI"]} at={120} stagger={3} top={460} fontSize={96} accent={["DOKTER"]} />
    </Camera>
  );
};

/** Shot 2 (0–173): tracking shot jalan pagi. Tono menyeberang penuh kiri -> kanan, parallax 2 lapis. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 110;
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
        <Stick x={x} floor={FLOOR} scale={0.95} look={TONO} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["5", "TAHUN", "OPERATOR", "MESIN", "JAHIT"]} at={60} stagger={3} top={420} fontSize={88} accent={["JAHIT"]} />
    </Camera>
  );
};

/** Shot 3 (0–199): kamar. Tono menerima telepon mandor; "KAMU BOLOS! GAJI DIPOTONG 3 HARI". */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–60f): HP berdering, Tono angkat (worried). Beat 2 (60–130f): "KAMU BOLOS!" (shocked). Beat 3 (130–199f): "GAJI DIPOTONG 3 HARI", Tono menunduk (sad).
  const mood = frame < 60 ? "worried" : frame < 130 ? "shocked" : "sad";
  const phoneUp = frame >= 30;
  const pose: Pose = phoneUp
    ? { ...SIT, armF: [1.1, 0.35], armB: [0.35, 0.55], lean: 0.04, headTilt: frame >= 130 ? 0.22 : 0.08 }
    : { ...SIT, headTilt: 0.1, lean: 0.02 };
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%" shake={2}>
      <Canvas bg="#f7f1e3">
        <rect x={0} y={0} width={1080} height={1420} fill="#f7f1e3" />
        <rect x={700} y={180} width={260} height={300} fill="#cfe3ee" stroke={C.ink} strokeWidth={5} />
        <line x1={830} y1={180} x2={830} y2={480} stroke={C.ink} strokeWidth={4} />
        <Bed />
        <Nightstand />
        <Stick
          x={300}
          floor={FLOOR}
          scale={0.95}
          look={TONO}
          pose={pose}
          mood={mood}
          lookAt={0.5}
          holdF={phoneUp ? <rect x={-16} y={-30} width={32} height={60} rx={6} fill="#23232a" stroke={C.ink} strokeWidth={3} /> : undefined}
        />
      </Canvas>
      <KineticText words={["KAMU", "BOLOS!"]} at={60} stagger={3} top={420} fontSize={120} accent={["BOLOS!"]} />
      <KineticText words={["GAJI", "DIPOTONG", "3", "HARI"]} at={130} stagger={3} top={580} fontSize={88} accent={["DIPOTONG"]} />
    </Camera>
  );
};

/** Shot 4 (0–80): close-up Tono menatap surat dokter, kamera lebih dekat. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%" shake={1}>
      <Canvas bg="#f7f1e3">
        <rect x={0} y={0} width={1080} height={1420} fill="#f7f1e3" />
        <rect x={700} y={180} width={260} height={300} fill="#cfe3ee" stroke={C.ink} strokeWidth={5} />
        <Bed />
        <Stick
          x={540}
          floor={FLOOR}
          scale={1.15}
          look={TONO}
          pose={{ ...SIT, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.18 }}
          mood="sad"
          lookAt={0.5}
          holdF={<DoctorNote />}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 5a (0–120): pabrik garmen. Tono menyerahkan surat; mandor menepis. */
const Shot05a: React.FC = () => {
  const frame = useCurrentFrame();
  const dismiss = frame >= 60;
  return (
    <Camera dur={120} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <GarmentFactoryBg />
        <Stick x={300} floor={FLOOR} scale={0.95} look={TONO} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: 0.03, headTilt: 0.1 }} mood="sad" lookAt={1} holdF={<DoctorNote />} />
        <Stick x={780} floor={FLOOR} scale={1.0} look={DARMAN} pose={{ ...STAND, armF: dismiss ? [-1.5, -0.15] : [0.3, 0.1], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 }} mood="determined" lookAt={-0.6} />
        <Stick x={960} floor={FLOOR} scale={0.85} look={PASSENGERS[1]} pose={STAND} mood="worried" lookAt={-0.8} />
        <Stick x={90} floor={FLOOR} scale={0.85} look={PASSENGERS[3]} pose={STAND} mood="worried" lookAt={0.8} />
      </Canvas>
      <KineticText words={["SURAT", "DOKTER", "GAMPANG", "DIBELI"]} at={60} stagger={3} top={420} fontSize={80} accent={["GAMPANG"]} />
    </Camera>
  );
};

/** Shot 5b (0–70): kembali ke rumah malam. Tono duduk murung, Lilis menyentuh bahu. */
const Shot05b: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={70} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230) scale(0.6)">
          <DoctorNote />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={TONO} pose={SIT} mood="sad" lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={LILIS} pose={{ ...STAND, armF: [-0.9, -0.2], armB: [-0.1, 0.1], headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5 (0–190): pabrik -> rumah malam (cut internal lewat surat dokter). */
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

/** Shot 6 (0–165): rumah malam. Tono mengangkat salinan pasal; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–48f): jalan masuk ke meja. Beat 2 (48–108f): angkat pasal + big text stagger. Beat 3 (108–165f): menatap big text.
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
          look={TONO}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 48 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["UPAH", "WAJIB", "DIBAYAR"]} at={48} stagger={3} top={420} fontSize={104} accent={["DIBAYAR"]} />
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

/** Shot 7 (0–130): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Tono menunjuk item 1-2 (0–52f), lalu 3-4 (52–104f), item 5 tercentang (104f+).
  const pointY = frame < 52 ? 0 : frame < 104 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Tono kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={TONO}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 38, letterSpacing: 2, color: C.alertRed }}>PASAL 149 AYAT 2 HURUF A</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · SAKIT &amp; UPAH</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          Sakit → upah wajib dibayar
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 149 ayat 2 huruf a)</div>
        </LawItem>
        <LawItem at={26}>
          4 bulan pertama 100%, lalu 75%, 50%, 25%
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 149 ayat 3)</div>
        </LawItem>
        <LawItem at={52}>
          Mangkir = 5 hari berturut-turut TANPA keterangan tertulis berbukti sah
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 231 huruf j)</div>
          <span style={{ fontFamily: FONT.title, fontSize: 64, color: "#c0241c", lineHeight: 1 }}>149</span>
        </LawItem>
        <LawItem at={78}>
          Surat dokter = bukti sah — sakit 3 hari bersurat BUKAN mangkir
        </LawItem>
        <LawItem at={104}>
          Potongan gaji 3 hari melanggar Pasal 149 — upah 100% penuh
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–72): Tono jalan kembali ke pabrik membawa salinan pasal. */
const Shot08a: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 72], [120, 700], { extrapolateRight: "clamp" });
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <CitySkylineBg variant="day" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={TONO}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–128): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
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
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Sakit bukan bolos.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah dianggap bolos padahal sakit? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–200): kembali bekerja -> end card. */
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

export const EP17: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 183, words: timedCaptions([["Pagi", 0, 320], ["itu,", 320, 760], ["Tono", 1220, 1520], ["menggigil", 1520, 2200], ["di", 2200, 2500], ["kasur,", 2500, 2800], ["demam", 3140, 3440], ["tiga", 3440, 3633], ["puluh", 3633, 3827], ["sembilan", 3827, 4020], ["derajat.", 4020, 4940], ["di", 5220, 5340], ["tangannya,", 5340, 5800], ["surat", 6280, 6540], ["dokter", 6540, 6900], ["tiga", 6900, 7300], ["hari.", 7300, 7620]], 0), yellow: ["PAGI", "TONO", "39", "SURAT", "DOKTER"] },
    { start: 183, end: 356, words: timedCaptions([["Tono,", 7960, 8400], ["operator", 8400, 8780], ["mesin", 8780, 9260], ["jahit", 9260, 9620], ["di", 9620, 9800], ["pabrik", 9800, 10100], ["garmen", 10100, 10440], ["Sidoarjo.", 10440, 11100], ["Lima", 11460, 11700], ["tahun", 11700, 12060], ["bekerja", 12060, 12500], ["di", 12500, 12620], ["sini,", 12620, 12900], ["belum", 13280, 13460], ["pernah", 13460, 13800], ["sekalipun", 13800, 14400], ["bolos.", 14400, 14840]], 7960), yellow: ["OPERATOR", "GARMEN", "SIDOARJO", "LIMA", "BOLOS"] },
    { start: 356, end: 555, words: timedCaptions([["Tiga", 15180, 15400], ["hari", 15400, 15780], ["ia", 15780, 16040], ["sakit,", 16040, 16480], ["surat", 16780, 17060], ["dokter", 17060, 17440], ["sudah", 17440, 17660], ["dikirim", 17660, 18080], ["ke", 18080, 18260], ["mandor.", 18260, 18620], ["Tapi,", 18960, 19340], ["telepon", 19440, 19660], ["datang,", 19660, 20160], ["kamu", 20480, 20780], ["bolos.", 20780, 21320], ["gaji", 21720, 21960], ["tiga", 21960, 22260], ["hari", 22260, 22600], ["dipotong.", 22600, 23120]], 15180), yellow: ["BOLOS", "GAJI", "DIPOTONG"] },
    { start: 555, end: 635, words: timedCaptions([["Tono", 23420, 23820], ["menatap", 23820, 24320], ["surat", 24320, 24580], ["dokter", 24580, 24940], ["di", 24940, 25100], ["tangannya.", 25100, 25520], ["tak", 25860, 26000], ["percaya,", 26000, 26460]], 23420), yellow: ["SURAT", "DOKTER"] },
    { start: 635, end: 825, words: timedCaptions([["Tono", 26880, 27180], ["datang", 27180, 27600], ["membawa", 27600, 27940], ["surat", 27940, 28300], ["asli", 28300, 28660], ["dan", 28660, 28860], ["resep", 28860, 29200], ["obat.", 29200, 29500], ["Mandor", 29500, 30180], ["menepis.", 30180, 30720], ["Surat", 31100, 31340], ["dokter", 31340, 31700], ["gampang", 31700, 32040], ["dibeli,", 32040, 32400], ["besok", 32760, 33180], ["terima", 33180, 33500], ["surat", 33500, 33880], ["peringatan.", 33880, 34360]], 26880), yellow: ["MANDOR", "SURAT", "PERINGATAN"] },
    { start: 825, end: 990, words: timedCaptions([["Undang-Undang", 34760, 35400], ["Nomor", 35400, 35700], ["27", 35700, 36280], ["Tahun", 36280, 36780], ["2026,", 36780, 37960], ["Pasal", 38340, 38740], ["149", 38740, 39980], ["ayat", 39980, 40420], ["2", 40420, 40620], ["huruf", 40620, 41100], ["a.", 41100, 41260]], 34760), yellow: ["UNDANG-UNDANG", "PASAL", "149"] },
    { start: 990, end: 1120, words: timedCaptions([["Pekerja", 41580, 42000], ["yang", 42000, 42120], ["sakit,", 42120, 42580], ["upahnya", 42820, 43320], ["wajib", 43320, 43760], ["dibayar.", 43760, 44280], ["empat", 44560, 44840], ["bulan", 44840, 45120], ["pertama,", 45120, 45400], ["seratus", 45820, 46140], ["persen.", 46140, 46660]], 41580), yellow: ["SAKIT", "UPAH", "100"] },
    { start: 1120, end: 1320, words: timedCaptions([["Tono", 46880, 47300], ["kembali", 47300, 47740], ["keesokan", 47740, 48240], ["harinya,", 48240, 48640], ["dengan", 48960, 49200], ["salinan", 49200, 49760], ["pasal", 49760, 50180], ["di", 50180, 50300], ["tangannya.", 50300, 50700], ["Sakit", 51060, 51540], ["bukan", 51540, 51740], ["bolos,", 51740, 52280], ["karena", 52540, 52880], ["setiap", 52880, 53380], ["pekerja", 53380, 53860], ["punya", 53860, 54300], ["cerita.", 54300, 54760]], 46880), yellow: ["SALINAN", "PASAL", "BOLOS", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep17.mp3")} />
      <Sequence durationInFrames={183}>
        <Shot01 dur={183} />
      </Sequence>
      <Sequence from={183} durationInFrames={173}>
        <Shot02 dur={173} />
      </Sequence>
      <Sequence from={356} durationInFrames={199}>
        <Shot03 dur={199} />
      </Sequence>
      <Sequence from={555} durationInFrames={80}>
        <Shot04 dur={80} />
      </Sequence>
      <Sequence from={635} durationInFrames={190}>
        <Shot05 dur={190} />
      </Sequence>
      <Sequence from={825} durationInFrames={165}>
        <Shot06 dur={165} />
      </Sequence>
      <Sequence from={990} durationInFrames={130}>
        <Shot07 />
      </Sequence>
      <Sequence from={1120}>
        <Shot08 dur={200} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
