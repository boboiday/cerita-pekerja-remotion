import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { SIT, STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, OfficeBg } from "../../kit/Backgrounds";
import { PASSENGERS } from "../../kit/Stick";

/**
 * EP16 — "10 Tahun Masih Kontrak" (24 fps, 1080x1920, 54.6 detik).
 * Slamet, operator mesin pabrik di Sidoarjo 10 tahun: kontrak 2 tahun
 * diperpanjang 4 kali — total 10 tahun — padahal pekerjaannya tetap.
 * Hukum: UU 27/2026 Pasal 82 ayat (2) — PKWT paling lama 2 tahun, hanya
 * boleh diperpanjang 2 kali masing-masing 1 tahun (batas maksimal 4 tahun)
 * — + Pasal 87 ayat (2) (pekerjaan tetap tidak boleh dikontrak) + Pasal 87
 * ayat (5) (melanggar = demi hukum menjadi PKWTT) + Pasal 87 ayat (6)
 * (pengesahan via nota pengawas + pengadilan negeri) + Pasal 82 ayat (3)
 * (pemberitahuan perpanjangan tertulis ≤ 7 hari). TIDAK ADA klaim
 * pengangkatan otomatis tanpa proses (jalur pengesahan dicatat di kartu
 * hukum). Semua pasal verbatim, spplaw.id, status Berlaku.
 * VO: Sulafat 54.6 dtk (public/voice_over_ep16.mp3), word timings dari
 * alignment.json faster-whisper (126 kata; "Selamet"->"Slamet",
 * "Undang"+"-undang"->"Undang-Undang", "masing"+"-masing"->"masing-masing";
 * match ratio 0,953).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 * Perbaikan gambar kecil vs EP14: set pabrik baru (gerbang + cerobong +
 * papan "PABRIK SIDOARJO" + lini produksi + deret mesin + ban berjalan) +
 * kontrak kertas sebagai prop berulang (S01, S03, S05) + name tag "SLAMET"
 * + name tag "TETAP" pada rekan yang sudah diangkat tetap.
 */

export const EP16_TOTAL = 1310; // 54.6 s @ 24 fps

/** Slamet: kemeja putih, dasi hitam, celana hitam + name tag "SLAMET". */
const SLAMET: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f", nameTag: "SLAMET" };
/** Bu Ratna (HR): biru-teal, dasi merah, rambut bun. */
const RATNA: Look = { body: "#3f6d8e", pants: "#1d1d1f", tie: "#b3352b", bun: true, hair: "#2a1a12" };
/** Istri Slamet: ungu, rambut bun. */
const ISTRI: Look = { body: "#8a5bb5", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };
/** Anak Slamet: kuning, kecil. */
const ANAK: Look = { body: "#e2a748", pants: "#1d1d1f" };
/** Rekan yang sudah diangkat tetap. */
const TETAP: Look = { ...PASSENGERS[0], nameTag: "TETAP" };

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

/** Latar pabrik: gerbang + cerobong + papan nama + lantai beton. */
const FactoryGateBg: React.FC = () => (
  <g>
    {/* lantai beton + garis */}
    <rect x={0} y={FLOOR} width={1080} height={1920 - FLOOR} fill="#b9b6ae" />
    <rect x={0} y={FLOOR} width={1080} height={14} fill="#8a877f" />
    {/* gedung pabrik */}
    <rect x={60} y={560} width={960} height={840} fill="#8f969b" stroke={C.ink} strokeWidth={7} />
    <rect x={60} y={560} width={960} height={40} fill="#6b6f75" stroke={C.ink} strokeWidth={5} />
    {/* cerobong (satu miring sedikit, satu tegak) */}
    <rect x={120} y={220} width={90} height={360} fill="#a33d31" stroke={C.ink} strokeWidth={6} transform="rotate(-3 165 400)" />
    <rect x={880} y={280} width={80} height={300} fill="#a33d31" stroke={C.ink} strokeWidth={6} />
    <circle cx={165} cy={200} r={26} fill="#cfcab3" opacity={0.8} />
    <circle cx={920} cy={260} r={22} fill="#cfcab3" opacity={0.8} />
    {/* jendela pabrik: sebagian menyala, pola tidak simetris */}
    {[120, 300, 480, 660, 840].map((x, i) => (
      <rect key={x} x={x} y={640 + (i % 2) * 40} width={110} height={130} fill={i % 3 === 0 ? "#ffe9a8" : "#1d1d1f"} stroke={C.ink} strokeWidth={5} />
    ))}
    {/* papan nama PABRIK SIDOARJO */}
    <rect x={300} y={820} width={480} height={110} rx={10} fill="#c0241c" stroke={C.ink} strokeWidth={7} />
    <text x={540} y={880} fontFamily={FONT.mono} fontWeight={800} fontSize={44} fill="white" textAnchor="middle">PABRIK</text>
    <text x={540} y={916} fontFamily={FONT.mono} fontWeight={700} fontSize={26} fill="white" textAnchor="middle">SIDOARJO</text>
    {/* gerbang besi */}
    <rect x={380} y={1020} width={320} height={380} fill="#3a3a3f" stroke={C.ink} strokeWidth={6} />
    {[420, 480, 540, 600, 660].map((x) => (
      <line key={x} x1={x} y1={1020} x2={x} y2={1400} stroke="#8a877f" strokeWidth={6} />
    ))}
    <line x1={380} y1={1120} x2={700} y2={1120} stroke="#8a877f" strokeWidth={6} />
    <line x1={380} y1={1260} x2={700} y2={1260} stroke="#8a877f" strokeWidth={6} />
    {/* drum + palet di sisi kiri */}
    <rect x={80} y={1180} width={110} height={220} rx={10} fill="#28518b" stroke={C.ink} strokeWidth={5} />
    <rect x={210} y={1240} width={110} height={160} rx={10} fill="#3f7a4a" stroke={C.ink} strokeWidth={5} />
    <rect x={760} y={1300} width={180} height={100} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Lapis jauh lini produksi (dinding + jendela + pipa) — untuk parallax. */
const FactoryFar: React.FC = () => (
  <g>
    <rect x={0} y={500} width={1420} height={900} fill="#9a938a" stroke={C.ink} strokeWidth={5} />
    {[60, 300, 560, 820, 1080, 1300].map((x, i) => (
      <rect key={x} x={x} y={600 + (i % 2) * 60} width={130} height={150} fill={i % 3 === 0 ? "#ffe9a8" : "#1d1d1f"} stroke={C.ink} strokeWidth={5} />
    ))}
    <rect x={0} y={520} width={1420} height={26} fill="#8a877f" />
    <line x1={0} y1={560} x2={1420} y2={560} stroke="#6b675f" strokeWidth={10} />
    <circle cx={700} cy={700} r={50} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={700} y1={700} x2={700} y2={668} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <line x1={700} y1={700} x2={724} y2={716} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** Lapis dekat lini produksi (deret mesin + ban berjalan) — untuk parallax. */
const FactoryNear: React.FC = () => (
  <g>
    {[40, 420, 800, 1180].map((x, i) => (
      <g key={x}>
        <rect x={x} y={820} width={300} height={580} fill={i % 2 === 0 ? "#5d6d7a" : "#6d5a4a"} stroke={C.ink} strokeWidth={6} />
        <rect x={x + 30} y={860} width={240} height={120} fill="#7fb3d5" stroke={C.ink} strokeWidth={4} />
        <circle cx={x + 150} cy={1150} r={70} fill="#2c3048" stroke={C.ink} strokeWidth={5} />
        <circle cx={x + 150} cy={1150} r={26} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
        <rect x={x + 20} y={1300} width={260} height={24} fill="#e2a748" stroke={C.ink} strokeWidth={4} />
      </g>
    ))}
    <rect x={0} y={FLOOR - 60} width={1420} height={60} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
    <rect x={0} y={FLOOR - 60} width={1420} height={10} fill="#e2a748" strokeDasharray="40 30" />
  </g>
);

/** Kontrak kertas putih: label + "PKWT — 2 tahun" + "Perpanjangan ke-4" merah. */
const ContractPaper: React.FC = () => (
  <g>
    <rect x={-55} y={-80} width={110} height={190} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={-40} y1={-60} x2={40} y2={-60} stroke="#b9b6ae" strokeWidth={3} />
    <text x={0} y={-30} fontFamily={FONT.mono} fontWeight={800} fontSize={18} fill={C.ink} textAnchor="middle">KONTRAK</text>
    <text x={0} y={0} fontFamily={FONT.mono} fontWeight={700} fontSize={15} fill={C.ink} textAnchor="middle">PKWT — 2 thn</text>
    <text x={0} y={28} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill="#c0241c" textAnchor="middle">Ke-4</text>
    <line x1={-40} y1={48} x2={40} y2={48} stroke="#b9b6ae" strokeWidth={3} />
    <path d="M-55,110 L-40,96 L-25,110 L-10,96 L5,110 L20,96 L35,110 L55,96 L55,110 Z" fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Map cokelat berlabel PASAL 82 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 30 : 24} fill="#fdf8ea" textAnchor="middle">82</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Shot 1 (0–144): gerbang pabrik pagi. Slamet jalan masuk, menatap kontrak. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–48f): jalan masuk kiri -> gerbang. Beat 2 (48–96f): menatap papan PABRIK. Beat 3 (96–144f): kontrak tampil, Slamet worried.
  const walking = frame < 48;
  const walkDist = walking ? interpolate(frame, [0, 48], [0, 220]) : 220;
  const x = 60 + walkDist;
  const pose = walking
    ? { ...walk(walkDist / walkCycle(0.9, 0.95), 0.9), headTilt: 0 }
    : { ...STAND, headTilt: 0.14, lean: 0.02 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <FactoryGateBg />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={SLAMET}
          pose={pose}
          mood="worried"
          lookAt={0.5}
          holdF={frame >= 96 ? <ContractPaper /> : undefined}
        />
      </Canvas>
      {/* pill hook */}
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 52, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          PABRIK. <span style={{ color: C.capYellow }}>PAGI.</span>
        </span>
      </div>
      <KineticText words={["10", "TAHUN", "MASIH", "KONTRAK"]} at={96} stagger={3} top={460} fontSize={96} accent={["KONTRAK"]} />
    </Camera>
  );
};

/** Shot 2 (0–204): tracking shot lini produksi. Slamet menyeberang penuh kiri -> kanan, parallax 2 lapis. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 160;
  return (
    <Camera dur={dur} move="static">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <Parallax dur={dur}>
          <ParallaxLayer speed={260}>
            <FactoryFar />
          </ParallaxLayer>
          <ParallaxLayer speed={620}>
            <FactoryNear />
          </ParallaxLayer>
        </Parallax>
        <rect x={0} y={1400} width={1080} height={520} fill="#3a3a3f" />
        <rect x={0} y={1400} width={1080} height={16} fill="#5c564a" />
        <Stick x={x} floor={FLOOR} scale={0.95} look={SLAMET} pose={pose} mood="worried" lookAt={lookRight ? 1 : 0.5} />
        <Stick x={920} floor={FLOOR} scale={0.9} look={PASSENGERS[1]} pose={STAND} mood="calm" lookAt={-0.5} />
      </Canvas>
      <KineticText words={["5", "KALI", "TANDA", "TANGAN", "KONTRAK"]} at={72} stagger={3} top={420} fontSize={88} accent={["KONTRAK"]} />
    </Camera>
  );
};

/** Shot 3 (0–120): ruang HR. Bu Ratna menunjuk map kontrak; Slamet ragu. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–30f): Bu Ratna menunjuk map. Beat 2 (30–72f): janji "TUNGGU, NANTI DIPERPANJANG." Beat 3 (72–120f): Slamet menatap map (worried).
  const ratnaPose: Pose = { ...STAND, armF: [-1.5, -0.15], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 };
  const slametPose: Pose = { ...STAND, headTilt: 0.12, lean: 0.02 };
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%" shake={1}>
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        <Stick x={300} floor={FLOOR} scale={0.95} look={SLAMET} pose={slametPose} mood="worried" lookAt={1} />
        <Stick
          x={780}
          floor={FLOOR}
          scale={1.0}
          look={RATNA}
          pose={ratnaPose}
          mood="calm"
          lookAt={-0.6}
          holdF={<ContractPaper />}
        />
      </Canvas>
      <KineticText words={["TUNGGU,", "NANTI", "DIPERPANJANG."]} at={30} stagger={3} top={420} fontSize={88} accent={["DIPERPANJANG."]} />
    </Camera>
  );
};

/** Shot 4 (0–132): close-up Slamet menatap rekan yang sudah tetap. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 72 ? "sad" : "resigned";
  const headTilt = frame < 72 ? 0.18 : 0.08;
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%">
      <Canvas bg="#f7f1e3">
        <FactoryFar />
        <FactoryNear />
        <Stick
          x={460}
          floor={FLOOR}
          scale={1.05}
          look={SLAMET}
          pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt }}
          mood={mood}
          lookAt={0.8}
        />
        <Stick
          x={860}
          floor={FLOOR}
          scale={0.95}
          look={TETAP}
          pose={{ ...STAND, headTilt: 0 }}
          mood="calm"
          lookAt={-0.7}
        />
        <Stick x={1000} floor={FLOOR} scale={0.8} look={PASSENGERS[2]} pose={STAND} mood="calm" lookAt={-0.8} />
      </Canvas>
      <KineticText words={["TEMAN", "SEANGKATAN", "SUDAH", "TETAP"]} at={48} stagger={3} top={420} fontSize={88} accent={["TETAP"]} />
    </Camera>
  );
};

/** Shot 5a (0–72): rumah malam. Slamet duduk murung, istri + anak, kontrak ke-5 di meja. */
const Shot05a: React.FC = () => {
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230) scale(0.6)">
          <ContractPaper />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={SLAMET} pose={SIT} mood="sad" lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={ISTRI} pose={{ ...STAND, headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
        <Stick x={940} floor={FLOOR} scale={0.6} look={ANAK} pose={STAND} mood="calm" lookAt={-0.5} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5b (0–72): papan "GAJIAN — ANAK MENUNGGU". Anak menatap. */
const Shot05b: React.FC = () => {
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <rect x={140} y={500} width={800} height={200} fill="#1e2436" stroke={C.ink} strokeWidth={6} />
        <text x={540} y={590} fontFamily={FONT.mono} fontWeight={800} fontSize={52} fill="#7fb3d5" textAnchor="middle">GAJIAN — ANAK</text>
        <text x={540} y={660} fontFamily={FONT.mono} fontWeight={800} fontSize={52} fill="#7fb3d5" textAnchor="middle">MENUNGGU</text>
        <Stick x={540} floor={FLOOR} scale={0.8} look={ANAK} pose={STAND} mood="calm" lookAt={0} />
      </Canvas>
      <KineticText words={["TAKUT", "BERSUARA"]} at={12} stagger={3} top={480} fontSize={88} accent={["TAKUT"]} />
    </Camera>
  );
};

/** Shot 5c (0–36): kembali ke rumah. Istri menyentuh bahu Slamet; Slamet tak sanggup menjawab. */
const Shot05c: React.FC = () => {
  const frame = useCurrentFrame();
  const mood = frame < 20 ? "sad" : "resigned";
  return (
    <Camera dur={36} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230) scale(0.6)">
          <ContractPaper />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={SLAMET} pose={SIT} mood={mood} lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={ISTRI} pose={{ ...STAND, armF: [-0.9, -0.2], armB: [-0.1, 0.1], headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
        <Stick x={940} floor={FLOOR} scale={0.6} look={ANAK} pose={STAND} mood="calm" lookAt={-0.5} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5 (0–180): rumah -> papan gajian -> rumah (cut internal lewat tatapan Slamet). */
const Shot05: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={72}>
      <Shot05a />
    </Sequence>
    <Sequence from={72} durationInFrames={72}>
      <Shot05b />
    </Sequence>
    <Sequence from={144}>
      <Shot05c />
    </Sequence>
  </>
);

/** Shot 6 (0–156): rumah malam. Slamet mengangkat salinan pasal; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–36f): jalan masuk ke meja. Beat 2 (36–84f): angkat pasal + big text stagger. Beat 3 (84–156f): menatap big text.
  const walking = frame < 36;
  const x = walking ? interpolate(frame, [0, 36], [80, 420], { extrapolateRight: "clamp" }) : 420;
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
          {frame < 36 ? <PasalFolder big /> : null}
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={SLAMET}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 36 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["MAKSIMAL", "2", "TAHUN"]} at={36} stagger={3} top={420} fontSize={104} accent={["TAHUN"]} />
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

/** Shot 7 (0–192): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Slamet menunjuk item 1-2 (0–72f), lalu 3-4 (72–144f), item 5 tercentang (144f+).
  const pointY = frame < 72 ? 0 : frame < 144 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Slamet kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={SLAMET}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 38, letterSpacing: 2, color: C.alertRed }}>PASAL 82 AYAT 2</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · BATAS PKWT</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          PKWT paling lama 2 tahun, perpanjang 2x @ 1 tahun
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 82 ayat 2)</div>
        </LawItem>
        <LawItem at={36}>
          Pekerjaan tetap tak boleh dikontrak
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 87 ayat 2)</div>
        </LawItem>
        <LawItem at={72}>
          Melanggar = demi hukum jadi karyawan tetap
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 87 ayat 5)</div>
          <span style={{ fontFamily: FONT.title, fontSize: 64, color: "#c0241c", lineHeight: 1 }}>82</span>
        </LawItem>
        <LawItem at={108}>
          Pengesahan: nota pengawas + pengadilan negeri
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 87 ayat 6)</div>
        </LawItem>
        <LawItem at={144}>
          Perpanjangan diberitahu tertulis ≤ 7 hari
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 82 ayat 3)</div>
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–72): Slamet jalan kembali ke ruang HR membawa salinan pasal. */
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
          look={SLAMET}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–110): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
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
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Sepuluh tahun kontrak, cukup.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Sudah berapa tahun kamu dikontrak? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–182): kembali bekerja -> end card. */
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

export const EP16: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 144, words: timedCaptions([["Sepuluh", 0, 520], ["tahun", 520, 780], ["Slamet", 780, 1260], ["bekerja", 1260, 1820], ["di", 1820, 1960], ["pabrik", 1960, 2260], ["yang", 2260, 2420], ["sama,", 2420, 2680], ["tapi", 3120, 3560], ["sampai", 3560, 3860], ["hari", 3860, 4140], ["ini", 4140, 4420], ["statusnya", 4420, 5200], ["masih", 5200, 5400], ["kontrak.", 5400, 5820]], 0), yellow: ["SEPULUH", "TAHUN", "KONTRAK"] },
    { start: 144, end: 348, words: timedCaptions([["Operator", 6400, 6900], ["mesin", 6900, 7300], ["di", 7300, 7460], ["Sidoarjo,", 7460, 7960], ["lima", 8380, 8640], ["kali", 8640, 8880], ["menandatangani", 8880, 9580], ["kontrak", 9580, 9880], ["baru,", 9880, 10160], ["pekerjaannya", 10560, 11120], ["sama", 11120, 11460], ["setiap", 11460, 11880], ["hari,", 11880, 12080], ["mesinnya", 12420, 12840], ["sama,", 12840, 13140], ["seragamnya", 13500, 13940], ["sama.", 13940, 14240]], 6400), yellow: ["LIMA", "KALI", "KONTRAK"] },
    { start: 348, end: 468, words: timedCaptions([["Setiap", 14840, 15300], ["kontrak", 15300, 15560], ["mau", 15560, 15720], ["habis,", 15720, 16160], ["HR", 16440, 16560], ["selalu", 16560, 16900], ["bilang,", 16900, 17120], ["tunggu,", 17460, 17740], ["nanti", 18080, 18360], ["diperpanjang.", 18360, 18940]], 14840), yellow: ["TUNGGU", "DIPERPANJANG"] },
    { start: 468, end: 600, words: timedCaptions([["Janji", 19540, 20060], ["jadi", 20060, 20260], ["karyawan", 20260, 20580], ["tetap", 20580, 20980], ["tak", 20980, 21140], ["pernah", 21140, 21280], ["datang,", 21280, 21680], ["sementara", 21960, 22420], ["teman", 22420, 22680], ["seangkatannya", 22680, 23300], ["sudah", 23300, 23620], ["lama", 23620, 23920], ["diangkat", 23920, 24300], ["tetap.", 24300, 24660]], 19540), yellow: ["TETAP", "SEANGKATAN"] },
    { start: 600, end: 780, words: timedCaptions([["Slamet", 24660, 25580], ["takut", 25580, 25920], ["protes.", 25920, 26380], ["Sekali", 26720, 27040], ["saja", 27040, 27320], ["dia", 27320, 27580], ["bersuara,", 27580, 28020], ["kontrak", 28340, 28540], ["berikutnya", 28540, 29020], ["bisa", 29020, 29220], ["tidak", 29220, 29440], ["diperpanjang,", 29440, 30000], ["dan", 30180, 30480], ["anak", 30480, 30700], ["istrinya", 30700, 31160], ["di", 31160, 31280], ["rumah", 31280, 31480], ["menunggu", 31480, 31980], ["gajian.", 31980, 32440]], 24660), yellow: ["TAKUT", "PROTES", "GAJIAN"] },
    { start: 780, end: 936, words: timedCaptions([["Undang-Undang", 33000, 33760], ["nomor", 33760, 34020], ["27", 34020, 34420], ["tahun", 34420, 34880], ["2026", 34880, 35780], ["pasal", 35780, 36280], ["82.", 36280, 36740]], 33000), yellow: ["UNDANG-UNDANG", "PASAL", "82"] },
    { start: 936, end: 1128, words: timedCaptions([["Kontrak", 37380, 37680], ["kerja", 37680, 37940], ["waktu", 37940, 38160], ["tertentu", 38160, 38620], ["paling", 38620, 38860], ["lama", 38860, 39080], ["dua", 39080, 39300], ["tahun,", 39300, 39600], ["hanya", 39900, 40100], ["boleh", 40100, 40320], ["diperpanjang", 40320, 40900], ["dua", 40900, 41080], ["kali,", 41080, 41360], ["masing-masing", 41640, 42120], ["satu", 42120, 42440], ["tahun.", 42440, 42740], ["Pasal", 43280, 43660], ["87,", 43660, 44120], ["kontrak", 44640, 45000], ["yang", 45000, 45180], ["melanggar", 45180, 45480], ["aturan", 45480, 45780], ["demi", 45780, 46180], ["hukum", 46180, 46500], ["menjadi", 46500, 46840], ["karyawan", 46840, 47240], ["tetap.", 47240, 47600]], 37380), yellow: ["DUA", "TAHUN", "TETAP"] },
    { start: 1128, end: 1310, words: timedCaptions([["Slamet", 47600, 48480], ["datang", 48480, 48840], ["ke", 48840, 48960], ["HR", 48960, 49200], ["membawa", 49200, 49540], ["salinan", 49540, 49940], ["pasal", 49940, 50220], ["itu,", 50220, 50420], ["sepuluh", 50760, 51140], ["tahun", 51140, 51340], ["kontrak,", 51340, 51780], ["cukup,", 51960, 52460], ["karena", 52640, 52920], ["setiap", 52920, 53360], ["pekerja", 53360, 53720], ["punya", 53720, 54000], ["cerita.", 54000, 54400]], 47600), yellow: ["SALINAN", "PASAL", "CUKUP", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep16.mp3")} />
      <Sequence durationInFrames={144}>
        <Shot01 dur={144} />
      </Sequence>
      <Sequence from={144} durationInFrames={204}>
        <Shot02 dur={204} />
      </Sequence>
      <Sequence from={348} durationInFrames={120}>
        <Shot03 dur={120} />
      </Sequence>
      <Sequence from={468} durationInFrames={132}>
        <Shot04 dur={132} />
      </Sequence>
      <Sequence from={600} durationInFrames={180}>
        <Shot05 dur={180} />
      </Sequence>
      <Sequence from={780} durationInFrames={156}>
        <Shot06 dur={156} />
      </Sequence>
      <Sequence from={936} durationInFrames={192}>
        <Shot07 />
      </Sequence>
      <Sequence from={1128}>
        <Shot08 dur={182} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
