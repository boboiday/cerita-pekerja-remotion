import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { SIT, STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg } from "../../kit/Backgrounds";

/**
 * EP15 — "Gaji Dipotong Karena Kesalahan Teman" (12 fps, 1080x1920, 55,2 detik).
 * Rizky, operator pabrik di Sidoarjo 2 tahun: gaji dipotong Rp600.000 karena
 * Bambang salah setting mesin — mandor: "satu tim, satu tanggung jawab".
 * Hukum: UU 27/2026 Pasal 135 ayat (7) — denda hanya untuk pelanggaran
 * karena kesengajaan atau kelalaian pekerja itu sendiri (verbatim,
 * spplaw.id) — + PP 36/2021 Pasal 63 ayat (1)-(2) (daftar tertutup 6
 * potongan; denda/ganti rugi harus sesuai PK/PP/PKB) + Pasal 65 (total
 * potongan paling banyak 50%). TIDAK ADA pasal "larangan potong gaji
 * karena kesalahan teman" khusus; TIDAK ADA klaim potongan di bawah 50%
 * otomatis sah — 12,5% di cerita ini tetap salah bila tak berdasar
 * (dicatat di kartu hukum S07 + research.txt).
 * VO: Sulafat 55.22 dtk (public/voice_over_ep15.mp3), word timings dari
 * alignment.json faster-whisper (128 kata; "Risky"->"Rizky",
 * "rekam"->"rekan", "Undang"+"-undang"->"Undang-Undang").
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 * Perbaikan gambar vs EP14: set pabrik detail (lini produksi + mesin +
 * konveyor + karung bahan baku + tumpahan) + prop slip gaji dengan angka
 * "-Rp600.000" merah + mood kit baru "indignant" (protes: alis miring ke
 * dalam + mulut garis tegas + dagu terangkat sedikit) untuk Rizky di S08.
 */

export const EP15_TOTAL = 662; // 55,2 dtk @ 12 fps

/** Rizky: kemeja putih, dasi hitam, celana hitam + name tag "RIZKY". */
const RIZKY: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f", nameTag: "RIZKY" };
/** Bambang: rekan shift, helm kuning. */
const BAMBANG: Look = { body: "#7a8ba0", pants: "#23282e", helmet: "#e2a748" };
/** Pak Darma (mandor): kemeja biru-abu, dasi merah. */
const DARMA: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };
/** Istri Rizky: ungu, rambut bun. */
const ISTRI: Look = { body: "#8a5bb5", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };

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

/** Slip gaji: kertas putih, angka potongan merah (prop S01/S04/S05). */
const Payslip: React.FC = () => (
  <g>
    <rect x={-85} y={-60} width={170} height={120} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={-68} y1={-42} x2={68} y2={-42} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-68} y1={-26} x2={68} y2={-26} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-68} y1={-10} x2={68} y2={-10} stroke="#b9b6ae" strokeWidth={3} />
    <text x={0} y={18} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">POTONGAN</text>
    <text x={0} y={46} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill="#c0241c" textAnchor="middle">-Rp600.000</text>
    <path d="M-85,34 L-68,20 L-51,34 L-34,20 L-17,34 L0,20 L17,34 L34,20 L51,34 L68,20 L85,34 L85,60 L-85,60Z" fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Map cokelat berlabel PASAL 135 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 30 : 24} fill="#fdf8ea" textAnchor="middle">135</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Ruang ganti pabrik: loker + bangku + jendela pagi (S01). */
const LockerRoomBg: React.FC = () => (
  <g>
    <rect x={0} y={FLOOR} width={1080} height={1920 - FLOOR} fill="#8a877f" />
    <rect x={0} y={FLOOR} width={1080} height={14} fill="#5c564a" />
    {/* jendela pagi kiri */}
    <rect x={70} y={280} width={380} height={520} fill="#bfe3f2" stroke={C.ink} strokeWidth={7} />
    <line x1={260} y1={280} x2={260} y2={800} stroke={C.ink} strokeWidth={5} />
    <line x1={70} y1={540} x2={450} y2={540} stroke={C.ink} strokeWidth={5} />
    <circle cx={380} cy={360} r={42} fill="#ffe9a8" stroke={C.ink} strokeWidth={4} />
    {/* jam dinding */}
    <circle cx={560} cy={360} r={48} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
    <line x1={560} y1={360} x2={544} y2={330} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <line x1={560} y1={360} x2={584} y2={374} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    {/* poster jadwal shift miring */}
    <rect x={640} y={420} width={220} height={150} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} transform="rotate(-2 750 495)" />
    <text x={750} y={480} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill={C.ink} textAnchor="middle" transform="rotate(-2 750 495)">JADWAL SHIFT</text>
    <line x1={670} y1={505} x2={830} y2={505} stroke={C.ink} strokeWidth={3} transform="rotate(-2 750 495)" />
    <line x1={670} y1={530} x2={800} y2={530} stroke="#c0241c" strokeWidth={3} transform="rotate(-2 750 495)" />
    <line x1={670} y1={552} x2={830} y2={552} stroke={C.ink} strokeWidth={3} transform="rotate(-2 750 495)" />
    {/* loker: 3 pintu, satu terbuka (baju tergantung) */}
    {[560, 730, 900].map((x, i) => (
      <g key={x}>
        <rect x={x} y={700} width={160} height={700} fill={i === 1 ? "#a8a49a" : "#8f969b"} stroke={C.ink} strokeWidth={6} />
        <rect x={x + 16} y={730} width={128} height={90} fill="none" stroke={C.ink} strokeWidth={4} />
        {[756, 776, 796].map((y) => (
          <line key={y} x1={x + 30} y1={y} x2={x + 130} y2={y} stroke={C.ink} strokeWidth={3} />
        ))}
        <rect x={x + 118} y={900} width={16} height={50} rx={8} fill={C.ink} />
        <rect x={x + 20} y={1000} width={120} height={60} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
        <text x={x + 80} y={1040} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill={C.ink} textAnchor="middle">{["A-12", "A-13", "A-14"][i]}</text>
      </g>
    ))}
    {/* pintu loker tengah terbuka + baju kerja tergantung */}
    <g transform="rotate(-24 730 700)">
      <rect x={730} y={700} width={150} height={700} fill="#7a8288" stroke={C.ink} strokeWidth={6} />
    </g>
    <path d="M795,760 L830,790 L830,860 L760,860 L760,790Z" fill="#f5f2e8" stroke={C.ink} strokeWidth={4} />
    <line x1={795} y1={740} x2={795} y2={762} stroke={C.ink} strokeWidth={4} />
    {/* bangku + tas + handuk */}
    <rect x={120} y={1230} width={380} height={24} fill="#8a5a34" stroke={C.ink} strokeWidth={5} />
    <rect x={140} y={1254} width={20} height={146} fill={C.ink} />
    <rect x={460} y={1254} width={20} height={146} fill={C.ink} />
    <rect x={330} y={1150} width={130} height={80} rx={10} fill="#284966" stroke={C.ink} strokeWidth={5} />
    <rect x={360} y={1130} width={70} height={22} rx={11} fill="#1d1d1f" stroke={C.ink} strokeWidth={4} />
    <path d="M120,1080 q60,-30 120,0 l0,90 q-60,20 -120,0Z" fill="#3f7a4a" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Lini produksi pabrik: mesin + konveyor + karung + tumpahan (S03/S04). */
const FactoryBg: React.FC<{ shakeX?: number }> = ({ shakeX = 0 }) => (
  <g>
    {/* lantai + garis hazard */}
    <rect x={0} y={FLOOR} width={1080} height={1920 - FLOOR} fill="#8a877f" />
    <rect x={0} y={FLOOR} width={1080} height={14} fill="#5c564a" />
    <rect x={0} y={FLOOR + 60} width={1080} height={26} fill="#e2a748" />
    {[0, 90, 180, 270, 360, 450, 540, 630, 720, 810, 900, 990].map((x) => (
      <polygon key={x} points={`${x},${FLOOR + 60} ${x + 45},${FLOOR + 60} ${x + 90},${FLOOR + 86} ${x + 45},${FLOOR + 86}`} fill="#1d1d1f" />
    ))}
    {/* pipa plafon + lampu gantung */}
    <rect x={0} y={90} width={1080} height={26} fill="#6b675f" stroke={C.ink} strokeWidth={4} />
    <rect x={0} y={140} width={1080} height={18} fill="#8f969b" stroke={C.ink} strokeWidth={4} />
    {[200, 540, 880].map((x) => (
      <g key={x}>
        <line x1={x} y1={158} x2={x} y2={230} stroke={C.ink} strokeWidth={5} />
        <path d={`M${x},230 L${x - 46},300 L${x + 46},300Z`} fill="#e2a748" stroke={C.ink} strokeWidth={5} />
        <circle cx={x} cy={312} r={18} fill="#ffe9a8" opacity={0.9} />
      </g>
    ))}
    {/* jendela tinggi + jam + poster keselamatan */}
    <rect x={60} y={300} width={300} height={260} fill="#bfe3f2" stroke={C.ink} strokeWidth={7} />
    <line x1={210} y1={300} x2={210} y2={560} stroke={C.ink} strokeWidth={5} />
    <line x1={60} y1={430} x2={360} y2={430} stroke={C.ink} strokeWidth={5} />
    <circle cx={600} cy={400} r={48} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
    <line x1={600} y1={400} x2={584} y2={370} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <line x1={600} y1={400} x2={624} y2={414} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <rect x={720} y={330} width={300} height={130} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} transform="rotate(2 870 395)" />
    <text x={870} y={382} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#c0241c" textAnchor="middle" transform="rotate(2 870 395)">UTAMAKAN</text>
    <text x={870} y={418} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill={C.ink} textAnchor="middle" transform="rotate(2 870 395)">KESELAMATAN</text>
    {/* APAR */}
    <rect x={60} y={900} width={60} height={150} rx={14} fill="#c0241c" stroke={C.ink} strokeWidth={5} />
    <rect x={76} y={870} width={28} height={34} fill="#1d1d1f" stroke={C.ink} strokeWidth={4} />
    <text x={90} y={990} fontFamily={FONT.mono} fontWeight={800} fontSize={18} fill="white" textAnchor="middle">APAR</text>
    {/* MESIN (bergetar saat salah setting) */}
    <g transform={`translate(${shakeX},0)`}>
      <rect x={150} y={640} width={380} height={760} fill="#5d6b7a" stroke={C.ink} strokeWidth={7} />
      <rect x={150} y={640} width={380} height={60} fill="#46525f" stroke={C.ink} strokeWidth={5} />
      <rect x={180} y={740} width={320} height={180} fill="#2c3644" stroke={C.ink} strokeWidth={5} />
      <rect x={200} y={760} width={280} height={140} fill="#7fb3d5" stroke={C.ink} strokeWidth={3} />
      <circle cx={240} cy={800} r={14} fill="#3ecf6e" stroke={C.ink} strokeWidth={3} />
      <circle cx={290} cy={800} r={14} fill="#e2a748" stroke={C.ink} strokeWidth={3} />
      <circle cx={340} cy={800} r={14} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
      <line x1={220} y1={850} x2={460} y2={850} stroke="#f5f2e8" strokeWidth={4} />
      <line x1={220} y1={880} x2={420} y2={880} stroke="#f5f2e8" strokeWidth={4} />
      {/* panel kontrol */}
      <rect x={400} y={980} width={110} height={150} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
      <circle cx={430} cy={1015} r={12} fill="#3ecf6e" stroke={C.ink} strokeWidth={3} />
      <circle cx={480} cy={1015} r={12} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
      <rect x={420} y={1050} width={70} height={50} rx={6} fill="#e2a748" stroke={C.ink} strokeWidth={4} />
      {/* ventilasi + roda */}
      {[980, 1040, 1100, 1160, 1220].map((y) => (
        <line key={y} x1={180} y1={y} x2={500} y2={y} stroke="#2c3644" strokeWidth={6} />
      ))}
      <circle cx={220} cy={1400} r={30} fill="#1d1d1f" stroke={C.ink} strokeWidth={5} />
      <circle cx={460} cy={1400} r={30} fill="#1d1d1f" stroke={C.ink} strokeWidth={5} />
      {/* pipa masuk mesin */}
      <rect x={300} y={480} width={40} height={160} fill="#8f969b" stroke={C.ink} strokeWidth={5} />
      <rect x={280} y={480} width={80} height={26} fill="#6b675f" stroke={C.ink} strokeWidth={4} />
    </g>
    {/* KONVEYOR kanan */}
    <g>
      <rect x={580} y={1080} width={440} height={60} fill="#3a3a3f" stroke={C.ink} strokeWidth={6} />
      {[620, 700, 780, 860, 940].map((x) => (
        <circle key={x} cx={x} cy={1110} r={22} fill="#8f969b" stroke={C.ink} strokeWidth={4} />
      ))}
      <rect x={600} y={1140} width={20} height={260} fill={C.ink} />
      <rect x={980} y={1140} width={20} height={260} fill={C.ink} />
      {/* karung di atas konveyor */}
      <path d="M640,1080 q0,-70 60,-70 q60,0 60,70Z" fill="#cdbf9c" stroke={C.ink} strokeWidth={5} />
      <path d="M790,1080 q0,-70 60,-70 q60,0 60,70Z" fill="#b8a67e" stroke={C.ink} strokeWidth={5} />
      <text x={700} y={1052} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle">BAKU</text>
    </g>
    {/* tumpukan karung bahan baku */}
    <g>
      <path d="M880,1400 q0,-80 70,-80 q70,0 70,80Z" fill="#cdbf9c" stroke={C.ink} strokeWidth={5} />
      <path d="M990,1400 q0,-80 70,-80 q60,0 60,80Z" fill="#b8a67e" stroke={C.ink} strokeWidth={5} />
      <path d="M930,1320 q0,-70 60,-70 q60,0 60,70Z" fill="#cdbf9c" stroke={C.ink} strokeWidth={5} />
    </g>
    {/* tumpahan bahan baku di lantai */}
    <ellipse cx={720} cy={1380} rx={130} ry={22} fill="#c9a24a" stroke={C.ink} strokeWidth={4} />
    {[[620, 1352], [680, 1368], [780, 1352], [830, 1372], [650, 1390], [760, 1392]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={9} fill="#c9a24a" stroke={C.ink} strokeWidth={3} />
    ))}
  </g>
);

/** Lapis jauh gerbang pabrik: gedung + cerobong + asap (S02 parallax). */
const FactoryFar: React.FC = () => (
  <g>
    <rect x={-100} y={900} width={700} height={500} fill="#5d6280" stroke={C.ink} strokeWidth={5} />
    <path d="M-100,900 L-20,820 L60,900 L140,820 L220,900 L300,820 L380,900 L460,820 L540,900 L600,900 L600,1400 L-100,1400Z" fill="#545872" stroke={C.ink} strokeWidth={5} />
    <rect x={620} y={980} width={260} height={420} fill="#5d6280" stroke={C.ink} strokeWidth={5} />
    <Windows x={640} y={1020} cols={6} rows={7} />
    <rect x={920} y={560} width={90} height={840} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={905} y={540} width={120} height={30} fill="#5c4033" stroke={C.ink} strokeWidth={4} />
    <circle cx={965} cy={480} r={26} fill="#f5f2e8" opacity={0.85} />
    <circle cx={965} cy={420} r={34} fill="#f5f2e8" opacity={0.6} />
    <circle cx={965} cy={350} r={42} fill="#f5f2e8" opacity={0.4} />
    <rect x={1080} y={840} width={240} height={560} fill="#545872" stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Grid jendela kecil (dipakai FactoryFar). */
const Windows: React.FC<{ x: number; y: number; cols: number; rows: number }> = ({ x, y, cols, rows }) => (
  <g>
    {Array.from({ length: rows }).map((_, j) =>
      Array.from({ length: cols }).map((_, i) => (
        <rect key={`${i}-${j}`} x={x + i * 34} y={y + j * 44} width={22} height={30} fill={(i * 7 + j * 11) % 4 === 0 ? "#ffc338" : "#1d1d1f"} stroke={C.ink} strokeWidth={2} />
      )),
    )}
  </g>
);

/** Lapis dekat: pagar + gerbang pabrik + lampu jalan (S02 parallax). */
const FactoryNear: React.FC = () => (
  <g>
    {Array.from({ length: 38 }).map((_, i) => (
      <rect key={i} x={-100 + i * 40} y={950} width={12} height={450} fill="#2c3048" stroke={C.ink} strokeWidth={3} />
    ))}
    <rect x={-100} y={950} width={1620} height={18} fill="#2c3048" stroke={C.ink} strokeWidth={4} />
    <rect x={-100} y={1180} width={1620} height={18} fill="#2c3048" stroke={C.ink} strokeWidth={4} />
    {/* gerbang */}
    <rect x={560} y={900} width={26} height={500} fill="#c0241c" stroke={C.ink} strokeWidth={5} />
    <rect x={900} y={900} width={26} height={500} fill="#c0241c" stroke={C.ink} strokeWidth={5} />
    <rect x={560} y={900} width={366} height={40} fill="#c0241c" stroke={C.ink} strokeWidth={5} />
    <text x={743} y={930} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="white" textAnchor="middle">PABRIK</text>
    {/* lampu jalan */}
    {[140, 1180].map((x) => (
      <g key={x}>
        <rect x={x} y={1080} width={14} height={320} fill={C.ink} />
        <circle cx={x + 7} cy={1064} r={26} fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
      </g>
    ))}
  </g>
);

/** Meja makan rumah: meja + slip gaji di atasnya (S05/S06). */
const DiningTable: React.FC = () => (
  <g>
    <rect x={150} y={1150} width={780} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={180} y={1176} width={720} height={224} fill="#4a3428" />
    <rect x={200} y={1180} width={18} height={220} fill={C.ink} />
    <rect x={860} y={1180} width={18} height={220} fill={C.ink} />
    {/* lampu meja */}
    <rect x={830} y={980} width={14} height={170} fill={C.ink} />
    <path d="M837,980 L770,920 L904,920Z" fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
    <circle cx={837} cy={975} r={24} fill="#ffe9a8" opacity={0.85} />
    {/* gelas + piring */}
    <rect x={260} y={1090} width={50} height={60} fill="#7fb3d5" stroke={C.ink} strokeWidth={4} />
    <ellipse cx={700} cy={1130} rx={70} ry={18} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** HP kecil dengan layar terang (tangan Rizky, S05 beat 3). */
const Phone: React.FC = () => (
  <g>
    <rect x={-22} y={-48} width={44} height={80} rx={8} fill="#1d1d1f" stroke={C.ink} strokeWidth={4} />
    <rect x={-16} y={-40} width={32} height={56} fill="#bfe3f2" stroke={C.ink} strokeWidth={2} />
    <text x={0} y={-16} fontFamily={FONT.mono} fontWeight={800} fontSize={13} fill={C.ink} textAnchor="middle">UU</text>
    <text x={0} y={2} fontFamily={FONT.mono} fontWeight={800} fontSize={13} fill={C.ink} textAnchor="middle">27</text>
  </g>
);

/** Shot 1 (0–82): ruang ganti pagi. Rizky buka slip gaji, membelalak, -Rp600.000. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–24f): buka lipatan slip, push-in mulai, pill tampil.
  // Beat 2 (24–54f): mata membelalak (shocked), slip terangkat.
  // Beat 3 (54–82f): big text -Rp600.000 merah, Rizky menatap slip (worried).
  const mood = frame < 24 ? "worried" : frame < 54 ? "shocked" : "worried";
  const slipY = frame < 24 ? 0 : frame < 54 ? interpolate(frame, [24, 54], [0, -40]) : -40;
  const headTilt = frame < 54 ? 0.05 : 0.12;
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <LockerRoomBg />
        <Stick
          x={480}
          floor={FLOOR}
          scale={1.0}
          look={RIZKY}
          pose={{ ...STAND, armF: [0.7, 0.4], armB: [0.5, 0.35], lean: 0.04, headTilt }}
          mood={mood}
          lookAt={0.3}
          holdF={<g transform={`translate(0,${slipY})`}><Payslip /></g>}
        />
      </Canvas>
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 52, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          GAJIAN. <span style={{ color: C.capYellow }}>SLIP DIBUKA.</span>
        </span>
      </div>
      <KineticText words={["-Rp600.000"]} at={54} stagger={3} top={460} fontSize={110} accent={["-Rp600.000"]} />
    </Camera>
  );
};

/** Shot 2 (0–124): tracking shot trotoar pagi. Rizky jalan penuh kiri -> kanan, parallax 2 lapis. */
const Shot02: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [80, 1000], { extrapolateRight: "clamp" });
  const pose = { ...walk((x - 80) / walkCycle(0.9, 0.95), 0.9), headTilt: 0 };
  const lookRight = frame > 84;
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
        {/* jalan + trotoar */}
        <rect x={0} y={1400} width={1080} height={520} fill="#3a3a3f" />
        <rect x={0} y={1400} width={1080} height={16} fill="#5c564a" />
        <rect x={0} y={1460} width={1080} height={10} fill="#e2a748" strokeDasharray="40 30" />
        <Stick x={x} floor={FLOOR} scale={0.95} look={RIZKY} pose={pose} mood="worried" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["2", "TAHUN", "OPERATOR", "DI", "SIDOARJO"]} at={42} stagger={3} top={420} fontSize={88} accent={["SIDOARJO"]} />
    </Camera>
  );
};

/** Shot 3 (0–114): lini produksi. Bambang salah setting mesin, bahan baku tumpah, Rizky menoleh. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–36f): Bambang menekan panel, mesin bergetar, push-in mulai.
  // Beat 2 (36–72f): bahan baku tumpah dari konveyor, Bambang mundur, big text.
  // Beat 3 (72–114f): Rizky di lini lain menoleh (shocked), Bambang menunduk.
  const shakeX = frame < 36 ? Math.sin(frame * 1.4) * 2.5 : frame < 72 ? Math.sin(frame * 1.4) * 1.5 : 0;
  const bambangX = frame < 36 ? 700 : frame < 72 ? interpolate(frame, [36, 72], [700, 640]) : 640;
  const bambangPose: Pose = frame < 36
    ? { ...STAND, armF: [1.0, 0.2], armB: [0.3, 0.1], lean: 0.08, headTilt: 0.05 }
    : frame < 72
      ? { ...STAND, armF: [0.2, 0.1], armB: [-0.2, 0.1], lean: -0.05, headTilt: 0.1 }
      : { ...STAND, armF: [0.08, 0.05], armB: [-0.08, 0.05], lean: 0.02, headTilt: 0.24 };
  const rizkyMood = frame < 72 ? "worried" : "shocked";
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%" shake={2}>
      <Canvas bg="#e8e0c8">
        <FactoryBg shakeX={shakeX} />
        {/* tumpahan jatuh (partikel, beat 2) */}
        {frame >= 36 ? (
          <g>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const p = interpolate(frame, [36 + i * 2, 56 + i * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <circle key={i} cx={640 + i * 30} cy={1120 + p * 260} r={9} fill="#c9a24a" stroke={C.ink} strokeWidth={3} opacity={0.4 + 0.6 * p} />;
            })}
          </g>
        ) : null}
        <Stick x={280} floor={FLOOR} scale={0.95} look={RIZKY} pose={{ ...STAND, headTilt: frame >= 72 ? 0.08 : 0 }} mood={rizkyMood} lookAt={1} />
        <Stick x={bambangX} floor={FLOOR} scale={0.95} look={BAMBANG} pose={bambangPose} mood="worried" lookAt={-0.8} />
      </Canvas>
      <KineticText words={["BUKAN", "DIA", "YANG", "BUAT"]} at={36} stagger={3} top={420} fontSize={96} accent={["BUKAN"]} />
    </Camera>
  );
};

/** Shot 4 (0–117): mandor masuk kanan menunjuk Rizky; Rizky menunduk meremas slip gaji. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–36f): mandor jalan masuk dari kanan, menunjuk.
  // Beat 2 (36–78f): mandor menunjuk tegas, big text, Rizky menunduk (humiliated).
  // Beat 3 (78–117f): Rizky angkat kepala sedikit (sad), lalu menunduk lagi.
  const darmaX = interpolate(frame, [0, 36], [1080, 780], { extrapolateRight: "clamp" });
  const darmaPose: Pose = frame < 36
    ? walk((1080 - darmaX) / walkCycle(0.9, 1.0), 0.9)
    : { ...STAND, armF: [-1.5, -0.15], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 };
  const mood = frame < 78 ? "humiliated" : "sad";
  const headTilt = frame < 78 ? 0.26 : 0.12;
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%" shake={1.5}>
      <Canvas bg="#e8e0c8">
        <FactoryBg />
        <Stick
          x={300}
          floor={FLOOR}
          scale={1.0}
          look={RIZKY}
          pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt }}
          mood={mood}
          lookAt={0.8}
          holdF={<g transform="scale(0.55)"><Payslip /></g>}
        />
        <Stick x={darmaX} floor={FLOOR} scale={1.0} look={DARMA} pose={darmaPose} mood="determined" lookAt={-0.7} />
      </Canvas>
      <KineticText words={["SATU", "TIM,", "SATU", "TANGGUNG", "JAWAB"]} at={36} stagger={3} top={420} fontSize={88} accent={["TANGGUNG", "JAWAB"]} />
    </Camera>
  );
};

/** Shot 5 (0–66): rumah malam. Rizky duduk di meja makan, istri di samping, buka UU di HP. */
const Shot05: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–22f): Rizky duduk menatap slip gaji, istri berdiri (worried).
  // Beat 2 (22–43f): istri menyentuh bahu Rizky, big text "UANG KONTRAKAN".
  // Beat 3 (43–66f): Rizky angkat HP, buka undang-undang, big text "PASAL 135 AYAT 7".
  const wifePose: Pose = frame < 22
    ? { ...STAND, headTilt: 0.12, lean: 0.04 }
    : { ...STAND, armF: [-0.9, -0.2], armB: [-0.1, 0.1], headTilt: 0.12, lean: 0.04 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <DiningTable />
        <g transform="translate(650,1120) scale(0.55)">
          <Payslip />
        </g>
        <Stick x={320} floor={FLOOR} scale={0.95} look={RIZKY} pose={SIT} mood="sad" lookAt={0.9} holdF={frame >= 43 ? <Phone /> : undefined} />
        <Stick x={850} floor={FLOOR} scale={0.95} look={ISTRI} pose={wifePose} mood="worried" lookAt={-0.8} />
      </Canvas>
      <KineticText words={["UANG", "KONTRAKAN"]} at={22} stagger={3} top={420} fontSize={88} accent={["KONTRAKAN"]} />
      <KineticText words={["PASAL", "135", "AYAT", "7"]} at={43} stagger={3} top={580} fontSize={96} accent={["135"]} />
    </Camera>
  );
};

/** Shot 6 (0–66): rumah malam. Rizky mengangkat salinan pasal; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–18f): hening 0,3 dtk — Rizky jalan masuk ke meja, lampu menyala.
  // Beat 2 (18–42f): angkat salinan pasal + big text stagger.
  // Beat 3 (42–66f): menatap big text (determined), push-in ke wajah.
  const walking = frame < 18;
  const x = walking ? interpolate(frame, [0, 18], [80, 420], { extrapolateRight: "clamp" }) : 420;
  const pose: Pose = walking
    ? walk((x - 80) / walkCycle(0.9, 0.95), 0.9)
    : { ...STAND, armF: [1.0, 0.25], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.08 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <DiningTable />
        <g transform="translate(560,1090)">
          {frame < 18 ? <PasalFolder big /> : null}
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#1c130d" />
        <rect x={0} y={1400} width={1080} height={18} fill="#120b06" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={RIZKY}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 18 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["KESALAHAN", "ATAU"]} at={18} stagger={2} top={400} fontSize={76} />
      <KineticText words={["KELALAIANNYA", "SENDIRI"]} at={22} stagger={2} top={510} fontSize={76} accent={["SENDIRI"]} />
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
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 29, lineHeight: 1.3, color: C.ink }}>
        {children}
        {big}
      </div>
    </div>
  );
};

/** Shot 7 (0–43): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 2 ? 0 : spring({ frame: frame - 2, fps, config: { stiffness: 240, damping: 14 } });
  // Rizky menunjuk item 1 (0–11f), lalu 2 (11–22f), 3 (22–33f), 4 tercentang (33f+).
  const pointY = frame < 11 ? 0 : frame < 22 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Rizky kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={RIZKY}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 38, letterSpacing: 2, color: C.alertRed }}>PASAL 135 AYAT 7</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · PP 36/2021</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          Denda hanya untuk pelanggaran karena kesengajaan atau kelalaian pekerja itu sendiri
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 135 ayat 7)</div>
          <span style={{ fontFamily: FONT.title, fontSize: 64, color: "#c0241c", lineHeight: 1 }}>135</span>
        </LawItem>
        <LawItem at={11}>
          Potongan upah hanya untuk 6 hal: denda, ganti rugi, uang muka upah, sewa, utang/cicilan, kelebihan bayar
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(PP 36/2021 Pasal 63 ayat 1)</div>
        </LawItem>
        <LawItem at={22}>
          Potongan denda/ganti rugi harus sesuai perjanjian kerja, peraturan perusahaan, atau PKB
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 63 ayat 2)</div>
        </LawItem>
        <LawItem at={33}>
          Total semua potongan paling banyak 50% dari setiap pembayaran upah
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 65)</div>
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>Di cerita ini 12,5% pun salah bila tak berdasar.</div>
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–17): Rizky jalan kembali ke HRD membawa salinan pasal (indignant). */
const Shot08a: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 17], [120, 700], { extrapolateRight: "clamp" });
  return (
    <Camera dur={17} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <CitySkylineBg variant="day" />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={RIZKY}
          pose={{ ...walk((x - 120) / walkCycle(0.9, 0.95), 0.9), headTilt: -0.06 }}
          mood="indignant"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–33): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
const Shot08b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 1 ? 0 : spring({ frame: frame - 1, fps, config: { stiffness: 260, damping: 13 } });
  const line = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 13 } });
  const q = frame < 16 ? 0 : spring({ frame: frame - 16, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", transform: `scale(${title})`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 118, color: "white", textShadow: "0 6px 16px rgba(0,0,0,0.8)" }}>CERITA PEKERJA</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#c9c4b4", marginTop: 16 }}>SETIAP PEKERJA PUNYA CERITA</div>
      </div>
      <div style={{ position: "absolute", top: 820, width: "100%", textAlign: "center", transform: `scale(${line})`, opacity: line }}>
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Salah teman bukan salahmu.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah gajimu dipotong padahal bukan salahmu? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–50): kembali ke HRD -> end card. */
const Shot08: React.FC<{ dur: number }> = () => (
  <>
    <Sequence durationInFrames={17}>
      <Shot08a />
    </Sequence>
    <Sequence from={17}>
      <Shot08b />
    </Sequence>
  </>
);

export const EP15: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 87, words: timedCaptions([["Gajian", 0, 440], ["tiba,", 440, 900], ["Rizky", 1360, 1720], ["membuka", 1720, 2080], ["slip", 2080, 2360], ["gajinya,", 2360, 2860], ["dan", 3240, 3540], ["matanya", 3540, 4080], ["membelalak.", 4080, 4640], ["Gajinya", 4900, 5280], ["dipotong", 5280, 5820], ["600", 5820, 6180], ["ribu", 6180, 6820], ["rupiah.", 6820, 7220]], 0), yellow: ["GAJIAN", "SLIP", "DIPOTONG", "600"] },
    { start: 82, end: 206, words: timedCaptions([["Rizky,", 7580, 8020], ["Operator", 8360, 8780], ["Pabrik", 8780, 9140], ["di", 9140, 9340], ["Sidoarjo.", 9340, 9960], ["Dua", 10380, 10540], ["tahun", 10540, 10800], ["bekerja", 10800, 11200], ["di", 11200, 11300], ["sini.", 11300, 11540], ["Gajinya", 11980, 12360], ["4", 12360, 12760], ["juta", 12760, 13140], ["800", 13140, 13520], ["ribu", 13520, 14060], ["sebulan,", 14060, 14580], ["pas", 14840, 15020], ["pasan", 15020, 15420], ["untuk", 15420, 15580], ["kontrakan", 15580, 16140], ["dan", 16140, 16300], ["sekolah", 16300, 16620], ["anaknya.", 16620, 17160]], 6800), yellow: ["OPERATOR", "SIDOARJO", "DUA", "TAHUN", "KONTRAKAN"] },
    { start: 206, end: 321, words: timedCaptions([["Yang", 17440, 17580], ["bikin", 17580, 17920], ["dia", 17920, 18060], ["diam,", 18060, 18480], ["kesalahan", 18880, 19280], ["itu", 19280, 19480], ["bukan", 19480, 19680], ["dia", 19680, 19980], ["yang", 19980, 20180], ["buat.", 20180, 20420], ["Bambang,", 20780, 21200], ["rekan", 21520, 21800], ["satu", 21800, 22040], ["shiftnya,", 22040, 22520], ["salah", 22900, 23160], ["setting", 23160, 23440], ["mesin", 23440, 23880], ["sampai", 23880, 24260], ["bahan", 24260, 24640], ["baku", 24640, 24960], ["senilai", 24960, 25380], ["jutaan", 25380, 25860], ["rupiah", 25860, 26240], ["rusak.", 26240, 26720]], 17200), yellow: ["BUKAN", "BAMBANG", "SALAH", "MESIN", "JUTAAN"] },
    { start: 320, end: 441, words: timedCaptions([["Tapi", 26720, 27180], ["mandor", 27180, 27560], ["berkata,", 27560, 28020], ["satu", 28420, 28700], ["tim,", 28700, 29000], ["satu", 29280, 29560], ["tanggung", 29560, 29900], ["jawab.", 29900, 30280], ["Semua", 30600, 30860], ["anggota", 30860, 31140], ["shift", 31140, 31440], ["dipotong", 31440, 31880], ["gajinya,", 31880, 32360], ["termasuk", 32680, 33060], ["Rizky,", 33060, 33400], ["yang", 33760, 33920], ["hari", 33920, 34100], ["itu", 34100, 34320], ["memegang", 34320, 34660], ["lini", 34660, 34840], ["lain", 34840, 35140], ["dan", 35140, 35480], ["tidak", 35480, 35760], ["menyentuh", 35760, 36160], ["mesin", 36160, 36420], ["itu.", 36420, 36680]], 26700), yellow: ["MANDOR", "SATU", "TIM", "DIPOTONG", "TIDAK"] },
    { start: 437, end: 506, words: timedCaptions([["Undang-Undang", 37000, 37560], ["nomor", 37560, 37860], ["27", 37860, 38360], ["tahun", 38360, 38840], ["2026,", 38840, 39840], ["pasal", 40260, 40580], ["135", 40580, 41180], ["ayat", 41180, 41920], ["7.", 41920, 42160]], 36400), yellow: ["UNDANG-UNDANG", "PASAL", "135"] },
    { start: 503, end: 570, words: timedCaptions([["Denda", 42580, 42940], ["hanya", 42940, 43200], ["bisa", 43200, 43460], ["dikenakan", 43460, 43880], ["pada", 43880, 44160], ["pekerja", 44160, 44600], ["yang", 44600, 44780], ["melanggar", 44780, 45240], ["karena", 45240, 45520], ["kesengajaan", 45520, 46300], ["atau", 46300, 46540], ["kelalayannya", 46540, 47080], ["sendiri.", 47080, 47440]], 41900), yellow: ["DENDA", "KESENGAJAAN", "KELALAIANNYA", "SENDIRI"] },
    { start: 569, end: 612, words: timedCaptions([["Rizky", 47840, 48180], ["kembali", 48180, 48520], ["ke", 48520, 48640], ["HRD", 48640, 49100], ["dengan", 49100, 49300], ["salinan", 49300, 49760], ["pasal", 49760, 50140], ["di", 50140, 50260], ["tangannya.", 50260, 50680]], 47400), yellow: ["HRD", "SALINAN", "PASAL"] },
    { start: 612, end: 662, words: timedCaptions([["Salah", 51040, 51320], ["teman,", 51320, 51640], ["bukan", 51880, 52100], ["salahmu,", 52100, 52680], ["karena", 52980, 53240], ["setiap", 53240, 53620], ["pekerja", 53620, 54040], ["punya", 54040, 54460], ["cerita.", 54460, 54880]], 51000), yellow: ["SALAH", "TEMAN", "BUKAN", "SALAHMU", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep15.mp3")} />
      <Sequence durationInFrames={82}>
        <Shot01 dur={82} />
      </Sequence>
      <Sequence from={82} durationInFrames={124}>
        <Shot02 dur={124} />
      </Sequence>
      <Sequence from={206} durationInFrames={114}>
        <Shot03 dur={114} />
      </Sequence>
      <Sequence from={320} durationInFrames={117}>
        <Shot04 dur={117} />
      </Sequence>
      <Sequence from={437} durationInFrames={66}>
        <Shot05 dur={66} />
      </Sequence>
      <Sequence from={503} durationInFrames={66}>
        <Shot06 dur={66} />
      </Sequence>
      <Sequence from={569} durationInFrames={43}>
        <Shot07 />
      </Sequence>
      <Sequence from={612}>
        <Shot08 dur={50} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
