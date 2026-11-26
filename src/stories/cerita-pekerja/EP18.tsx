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
 * EP18 — "Bekerja Saat Cuti" (24 fps, 1080x1920, 56.8 detik).
 * Arif, staf gudang di Sidoarjo 3 tahun: cuti 5 hari sudah disetujui,
 * hari ke-2 ditelepon masuk kerja (stok opname mendesak), masuk 2 hari,
 * lalu HRD bilang jatah 5 harinya sudah habis terpakai.
 * Hukum: UU 27/2026 Pasal 118 ayat (5) — cuti tahunan paling sedikit
 * 12 hari kerja, hak pekerja untuk tidak bekerja — + Pasal 123 ayat (1)
 * (upah penuh selama cuti) + Pasal 116 ayat (1) (lembur butuh
 * persetujuan pekerja). TIDAK ADA pasal yang secara harfiah berbunyi
 * "cuti yang dipakai kerja wajib diganti" — "dua harinya dijadwal
 * ulang / jatah tetap utuh" disampaikan sebagai konsekuensi normatif
 * dari hak cuti, BUKAN sebagai kutipan pasal.
 * VO: Sulafat 56.83 dtk (public/voice_over_ep18.mp3; render mentah
 * 68.17 dtk dipercepat atempo 1.2), word timings dari alignment.json
 * faster-whisper small (105 kata; "Cuci"->"Cuti", "-arif"->"Arif",
 * "telefon"->"telepon", "Stock"+"opna"->"Stok opname",
 * "Undang"+"-undang"->"Undang-Undang", "12"->"dua belas",
 * "di"+"jadwal"->"dijadwal", "cuci"+"-nya"->"cutinya").
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 * Perbaikan gambar kecil vs EP17: set gudang BARU yang detail
 * (rak + kardus + forklift + palet + papan GUDANG SIDOARJO) +
 * prop koper + surat cuti sebagai prop kunci cerita.
 */

export const EP18_TOTAL = 1364; // 56.83 s @ 24 fps

/** Arif: kemeja putih, dasi hitam, celana hitam + name tag "ARIF". */
const ARIF: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f", nameTag: "ARIF" };
/** Pak Surya (atasan): kemeja biru-abu, dasi merah. */
const SURYA: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };
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

/** Surat cuti: kertas putih + stempel merah "SURAT CUTI" + "5 HARI". */
const LeaveLetter: React.FC = () => (
  <g>
    <rect x={-55} y={-80} width={110} height={190} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={-40} y1={-60} x2={40} y2={-60} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-40} y1={-44} x2={40} y2={-44} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-40} y1={-28} x2={40} y2={-28} stroke="#b9b6ae" strokeWidth={3} />
    <text x={0} y={-8} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">SURAT</text>
    <text x={0} y={16} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">CUTI</text>
    <circle cx={0} cy={58} r={26} fill="none" stroke="#c0241c" strokeWidth={4} />
    <text x={0} y={64} fontFamily={FONT.mono} fontWeight={800} fontSize={13} fill="#c0241c" textAnchor="middle">5 HARI</text>
    <path d="M-55,110 L-40,96 L-25,110 L-10,96 L5,110 L20,96 L35,110 L55,96 L55,110 Z" fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Koper: badan cokelat + gagang + roda + baju terlipat di atas. */
const Suitcase: React.FC = () => (
  <g>
    <rect x={-90} y={-60} width={180} height={130} rx={14} fill="#8a5a34" stroke={C.ink} strokeWidth={5} />
    <line x1={-90} y1={5} x2={90} y2={5} stroke={C.ink} strokeWidth={4} />
    <rect x={-30} y={-88} width={60} height={28} rx={10} fill="none" stroke={C.ink} strokeWidth={5} />
    <rect x={-70} y={-60} width={140} height={34} fill="#f5f2e8" stroke={C.ink} strokeWidth={3} />
    <rect x={-70} y={-60} width={140} height={12} fill="#3f7a4a" />
    <circle cx={-60} cy={82} r={12} fill="#23232a" stroke={C.ink} strokeWidth={3} />
    <circle cx={60} cy={82} r={12} fill="#23232a" stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Map cokelat berlabel PASAL 118 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 30 : 24} fill="#fdf8ea" textAnchor="middle">118</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Kasur + bantal + selimut (kamar Arif). */
const Bed: React.FC = () => (
  <g>
    <rect x={60} y={1180} width={500} height={60} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={60} y={1120} width={500} height={60} fill="#f5f2e8" stroke={C.ink} strokeWidth={5} />
    <rect x={80} y={1130} width={130} height={40} rx={14} fill="#ffffff" stroke={C.ink} strokeWidth={3} />
    <rect x={230} y={1130} width={310} height={50} fill="#b3352b" />
    <rect x={60} y={1240} width={500} height={160} fill="#4a3428" />
  </g>
);

/** Meja kecil kamar: gelas + buku. */
const Nightstand: React.FC = () => (
  <g>
    <rect x={820} y={1150} width={180} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={840} y={1176} width={140} height={224} fill="#4a3428" />
    <rect x={940} y={1080} width={44} height={70} fill="#cfe3ee" stroke={C.ink} strokeWidth={4} />
    <rect x={940} y={1080} width={44} height={18} fill="#7fb3d5" />
  </g>
);

/** Set gudang: rak + kardus + forklift + palet + papan GUDANG SIDOARJO. */
const WarehouseBg: React.FC = () => (
  <g>
    {/* dinding + jendela tinggi */}
    <rect x={0} y={0} width={1080} height={1420} fill="#e8e0c8" />
    <rect x={70} y={180} width={260} height={300} fill="#cfe3ee" stroke={C.ink} strokeWidth={5} />
    <line x1={200} y1={180} x2={200} y2={480} stroke={C.ink} strokeWidth={4} />
    <line x1={70} y1={330} x2={330} y2={330} stroke={C.ink} strokeWidth={4} />
    <circle cx={900} cy={280} r={70} fill="#ffe9a8" opacity={0.8} />
    {/* papan nama gudang */}
    <rect x={360} y={200} width={660} height={110} fill="#23282e" stroke={C.ink} strokeWidth={5} />
    <text x={690} y={275} fontFamily={FONT.mono} fontWeight={800} fontSize={52} fill="#fdf8ea" textAnchor="middle">GUDANG SIDOARJO</text>
    {/* rak kiri: tiang + balok + kardus */}
    <rect x={80} y={420} width={16} height={780} fill="#6b4a38" stroke={C.ink} strokeWidth={3} />
    <rect x={380} y={420} width={16} height={780} fill="#6b4a38" stroke={C.ink} strokeWidth={3} />
    <rect x={80} y={560} width={316} height={18} fill="#8a5a34" stroke={C.ink} strokeWidth={3} />
    <rect x={80} y={780} width={316} height={18} fill="#8a5a34" stroke={C.ink} strokeWidth={3} />
    <rect x={80} y={1000} width={316} height={18} fill="#8a5a34" stroke={C.ink} strokeWidth={3} />
    {[
      { x: 100, y: 470, w: 120, h: 90, c: "#b98a5a" }, { x: 240, y: 470, w: 130, h: 90, c: "#a87a4a" },
      { x: 100, y: 690, w: 140, h: 90, c: "#c49a6a" }, { x: 260, y: 690, w: 110, h: 90, c: "#b98a5a" },
      { x: 110, y: 910, w: 120, h: 90, c: "#a87a4a" }, { x: 250, y: 910, w: 120, h: 90, c: "#c49a6a" },
    ].map(({ x, y, w, h, c }, i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} fill={c} stroke={C.ink} strokeWidth={3} />
        <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#7a5a34" strokeWidth={3} />
      </g>
    ))}
    {/* rak kanan kecil */}
    <rect x={700} y={620} width={14} height={580} fill="#6b4a38" stroke={C.ink} strokeWidth={3} />
    <rect x={960} y={620} width={14} height={580} fill="#6b4a38" stroke={C.ink} strokeWidth={3} />
    <rect x={700} y={760} width={274} height={16} fill="#8a5a34" stroke={C.ink} strokeWidth={3} />
    <rect x={700} y={980} width={274} height={16} fill="#8a5a34" stroke={C.ink} strokeWidth={3} />
    {[
      { x: 720, y: 670, w: 110, h: 90 }, { x: 840, y: 670, w: 110, h: 90 },
      { x: 730, y: 890, w: 100, h: 90 }, { x: 850, y: 890, w: 100, h: 90 },
    ].map(({ x, y, w, h }, i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} fill="#b98a5a" stroke={C.ink} strokeWidth={3} />
        <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#7a5a34" strokeWidth={3} />
      </g>
    ))}
    {/* palet + kardus di lantai */}
    <rect x={480} y={1180} width={220} height={16} fill="#a87a4a" stroke={C.ink} strokeWidth={3} />
    <rect x={480} y={1200} width={220} height={16} fill="#8a5a34" stroke={C.ink} strokeWidth={3} />
    <rect x={510} y={1080} width={160} height={100} fill="#c49a6a" stroke={C.ink} strokeWidth={3} />
    <line x1={590} y1={1080} x2={590} y2={1180} stroke="#7a5a34" strokeWidth={3} />
    {/* forklift */}
    <g>
      <rect x={760} y={1060} width={170} height={140} rx={10} fill="#d97b2f" stroke={C.ink} strokeWidth={5} />
      <rect x={790} y={980} width={110} height={80} fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
      <rect x={930} y={920} width={14} height={280} fill="#23232a" stroke={C.ink} strokeWidth={3} />
      <rect x={944} y={920} width={14} height={280} fill="#23232a" stroke={C.ink} strokeWidth={3} />
      <rect x={944} y={1180} width={110} height={14} fill="#23232a" stroke={C.ink} strokeWidth={3} />
      <circle cx={800} cy={1220} r={34} fill="#23232a" stroke={C.ink} strokeWidth={4} />
      <circle cx={800} cy={1220} r={14} fill="#5c564a" />
      <circle cx={900} cy={1220} r={26} fill="#23232a" stroke={C.ink} strokeWidth={4} />
      <circle cx={900} cy={1220} r={10} fill="#5c564a" />
    </g>
  </g>
);

/** Shot 1 (0–180): rumah pagi. Arif mengemas koper, surat cuti di tangan. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–60f): Arif berdiri di dekat koper, pill muncul. Beat 2 (60–120f): angkat surat cuti. Beat 3 (120–180f): koper + big text.
  const showLetter = frame >= 60;
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
        <g transform="translate(680,1290)">
          <Suitcase />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={ARIF} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.06 }} mood="hopeful" lookAt={0.5} holdF={showLetter ? <LeaveLetter /> : undefined} />
      </Canvas>
      {/* pill hook */}
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 52, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          PULANG <span style={{ color: C.capYellow }}>KAMPUNG.</span>
        </span>
      </div>
      <KineticText words={["CUTI", "5", "HARI", "DISETUJUI"]} at={120} stagger={3} top={460} fontSize={96} accent={["DISETUJUI"]} />
    </Camera>
  );
};

/** Shot 2 (0–175): tracking shot jalan pagi. Arif menyeberang penuh kiri -> kanan, parallax 2 lapis. */
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
        <Stick x={x} floor={FLOOR} scale={0.95} look={ARIF} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["3", "TAHUN", "STAF", "GUDANG"]} at={60} stagger={3} top={420} fontSize={88} accent={["GUDANG"]} />
    </Camera>
  );
};

/** Shot 3 (0–150): rumah. Arif menerima telepon Pak Surya; "STOK OPNAME! MASUK KERJA SEKARANG". */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–50f): HP berdering, Arif angkat (worried). Beat 2 (50–100f): "STOK OPNAME!" (shocked). Beat 3 (100–150f): "MASUK KERJA SEKARANG", Arif menunduk (sad).
  const mood = frame < 50 ? "worried" : frame < 100 ? "shocked" : "sad";
  const phoneUp = frame >= 30;
  const pose: Pose = phoneUp
    ? { ...STAND, armF: [1.1, 0.35], armB: [0.35, 0.55], lean: 0.04, headTilt: frame >= 100 ? 0.22 : 0.08 }
    : { ...STAND, headTilt: 0.1, lean: 0.02 };
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%" shake={2}>
      <Canvas bg="#f7f1e3">
        <rect x={0} y={0} width={1080} height={1420} fill="#f7f1e3" />
        <rect x={700} y={180} width={260} height={300} fill="#cfe3ee" stroke={C.ink} strokeWidth={5} />
        <line x1={830} y1={180} x2={830} y2={480} stroke={C.ink} strokeWidth={4} />
        <Bed />
        <Nightstand />
        <g transform="translate(680,1290)">
          <Suitcase />
        </g>
        <Stick
          x={300}
          floor={FLOOR}
          scale={0.95}
          look={ARIF}
          pose={pose}
          mood={mood}
          lookAt={0.5}
          holdF={phoneUp ? <rect x={-16} y={-30} width={32} height={60} rx={6} fill="#23232a" stroke={C.ink} strokeWidth={3} /> : undefined}
        />
      </Canvas>
      <KineticText words={["STOK", "OPNAME!"]} at={50} stagger={3} top={420} fontSize={120} accent={["OPNAME!"]} />
      <KineticText words={["MASUK", "KERJA", "SEKARANG"]} at={100} stagger={3} top={580} fontSize={88} accent={["KERJA"]} />
    </Camera>
  );
};

/** Shot 4 (0–73): close-up Arif kembali bekerja di gudang, kamera lebih dekat. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%" shake={1}>
      <Canvas bg="#f7f1e3">
        <WarehouseBg />
        <Stick
          x={540}
          floor={FLOOR}
          scale={1.15}
          look={ARIF}
          pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.18 }}
          mood="tired"
          lookAt={0.5}
          holdF={<LeaveLetter />}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 5a (0–130): kantor HRD. Bu Ratna bilang jatah habis; Arif memegang surat cuti. */
const Shot05a: React.FC = () => {
  const frame = useCurrentFrame();
  const dismiss = frame >= 60;
  return (
    <Camera dur={130} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        {/* kantor HRD: meja + kursi + papan */}
        <rect x={0} y={0} width={1080} height={1420} fill="#e8e0c8" />
        <rect x={360} y={200} width={360} height={90} fill="#23282e" stroke={C.ink} strokeWidth={5} />
        <text x={540} y={262} fontFamily={FONT.mono} fontWeight={800} fontSize={44} fill="#fdf8ea" textAnchor="middle">HRD</text>
        <rect x={60} y={1180} width={600} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={80} y={1206} width={560} height={194} fill="#4a3428" />
        <rect x={140} y={1090} width={180} height={90} fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
        <Stick x={300} floor={FLOOR} scale={0.95} look={ARIF} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: 0.03, headTilt: 0.1 }} mood="sad" lookAt={1} holdF={<LeaveLetter />} />
        <Stick x={780} floor={FLOOR} scale={1.0} look={RATNA} pose={{ ...STAND, armF: dismiss ? [-1.5, -0.15] : [0.3, 0.1], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 }} mood="determined" lookAt={-0.6} />
        <Stick x={960} floor={FLOOR} scale={0.85} look={PASSENGERS[1]} pose={STAND} mood="worried" lookAt={-0.8} />
      </Canvas>
      <KineticText words={["JATAH", "5", "HARIMU", "HABIS"]} at={60} stagger={3} top={420} fontSize={80} accent={["HABIS"]} />
    </Camera>
  );
};

/** Shot 5b (0–89): kembali ke rumah malam. Arif duduk murung menatap surat cuti. */
const Shot05b: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={89} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230) scale(0.6)">
          <LeaveLetter />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={ARIF} pose={SIT} mood="sad" lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={PASSENGERS[3]} pose={{ ...STAND, armF: [-0.9, -0.2], armB: [-0.1, 0.1], headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5 (0–219): kantor HRD -> rumah malam (cut internal lewat surat cuti). */
const Shot05: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={130}>
      <Shot05a />
    </Sequence>
    <Sequence from={130}>
      <Shot05b />
    </Sequence>
  </>
);

/** Shot 6 (0–155): rumah malam. Arif mengangkat salinan pasal; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–48f): jalan masuk ke meja. Beat 2 (48–108f): angkat pasal + big text stagger. Beat 3 (108–155f): menatap big text.
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
          look={ARIF}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 48 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["HAK", "TIDAK", "BEKERJA"]} at={48} stagger={3} top={420} fontSize={104} accent={["BEKERJA"]} />
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

/** Shot 7 (0–134): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Arif menunjuk item 1-2 (0–54f), lalu 3-4 (54–108f), item 5 tercentang (108f+).
  const pointY = frame < 54 ? 0 : frame < 108 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Arif kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={ARIF}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: C.alertRed }}>PASAL 118 AYAT 5</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · CUTI TAHUNAN</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          Cuti tahunan min. 12 hari kerja
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 118 ayat 5)</div>
          <span style={{ fontFamily: FONT.title, fontSize: 64, color: "#c0241c", lineHeight: 1 }}>118</span>
        </LawItem>
        <LawItem at={27}>
          Upah penuh selama cuti tahunan
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 123 ayat 1)</div>
        </LawItem>
        <LawItem at={54}>
          Lembur butuh persetujuan pekerja
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 116 ayat 1)</div>
        </LawItem>
        <LawItem at={81}>
          Cuti = hak untuk tidak bekerja — hari kerja saat cuti dijadwal ulang, jatah tetap utuh
        </LawItem>
        <LawItem at={108}>
          Jatah 5 hari Arif tetap utuh — 2 hari diganti
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–110): Arif jalan kembali ke gudang membawa salinan pasal. */
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
          look={ARIF}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–168): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
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
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Dua harinya dijadwal ulang.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah disuruh kerja saat cuti? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–278): kembali bekerja -> end card. */
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

export const EP18: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 204, words: timedCaptions([["Cuti", 0, 560], ["lima", 560, 1100], ["hari", 1100, 1300], ["Arif", 1300, 1680], ["sudah", 1680, 2140], ["disetujui,", 2140, 2860], ["tas", 3400, 3700], ["sudah", 3700, 4020], ["dikemas,", 4020, 4480], ["besok", 4880, 5300], ["ia", 5300, 5540], ["pulang", 5540, 5940], ["kampung", 5940, 6380], ["menemui", 6380, 6980], ["ibunya.", 6980, 7500]], 0), yellow: ["CUTI", "LIMA", "HARI", "ARIF", "DISETUJUI"] },
    { start: 204, end: 391, words: timedCaptions([["Arif,", 8500, 9260], ["staf", 9400, 9720], ["gudang", 9720, 10100], ["di", 10100, 10280], ["Sidoarjo,", 10280, 10760], ["tiga", 11260, 11500], ["tahun", 11500, 11800], ["bekerja", 11800, 12180], ["di", 12180, 12300], ["sini,", 12300, 12500], ["belum", 12960, 13160], ["pernah", 13160, 13460], ["sekalipun", 13460, 14080], ["mengambil", 14080, 14520], ["cuti.", 14520, 14800]], 8500), yellow: ["GUDANG", "SIDOARJO", "TIGA", "CUTI"] },
    { start: 391, end: 533, words: timedCaptions([["Hari", 16280, 16700], ["kedua", 16700, 16980], ["cuti,", 16980, 17300], ["telepon", 17620, 17880], ["berdering.", 17880, 18340], ["Stok", 18860, 19080], ["opname", 19080, 19360], ["memendesak,", 19360, 19880], ["masuk", 20100, 20340], ["kerja", 20340, 20680], ["sekarang.", 20680, 21040]], 16280), yellow: ["CUTI", "TELEPON", "STOK", "OPNAME"] },
    { start: 533, end: 604, words: timedCaptions([["Dua", 22220, 22500], ["hari", 22500, 22800], ["Arif", 22800, 23120], ["kembali", 23120, 23520], ["ke", 23520, 23700], ["gudang.", 23700, 24080]], 22220), yellow: ["DUA", "HARI", "GUDANG"] },
    { start: 604, end: 826, words: timedCaptions([["Sepulang", 25160, 25920], ["cuti,", 25920, 26240], ["HRD", 26480, 26960], ["berkata,", 26960, 27340], ["jatah", 27780, 28160], ["lima", 28160, 28380], ["harimu", 28380, 28760], ["sudah", 28760, 28980], ["habis", 28980, 29320], ["terpakai.", 29320, 29840], ["Arif", 30760, 31340], ["menatap", 31340, 31760], ["surat", 31760, 32040], ["cutinya,", 32040, 32420], ["tak", 32720, 32820], ["percaya.", 32820, 33200]], 25160), yellow: ["HRD", "HABIS", "TERPAKAI", "SURAT", "CUTI"] },
    { start: 826, end: 969, words: timedCaptions([["Undang-Undang", 34420, 35360], ["Nomor", 35360, 35660], ["27", 35660, 36100], ["Tahun", 36100, 36640], ["2026", 36640, 37560], ["Pasal", 37560, 38140], ["118", 38140, 38920], ["ayat", 38920, 39300], ["lima.", 39300, 39680]], 34420), yellow: ["UNDANG-UNDANG", "PASAL", "118"] },
    { start: 969, end: 1113, words: timedCaptions([["Cuti", 40380, 40780], ["tahunan", 40780, 41260], ["paling", 41260, 41480], ["sedikit", 41480, 41820], ["dua", 41820, 41950], ["belas", 41950, 42080], ["hari", 42080, 42480], ["kerja.", 42480, 42840], ["Hak", 43360, 43580], ["pekerja", 43580, 44040], ["untuk", 44040, 44400], ["tidak", 44400, 44740], ["bekerja.", 44740, 45240]], 40380), yellow: ["CUTI", "DUA", "BELAS", "HAK"] },
    { start: 1113, end: 1364, words: timedCaptions([["Arif", 46380, 47140], ["kembali", 47140, 47500], ["keesokan", 47500, 48020], ["harinya,", 48020, 48360], ["dengan", 48720, 48880], ["salinan", 48880, 49300], ["pasal", 49300, 49660], ["di", 49660, 49780], ["tangannya.", 49780, 50100], ["Dua", 51260, 51980], ["harinya", 51980, 52320], ["dijadwal", 52320, 52740], ["ulang,", 52740, 53040], ["karena", 53280, 53620], ["setiap", 53620, 54040], ["pekerja", 54040, 54420], ["punya", 54420, 54840], ["cerita.", 54840, 55260]], 46380), yellow: ["SALINAN", "PASAL", "DIJADWAL", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep18.mp3")} />
      <Sequence durationInFrames={180}>
        <Shot01 dur={180} />
      </Sequence>
      <Sequence from={180} durationInFrames={175}>
        <Shot02 dur={175} />
      </Sequence>
      <Sequence from={355} durationInFrames={150}>
        <Shot03 dur={150} />
      </Sequence>
      <Sequence from={505} durationInFrames={73}>
        <Shot04 dur={73} />
      </Sequence>
      <Sequence from={578} durationInFrames={219}>
        <Shot05 dur={219} />
      </Sequence>
      <Sequence from={797} durationInFrames={155}>
        <Shot06 dur={155} />
      </Sequence>
      <Sequence from={952} durationInFrames={134}>
        <Shot07 />
      </Sequence>
      <Sequence from={1086}>
        <Shot08 dur={278} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
