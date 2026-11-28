import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, SkylineFar, SkylineNear } from "../../kit/Backgrounds";

/**
 * EP24 — "Seragam Bayar Sendiri" (24 fps, 1080x1920, 71,02 detik).
 * Format >60 detik (naskah 145 kata, pita 140–150; pace 0,490 dtk/kata).
 * Yoga, 24 th, pekerja gudang ekspedisi di Palembang, baru seminggu:
 * hari pertama disuruh beli paket "seragam" Rp250.000 (baju + sepatu
 * safety + rompi + helm) — langsung dipotong dari gaji pertama
 * Rp3.500.000, diterima Rp3.250.000.
 * Saksi: Irfan, 30 th, rekan gudang — dulu disuruh bayar paket yang sama.
 * Hukum: Permenaker 8/2010 Pasal 2 ayat (1) + (3) (APD wajib disediakan
 * pengusaha + diberikan cuma-cuma) + Pasal 3 (APD meliputi pelindung kaki,
 * kepala, dll) + PP 36/2021 Pasal 63 (potongan upah hanya 6 hal) +
 * Pasal 65 (total potongan paling banyak 50% upah). UU 27/2026 Pasal 130
 * ayat (6) huruf c terverifikasi tapi hanya penguat — TIDAK masuk S07.
 * VO: Sulafat 71,02 dtk (public/voice_over_ep24.mp3; raw 82,57 dtk, trim
 * jeda max 0,4 dtk -> 79,06 dtk, atempo 1,1135). Baris 1–5 model
 * gemini-2.5-flash-preview-tts; baris 6 model gemini-3.1-flash-tts-preview
 * (kuota model pertama habis di 10 req/hari — suara tetap Sulafat,
 * level dicek setara: mean -17,1 dB vs -18,6 dB baris 5).
 * Word timings dari alignment.json faster-whisper small (136 token;
 * koreksi: angka dieja, "3,500"->tiga juta lima ratus ribu,
 * "2008"->delapan Tahun dua ribu sepuluh, ongkos/geleng-geleng/
 * cuma-cuma disambung, ditangan,->di tangan,, pertamanya.->pertamanya:,
 * Baru->baru, Pekerja->pekerja, Baju,->baju,, Total->total,
 * Padahal->padahal, senyum.->senyum,, helm.->helm, diri,->diri,
 * biasa,->biasa, tahun.->tahun,, 2,->dua, Ayat->ayat, 3.->tiga.).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap, beat saksi Irfan (S05).
 * Render: GitHub Actions. Set: rumah pagi (HomeInteriorBg) + jalan
 * Palembang (parallax) + gudang ekspedisi (WarehouseBg digambar inline —
 * kit TIDAK punya GudangBg; rak + kardus + forklift) + rumah malam
 * (HomeInteriorBg night).
 * Kartu hukum S07 langsung pakai dimensi final EP22 (top 60, font 28,
 * margin 18, padding 20/24) — pelajaran bug overlap EP21/EP22.
 * Mood "calm" BUKAN mood valid di kit — S03 memakai hopeful -> worried.
 */

export const EP24_TOTAL = 1704; // 71,02 s @ 24 fps

/** Yoga: kemeja biru baja gudang + name tag "YOGA". */
const YOGA: Look = { body: "#2e5f7a", pants: "#1d1d1f", nameTag: "YOGA" };
/** Irfan: kemeja zaitun + name tag "IRFAN". */
const IRFAN: Look = { body: "#6b7a2e", pants: "#1d1d1f", nameTag: "IRFAN" };
/** Pak Anto, kepala gudang: kemeja marun, rambut beruban + name tag "PAK ANTO". */
const ANTO: Look = { body: "#7a2e3a", pants: "#1d1d1f", hair: "#8a8a8a", nameTag: "PAK ANTO" };

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

/** Gudang ekspedisi (digambar inline — kit tidak punya GudangBg):
 * rak besi + kardus + forklift. Dinding sampai y=1400 (lantai digambar shot). */
const WarehouseBg: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1400} fill="#e8e0d0" />
    {/* rak besi kiri */}
    <rect x={50} y={420} width={14} height={980} fill="#5a6a7a" />
    <rect x={286} y={420} width={14} height={980} fill="#5a6a7a" />
    {[520, 760, 1000].map((y) => (
      <rect key={y} x={50} y={y} width={250} height={16} fill="#7a8a9a" />
    ))}
    <rect x={70} y={440} width={110} height={80} fill="#b98a4a" stroke={C.ink} strokeWidth={4} />
    <rect x={190} y={450} width={90} height={70} fill="#a87a3e" stroke={C.ink} strokeWidth={4} />
    <rect x={70} y={680} width={130} height={80} fill="#b98a4a" stroke={C.ink} strokeWidth={4} />
    <rect x={210} y={690} width={80} height={70} fill="#c89a5a" stroke={C.ink} strokeWidth={4} />
    <rect x={80} y={920} width={120} height={80} fill="#a87a3e" stroke={C.ink} strokeWidth={4} />
    {/* forklift kanan */}
    <g transform="translate(760,1240)">
      <rect x={0} y={0} width={180} height={110} rx={10} fill="#d88a2a" stroke={C.ink} strokeWidth={5} />
      <rect x={120} y={-120} width={14} height={230} fill="#3a3a3f" />
      <rect x={120} y={-120} width={90} height={14} fill="#3a3a3f" />
      <rect x={134} y={96} width={120} height={12} fill="#3a3a3f" />
      <circle cx={50} cy={118} r={34} fill="#1d1d1f" stroke={C.ink} strokeWidth={4} />
      <circle cx={150} cy={118} r={26} fill="#1d1d1f" stroke={C.ink} strokeWidth={4} />
      <rect x={20} y={-60} width={90} height={60} rx={8} fill="#f7f1e3" stroke={C.ink} strokeWidth={4} />
    </g>
    {/* kardus di lantai */}
    <rect x={560} y={1290} width={120} height={110} fill="#b98a4a" stroke={C.ink} strokeWidth={4} />
    <rect x={690} y={1310} width={90} height={90} fill="#c89a5a" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Slip gaji Yoga: gaji Rp3.500.000, potongan Rp250.000, diterima Rp3.250.000. */
const PaySlip: React.FC<{ mini?: boolean }> = ({ mini = false }) => {
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
      <text x={0} y={-130} fontFamily={FONT.mono} fontWeight={800} fontSize={22} fill={C.ink} textAnchor="middle">YOGA — GUDANG</text>
      <text x={0} y={-90} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">GAJI Rp3.500.000</text>
      <line x1={-150} y1={-60} x2={150} y2={-60} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      <text x={0} y={-10} fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill={C.ink} textAnchor="middle">DIPOTONG</text>
      <text x={0} y={28} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill="#c0241c" textAnchor="middle">Rp250.000</text>
      <text x={0} y={88} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill="#c0241c" textAnchor="middle">7% GAJI</text>
      <line x1={-150} y1={120} x2={150} y2={120} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      <text x={0} y={170} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">DITERIMA Rp3.250.000</text>
    </g>
  );
};

/** Dompet tipis Yoga (di meja S01, di tangan S04). Titik (0,0) = tengah dompet. */
const Wallet: React.FC<{ mini?: boolean }> = ({ mini = false }) => {
  if (mini) {
    return (
      <g>
        <rect x={-30} y={-20} width={60} height={40} rx={6} fill="#6b3a2a" stroke={C.ink} strokeWidth={4} />
        <rect x={-30} y={-6} width={60} height={8} fill="#4a2a1e" />
      </g>
    );
  }
  return (
    <g>
      <rect x={-80} y={-50} width={160} height={100} rx={12} fill="#6b3a2a" stroke={C.ink} strokeWidth={5} />
      <rect x={-80} y={-14} width={160} height={18} fill="#4a2a1e" />
      <rect x={-58} y={-78} width={44} height={40} rx={4} fill="#3f7a4a" stroke={C.ink} strokeWidth={3} transform="rotate(-8 -36 -58)" />
      <circle cx={58} cy={28} r={12} fill="#e2a748" stroke={C.ink} strokeWidth={3} />
    </g>
  );
};

/** Paket "seragam" di atas meja kepala gudang (S03): baju lipat + rompi
 * oranye + helm kuning + sepatu safety. Titik (0,0) = tengah paket. */
const UniformPackage: React.FC = () => (
  <g>
    {/* baju lipat */}
    <rect x={-160} y={-30} width={130} height={60} rx={8} fill="#2e5f7a" stroke={C.ink} strokeWidth={4} />
    <line x1={-95} y1={-30} x2={-95} y2={30} stroke={C.ink} strokeWidth={3} />
    {/* rompi oranye */}
    <rect x={-20} y={-40} width={110} height={70} rx={8} fill="#e8821e" stroke={C.ink} strokeWidth={4} />
    <line x1={-20} y1={-12} x2={90} y2={-12} stroke="#fdf8ea" strokeWidth={6} />
    <line x1={-20} y1={8} x2={90} y2={8} stroke="#fdf8ea" strokeWidth={6} />
    {/* helm kuning */}
    <path d="M120,-10 a45,45 0 0 1 90,0 Z" fill="#f5c542" stroke={C.ink} strokeWidth={4} />
    <rect x={110} y={-14} width={110} height={12} rx={6} fill="#f5c542" stroke={C.ink} strokeWidth={4} />
    {/* sepatu safety */}
    <g transform="translate(40,52)">
      <path d="M-46,10 L-46,-8 Q-46,-22 -18,-22 L8,-22 Q26,-22 34,-6 L42,2 L42,10 Z" fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
      <rect x={-46} y={6} width={88} height={10} rx={3} fill="#e2a748" stroke={C.ink} strokeWidth={3} />
    </g>
  </g>
);

/** Sepatu safety lama Irfan (dipegang S05). Titik (0,0) = tengah sepatu. */
const SafetyShoe: React.FC = () => (
  <g>
    <path d="M-56,16 L-56,-10 Q-56,-28 -24,-28 L10,-28 Q32,-28 42,-8 L52,4 L52,16 Z" fill="#4a4a4f" stroke={C.ink} strokeWidth={5} />
    <rect x={-56} y={10} width={108} height={14} rx={4} fill="#e2a748" stroke={C.ink} strokeWidth={3} />
    <line x1={-20} y1={-28} x2={-20} y2={-10} stroke={C.ink} strokeWidth={3} />
    <line x1={4} y1={-28} x2={4} y2={-10} stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Map cokelat berlabel PASAL 2 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 28 : 22} fill="#fdf8ea" textAnchor="middle">2</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Kartu nama di meja: "YOGA — PEKERJA GUDANG" (default). */
const NameCard: React.FC<{ name?: string; role?: string }> = ({ name = "YOGA", role = "PEKERJA GUDANG" }) => (
  <g>
    <rect x={-55} y={-22} width={110} height={44} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-4} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill={C.ink} textAnchor="middle">{name}</text>
    <text x={0} y={14} fontFamily={FONT.mono} fontWeight={700} fontSize={11} fill="#6b675f" textAnchor="middle">{role}</text>
  </g>
);

/** Shot 1 (0–181): rumah Yoga pagi. Yoga menatap slip gaji; big text. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Beat 1 (0–40f): Yoga di meja, slip di tangan. Beat 2 (40–100f): angka Rp250.000 muncul. Beat 3 (100–181f): big text.
  const showSlip = frame >= 40;
  const bubble = frame < 60 ? 0 : spring({ frame: frame - 60, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <HomeInteriorBg />
        {/* slip gaji besar di meja + dompet tipis */}
        <g transform="translate(540,1010)">
          <PaySlip />
        </g>
        <g transform="translate(830,1100)">
          <Wallet />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={320} floor={FLOOR} scale={0.95} look={YOGA} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.06 }} mood={frame < 100 ? "worried" : "shocked"} lookAt={0.5} holdF={showSlip ? <PaySlip mini /> : undefined} />
      </Canvas>
      {/* bubble angka Rp250.000 (HTML, terbaca) */}
      <div style={{ position: "absolute", top: 290, left: "50%", transform: `translateX(-50%) scale(${bubble})`, opacity: bubble, width: 860, background: "white", borderRadius: 24, padding: "22px 30px", boxShadow: "0 8px 0 rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, color: "#c0241c", lineHeight: 1.25 }}>
          Dipotong: Rp250.000
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: "#6b675f", marginTop: 8 }}>dari gaji Rp3.500.000 • baru seminggu kerja</div>
      </div>
      <KineticText words={["GAJI", "DIPOTONG", "RP250 RIBU"]} at={100} stagger={3} top={520} fontSize={80} accent={["RP250 RIBU"]} />
    </Camera>
  );
};

/** Shot 2 (181–426): tracking shot jalan pagi Palembang. Yoga menyeberang penuh kiri -> kanan, parallax 2 lapis, gerbang gudang di kanan. */
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
        {/* gerbang gudang ekspedisi */}
        <g>
          <rect x={760} y={1080} width={260} height={320} fill="#23282e" stroke={C.ink} strokeWidth={5} />
          <text x={890} y={1170} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#fdf8ea" textAnchor="middle">GUDANG</text>
          <text x={890} y={1215} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill="#fdf8ea" textAnchor="middle">EKSPEDISI</text>
        </g>
        <Stick x={x} floor={FLOOR} scale={0.95} look={YOGA} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["PEKERJA", "GUDANG,", "SEMINGGU"]} at={60} stagger={3} top={420} fontSize={64} accent={["SEMINGGU"]} />
    </Camera>
  );
};

/** Shot 3 (426–707): gudang ekspedisi. Pak Anto menyodorkan paket seragam; Yoga menerima. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat tenang (0–92f): hopeful — "calm" bukan Mood valid di kit.
  const m = frame < 92 ? "hopeful" : "worried";
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <WarehouseBg />
        {/* paket seragam di atas meja kepala gudang */}
        <g transform="translate(540,1120)">
          <UniformPackage />
        </g>
        <g transform="translate(290,1280)">
          <NameCard name="PAK ANTO" role="KEPALA GUDANG" />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick
          x={340}
          floor={FLOOR}
          scale={0.95}
          look={YOGA}
          pose={{ ...STAND, armF: [0.9, 0.4], armB: [0.3, 0.5], lean: 0.08, headTilt: frame >= 92 ? 0.12 : 0 }}
          mood={m}
          lookAt={0.8}
          holdF={frame >= 60 ? <Wallet mini /> : undefined}
        />
        <Stick x={820} floor={FLOOR} scale={0.95} look={ANTO} pose={{ ...STAND, armF: [1.2, 0.2], armB: [0.2, 0.1], lean: -0.03, headTilt: -0.08 }} mood="worried" lookAt={-0.8} />
      </Canvas>
      <KineticText words={["RP250.000,", "POTONG", "GAJI"]} at={92} stagger={3} top={420} fontSize={64} accent={["RP250.000,"]} />
    </Camera>
  );
};

/** Shot 4 (707–950): close-up rumah malam. Yoga menghitung uang di dompet — tinggal ongkos pulang. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 2 (120f+): Yoga makin sedih — dompet tinggal ongkos pulang.
  const m = frame < 120 ? "worried" : "sad";
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%">
      <Canvas bg="#f7f1e3">
        <HomeInteriorBg night />
        {/* paket seragam tergeletak di meja */}
        <g transform="translate(430,1120)">
          <UniformPackage />
        </g>
        <g transform="translate(290,1280)">
          <NameCard />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={YOGA} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.1 }} mood={m} lookAt={1} holdF={<Wallet mini />} />
      </Canvas>
      <KineticText words={["TINGGAL", "UANG", "ONGKOS"]} at={40} stagger={3} top={420} fontSize={88} accent={["ONGKOS"]} />
    </Camera>
  );
};

/** Shot 5 (950–1119): Irfan di gudang sebelah menunjukkan sepatu safety lamanya — "Irfan juga sama". */
const Shot05: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 85 ? "resigned" : "determined";
  return (
    <Camera dur={dur} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <WarehouseBg />
        <g transform="translate(290,1280)">
          <NameCard name="IRFAN" role="REKAN GUDANG" />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={YOGA} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.12 }} mood="worried" lookAt={1} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={IRFAN} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.06 }} mood={mood} lookAt={-0.6} holdF={frame >= 40 ? <SafetyShoe /> : undefined} />
      </Canvas>
      <KineticText words={["IRFAN", "JUGA", "SAMA"]} at={30} stagger={3} top={420} fontSize={88} accent={["SAMA"]} />
    </Camera>
  );
};

/** Shot 6 (1119–1307): rumah malam. Yoga mengangkat salinan aturan; big text kinetik. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–50f): jalan masuk ke meja. Beat 2 (50–188f): angkat aturan + big text.
  const walking = frame < 50;
  const x = walking ? interpolate(frame, [0, 50], [80, 420], { extrapolateRight: "clamp" }) : 420;
  const pose: Pose = walking
    ? walk((x - 80) / walkCycle(0.9, 0.95), 0.9)
    : { ...STAND, armF: [1.0, 0.25], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.08 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        {/* meja + lampu meja + salinan aturan */}
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
          look={YOGA}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 50 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["APD", "GRATIS"]} at={50} stagger={3} top={420} fontSize={88} accent={["GRATIS"]} />
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
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 18, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`, opacity: s }}>
      <div style={{ flexShrink: 0, width: 50, height: 50, borderRadius: "50%", background: "#c0241c", color: "white", fontFamily: FONT.title, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>✓</div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, lineHeight: 1.25, color: C.ink }}>
        {children}
        {big}
      </div>
    </div>
  );
};

/** Shot 7 (1307–1432): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. Dimensi final EP22 (top 60, font 28). */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Yoga menunjuk item 1-2 (0–50f), lalu 3-4 (50–100f), item 5 tercentang (100f+).
  const pointY = frame < 50 ? 0 : frame < 100 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Yoga kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={YOGA}
          pose={{ ...STAND, armF: [1.35, 0.12], armB: [-0.15, 0.1], lean: 0.04, headTilt: pointY === 2 ? 0 : -0.04 }}
          mood="determined"
          lookAt={1}
        />
      </svg>
      {/* kartu hukum krem */}
      <div
        style={{
          position: "absolute", left: 400, top: 60, width: 620, background: C.paper, border: `5px solid ${C.ink}`,
          boxShadow: "10px 12px 0 rgba(0,0,0,0.45)", padding: "20px 32px 24px", transform: `scale(${cardIn})`, opacity: cardIn,
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: C.alertRed }}>PASAL 2</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>PERMENAKER 8/2010 · ALAT PELINDUNG DIRI</div>
        <div style={{ height: 4, background: C.ink, marginTop: 12, opacity: 0.85 }} />
        <LawItem at={0}>
          APD wajib disediakan pengusaha
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Permenaker 8/2010 Pasal 2 ayat 1)</div>
        </LawItem>
        <LawItem at={25}>
          APD diberikan secara cuma-cuma
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 2 ayat 3)</div>
        </LawItem>
        <LawItem at={50}>
          Sepatu safety + rompi + helm itu APD
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 3)</div>
        </LawItem>
        <LawItem at={75}>
          Potongan upah cuma untuk 6 hal — seragam tidak termasuk
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(PP 36/2021 Pasal 63)</div>
        </LawItem>
        <LawItem at={100}>
          Gaji Rp3,5 jt − Rp250 rb = Rp3,25 jt (harusnya utuh)
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–110): Yoga jalan kembali ke gudang membawa salinan aturan + slip gaji. */
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
          look={YOGA}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–162): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
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
      <div style={{ position: "absolute", top: 780, width: "100%", textAlign: "center", transform: `scale(${line})`, opacity: line, padding: "0 60px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 64, lineHeight: 1.25, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Sepatu safety itu bukan seragam biasa — itu hakmu.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah disuruh bayar seragam pas baru masuk kerja? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (1432–1704): kembali ke gudang -> end card. */
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

export const EP24: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 181, words: timedCaptions([["Yoga", 0, 380], ["menatap", 380, 1080], ["slip", 1080, 1360], ["gaji", 1360, 1720], ["pertamanya:", 1720, 2340], ["baru", 2620, 3140], ["sebulan", 3140, 3540], ["kerja,", 3540, 3920], ["gajinya", 4300, 4800], ["sudah", 4800, 5060], ["dipotong", 5060, 5580], ["dua", 5580, 5710], ["ratus", 5710, 5840], ["lima", 5840, 5970], ["puluh", 5970, 6100], ["ribu", 6100, 6780], ["rupiah.", 6780, 7140]], 0), yellow: ["GAJI", "DIPOTONG"] },
    { start: 181, end: 426, words: timedCaptions([["Yoga", 7560, 8020], ["dua", 8020, 8327], ["puluh", 8327, 8633], ["empat", 8633, 8940], ["tahun,", 8940, 9580], ["pekerja", 10100, 10520], ["di", 10520, 10700], ["gudang", 10700, 11040], ["sebuah", 11040, 11460], ["ekspedisi", 11460, 12020], ["di", 12020, 12160], ["Palembang.", 12160, 12620], ["Gaji", 13100, 13500], ["tiga", 13500, 13824], ["juta", 13824, 14148], ["lima", 14148, 14472], ["ratus", 14472, 14796], ["ribu", 14796, 15120], ["rupiah", 15120, 15480], ["sebulan,", 15480, 16060], ["baru", 16360, 16660], ["seminggu", 16660, 17040], ["di", 17040, 17180], ["sana.", 17180, 17420]], 7560), yellow: ["GUDANG", "SEMINGGU"] },
    { start: 426, end: 707, words: timedCaptions([["Hari", 17740, 18020], ["pertama", 18020, 18380], ["masuk,", 18380, 18880], ["kepala", 19340, 19580], ["gudang", 19580, 20060], ["menyodorkan", 20060, 20760], ["satu", 20760, 21060], ["paket", 21060, 21440], ["seragam.", 21440, 21880], ["baju,", 22340, 22740], ["sepatu", 23300, 23580], ["safety,", 23580, 23860], ["rompi,", 24380, 24880], ["dan", 25220, 25300], ["helm", 25300, 25580], ["total", 26060, 26280], ["harganya", 26280, 26900], ["dua", 26900, 26980], ["ratus", 26980, 27060], ["lima", 27060, 27140], ["puluh", 27140, 27220], ["ribu,", 27220, 28420], ["dipotong", 28720, 29140], ["gaji.", 29140, 29440]], 17740), yellow: ["SERAGAM", "DIPOTONG"] },
    { start: 707, end: 950, words: timedCaptions([["Yoga", 29440, 30080], ["membayar", 30080, 30840], ["sambil", 30840, 31180], ["senyum,", 31180, 31680], ["padahal", 32040, 32720], ["di", 32720, 32940], ["dompetnya", 32940, 33480], ["tinggal", 33480, 33840], ["uang", 33840, 34060], ["ongkos", 34060, 34400], ["pulang", 34400, 34680], ["saja.", 34680, 35080], ["Seragam", 35620, 36060], ["baru", 36060, 36280], ["di", 36280, 36530], ["tangan,", 36530, 36780], ["gaji", 37440, 37640], ["pertama", 37640, 38120], ["langsung", 38120, 38560], ["berkurang.", 38560, 39140]], 29440), yellow: ["UANG", "ONGKOS"] },
    { start: 950, end: 1119, words: timedCaptions([["Di", 39600, 39720], ["gudang", 39720, 39980], ["sebelah,", 39980, 40580], ["Irfan", 40800, 41060], ["cuma", 41060, 41320], ["geleng-geleng.", 41320, 42060], ["tiga", 42420, 42590], ["puluh", 42590, 42760], ["tahun,", 42760, 43320], ["dulu", 43840, 44140], ["dia", 44140, 44440], ["juga", 44440, 44680], ["disuruh", 44680, 45060], ["bayar", 45060, 45380], ["paket", 45380, 45700], ["yang", 45700, 45820], ["sama.", 45820, 46160]], 39600), yellow: ["IRFAN", "SAMA"] },
    { start: 1119, end: 1307, words: timedCaptions([["Peraturan", 46640, 47180], ["Menteri", 47180, 47760], ["Tenaga", 47760, 48080], ["Kerja", 48080, 48600], ["dan", 48600, 48920], ["Transmigrasi", 48920, 49880], ["Nomor", 49880, 50580], ["delapan", 50580, 50936], ["Tahun", 50936, 51292], ["dua", 51292, 51648], ["ribu", 51648, 52004], ["sepuluh,", 52004, 52360], ["Pasal", 52840, 53280], ["dua", 53280, 53540], ["ayat", 54040, 54160], ["tiga.", 54160, 54440]], 46640), yellow: ["PASAL", "NOMOR"] },
    { start: 1307, end: 1432, words: timedCaptions([["Alat", 54440, 55200], ["pelindung", 55200, 55500], ["diri", 55500, 55960], ["wajib", 56140, 56420], ["diberikan", 56420, 56920], ["oleh", 56920, 57180], ["pengusaha", 57180, 57820], ["secara", 57820, 58520], ["cuma-cuma.", 58520, 59240]], 54440), yellow: ["CUMA-CUMA", "PENGUSAHA"] },
    { start: 1432, end: 1704, words: timedCaptions([["Yoga", 59680, 60120], ["kembali", 60120, 60660], ["keesokan", 60660, 61140], ["harinya", 61140, 61580], ["dengan", 61580, 62020], ["salinan", 62020, 62620], ["aturan.", 62620, 63100], ["Sepatu", 63620, 63900], ["safety", 63900, 64160], ["itu", 64160, 64580], ["bukan", 64580, 64900], ["seragam", 64900, 65320], ["biasa", 65320, 65820], ["itu", 66240, 66660], ["haknya.", 66660, 67400], ["Karena", 67780, 68180], ["setiap", 68180, 69080], ["pekerja", 69080, 69600], ["punya", 69600, 70140], ["cerita.", 70140, 70640]], 59680), yellow: ["SALINAN", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep24.mp3")} />
      <Sequence durationInFrames={181}>
        <Shot01 dur={181} />
      </Sequence>
      <Sequence from={181} durationInFrames={245}>
        <Shot02 dur={245} />
      </Sequence>
      <Sequence from={426} durationInFrames={281}>
        <Shot03 dur={281} />
      </Sequence>
      <Sequence from={707} durationInFrames={243}>
        <Shot04 dur={243} />
      </Sequence>
      <Sequence from={950} durationInFrames={169}>
        <Shot05 dur={169} />
      </Sequence>
      <Sequence from={1119} durationInFrames={188}>
        <Shot06 dur={188} />
      </Sequence>
      <Sequence from={1307} durationInFrames={125}>
        <Shot07 />
      </Sequence>
      <Sequence from={1432}>
        <Shot08 dur={272} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
