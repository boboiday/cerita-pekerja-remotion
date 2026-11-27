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
 * EP22 — "Tidak Didaftarkan BPJS" (24 fps, 1080x1920, 72,23 detik).
 * Format >60 detik (naskah 149 kata, pita 140–150; pace 0,485 dtk/kata).
 * Rizal, 30 th, staf gudang toko grosir di Yogyakarta, 3 tahun: tidak
 * pernah sekalipun didaftarkan ke BPJS Kesehatan maupun Ketenagakerjaan.
 * Demam — klinik minta kartu BPJS, tidak ada — bayar sendiri Rp875.000.
 * Saksi: Laras, kasir toko yang sama — demam bulan lalu, berobat
 * Rp650.000 bayar sendiri juga.
 * Hukum: UU 27/2026 Pasal 155 ayat (2) — pemberi kerja wajib
 * mengikutsertakan pekerja dalam program jaminan sosial + Pasal 155
 * ayat (1) dan (3) (hak jaminan sosial; 6 program) + Pasal 92 ayat (2)
 * huruf b (jaminan sosial wajib sejak masa percobaan) + Pasal 290
 * ayat (1) dan (3) + Pasal 156 ayat (1) (sanksi).
 * VO: Sulafat 72,23 dtk (public/voice_over_ep22.mp3; raw 84,21 dtk, trim
 * jeda max 0,4 dtk -> 76,55 dtk, atempo 1.06), word timings dari
 * alignment.json faster-whisper small (142 token; koreksi: angka dieja,
 * 875.000/3.800.000/650.000, Yogyakarta dibaca "Jogjakarta" oleh TTS —
 * caption mengikuti ucapan, Toko Grossir->toko grosir, laras->Laras,
 * Berobat->berobat, nomor->Nomor, tahun->Tahun, pasal->Pasal,
 * BPJSnya.->BPJS-nya., karena->Karena, merges Undang-Undang,
 * Ketenagakerjaan., Pemberi Kerja, mengikutsertakan, Pekerja/Buruh,
 * perundang-undangan.).
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap, beat saksi Laras (S05).
 * Render: GitHub Actions. Set: rumah pagi (HomeInteriorBg) + jalan
 * Yogyakarta (parallax) + gudang toko grosir (rak + karung + troli,
 * digambar inline) + klinik (meja resepsionis) + meja kasir + rumah
 * malam (HomeInteriorBg night).
 * Mood "calm" BUKAN mood valid di kit — S03 memakai hopeful -> worried.
 */

export const EP22_TOTAL = 1733; // 72,23 s @ 24 fps

/** Rizal: kemeja kerja zaitun, celana hitam, sarung tangan gudang + name tag "RIZAL". */
const RIZAL: Look = { body: "#6b7a5a", pants: "#1d1d1f", nameTag: "RIZAL" };
/** Laras: blus hijau, celana hitam, rambut pendek + name tag "LARAS". */
const LARAS: Look = { body: "#4a7a5a", pants: "#1d1d1f", shortHair: "#3a2a1a", nameTag: "LARAS" };
/** Pak Harto, pemilik toko: kemeja batik cokelat + name tag "PAK HARTO". */
const HARTO: Look = { body: "#8a5a34", pants: "#1d1d1f", shortHair: "#1a1a1a", nameTag: "PAK HARTO" };
/** Resepsionis klinik: jas putih, rambut diikat (bun). */
const RESEPSIONIS: Look = { body: "#e8e8e8", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };

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

/** Kuitansi klinik Rizal: konsultasi + obat + tes darah, Rp875.000, BPJS tidak menanggung. */
const ClinicReceipt: React.FC<{ mini?: boolean }> = ({ mini = false }) => {
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
      <text x={0} y={-198} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#fdf8ea" textAnchor="middle">KUITANSI KLINIK</text>
      <text x={0} y={-130} fontFamily={FONT.mono} fontWeight={800} fontSize={22} fill={C.ink} textAnchor="middle">RIZAL — DEMAM</text>
      <text x={0} y={-90} fontFamily={FONT.mono} fontWeight={700} fontSize={20} fill="#6b675f" textAnchor="middle">KONSULTASI + OBAT</text>
      <line x1={-150} y1={-60} x2={150} y2={-60} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      <text x={0} y={-10} fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill={C.ink} textAnchor="middle">TOTAL BAYAR</text>
      <text x={0} y={28} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill={C.ink} textAnchor="middle">Rp875.000</text>
      <text x={0} y={88} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill="#c0241c" textAnchor="middle">BPJS</text>
      <text x={0} y={140} fontFamily={FONT.mono} fontWeight={800} fontSize={46} fill="#c0241c" textAnchor="middle">TIDAK</text>
      <text x={0} y={196} fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill="#c0241c" textAnchor="middle">DITANGGUNG</text>
    </g>
  );
};

/** Map cokelat berlabel PASAL 155 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 28 : 22} fill="#fdf8ea" textAnchor="middle">155</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Kartu nama di meja: "RIZAL — STAF GUDANG". */
const NameCard: React.FC<{ name?: string; role?: string }> = ({ name = "RIZAL", role = "STAF GUDANG" }) => (
  <g>
    <rect x={-55} y={-22} width={110} height={44} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-4} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill={C.ink} textAnchor="middle">{name}</text>
    <text x={0} y={14} fontFamily={FONT.mono} fontWeight={700} fontSize={11} fill="#6b675f" textAnchor="middle">{role}</text>
  </g>
);

/** Rak gudang (berdiri di lantai): 3 tingkat + karung. Titik (0,0) = tengah bawah rak. */
const Rack: React.FC = () => (
  <g>
    <rect x={-150} y={-360} width={300} height={360} fill="#4a3428" stroke={C.ink} strokeWidth={5} />
    <rect x={-150} y={-240} width={300} height={16} fill="#6b4a38" stroke={C.ink} strokeWidth={4} />
    <rect x={-150} y={-120} width={300} height={16} fill="#6b4a38" stroke={C.ink} strokeWidth={4} />
    <rect x={-120} y={-330} width={90} height={80} rx={12} fill="#c9a86a" stroke={C.ink} strokeWidth={4} />
    <rect x={-20} y={-330} width={90} height={80} rx={12} fill="#b3945e" stroke={C.ink} strokeWidth={4} />
    <rect x={-120} y={-210} width={90} height={80} rx={12} fill="#8a6d3b" stroke={C.ink} strokeWidth={4} />
    <rect x={-20} y={-210} width={90} height={80} rx={12} fill="#c9a86a" stroke={C.ink} strokeWidth={4} />
    <rect x={-120} y={-90} width={90} height={80} rx={12} fill="#b3945e" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Karung di lantai gudang. Titik (0,0) = tengah bawah karung. */
const Sack: React.FC = () => (
  <g>
    <path d="M-70,0 L-62,-90 Q0,-110 62,-90 L70,0 Z" fill="#c9a86a" stroke={C.ink} strokeWidth={5} />
    <path d="M-62,-90 Q0,-110 62,-90" fill="none" stroke={C.ink} strokeWidth={4} />
    <line x1={-50} y1={-40} x2={50} y2={-40} stroke="#8a6d3b" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Troli gudang. Titik (0,0) = tengah bawah roda. */
const Trolley: React.FC = () => (
  <g>
    <rect x={-90} y={-110} width={180} height={90} rx={8} fill="#7a7568" stroke={C.ink} strokeWidth={5} />
    <line x1={-90} y1={-20} x2={90} y2={-20} stroke={C.ink} strokeWidth={4} />
    <line x1={90} y1={-110} x2={130} y2={-170} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <circle cx={-60} cy={0} r={16} fill={C.ink} />
    <circle cx={60} cy={0} r={16} fill={C.ink} />
  </g>
);

/** Shot 1 (0–239): rumah Rizal pagi. Rizal menatap kuitansi klinik; big text. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Beat 1 (0–40f): Rizal di meja, kuitansi di tangan. Beat 2 (40–100f): angka Rp875.000 muncul. Beat 3 (100–239f): big text.
  const showReceipt = frame >= 40;
  const bubble = frame < 60 ? 0 : spring({ frame: frame - 60, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <HomeInteriorBg />
        {/* kuitansi besar di meja */}
        <g transform="translate(540,1010)">
          <ClinicReceipt />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={320} floor={FLOOR} scale={0.95} look={RIZAL} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.06 }} mood={frame < 100 ? "worried" : "shocked"} lookAt={0.5} holdF={showReceipt ? <ClinicReceipt mini /> : undefined} />
      </Canvas>
      {/* bubble angka Rp875.000 (HTML, terbaca) */}
      <div style={{ position: "absolute", top: 290, left: "50%", transform: `translateX(-50%) scale(${bubble})`, opacity: bubble, width: 860, background: "white", borderRadius: 24, padding: "22px 30px", boxShadow: "0 8px 0 rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 34, color: "#c0241c", lineHeight: 1.25 }}>
          Bayar sendiri: Rp875.000
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: "#6b675f", marginTop: 8 }}>Kuitansi klinik • BPJS tidak menanggung</div>
      </div>
      <KineticText words={["3", "TAHUN", "TANPA", "BPJS"]} at={100} stagger={3} top={520} fontSize={80} accent={["BPJS"]} />
    </Camera>
  );
};

/** Shot 2 (239–518): tracking shot jalan pagi Yogyakarta. Rizal menyeberang penuh kiri -> kanan, parallax 2 lapis, gerbang toko grosir di kanan. */
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
        {/* gerbang toko grosir */}
        <g>
          <rect x={760} y={1080} width={260} height={320} fill="#23282e" stroke={C.ink} strokeWidth={5} />
          <text x={890} y={1170} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#fdf8ea" textAnchor="middle">TOKO GROSIR</text>
          <text x={890} y={1215} fontFamily={FONT.mono} fontWeight={800} fontSize={28} fill="#fdf8ea" textAnchor="middle">YOGYAKARTA</text>
        </g>
        <Stick x={x} floor={FLOOR} scale={0.95} look={RIZAL} pose={pose} mood="hopeful" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["STAF", "GUDANG,", "3", "TAHUN"]} at={60} stagger={3} top={420} fontSize={64} accent={["TAHUN"]} />
    </Camera>
  );
};

/** Shot 3 (518–744): gudang toko grosir. Rizal mengangkat karung, bertanya ke Pak Harto soal BPJS, dijawab lambaian tangan. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat tenang (0–113f): hopeful — "calm" bukan Mood valid di kit.
  const m = frame < 113 ? "hopeful" : "worried";
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%">
      <Canvas bg="#e8ddc8">
        {/* dinding gudang + rak + karung + troli */}
        <rect x={0} y={0} width={1080} height={1400} fill="#e8ddc8" />
        <g transform="translate(180,1400)">
          <Rack />
        </g>
        <g transform="translate(880,1400)">
          <Rack />
        </g>
        <g transform="translate(480,1400)">
          <Sack />
        </g>
        <g transform="translate(700,1400)">
          <Trolley />
        </g>
        <g transform="translate(480,1130)">
          <NameCard />
        </g>
        <rect x={0} y={1400} width={1080} height={520} fill="#8a7a5e" />
        <rect x={0} y={1400} width={1080} height={14} fill="#6b5c46" />
        <Stick
          x={340}
          floor={FLOOR}
          scale={0.95}
          look={RIZAL}
          pose={{ ...STAND, armF: [0.9, 0.4], armB: [0.3, 0.5], lean: 0.08, headTilt: frame >= 113 ? 0.12 : 0 }}
          mood={m}
          lookAt={0.8}
          holdF={frame >= 60 ? <Sack /> : undefined}
        />
        <Stick x={820} floor={FLOOR} scale={0.95} look={HARTO} pose={{ ...STAND, armF: [1.2, 0.2], armB: [0.2, 0.1], lean: -0.03, headTilt: -0.08 }} mood="worried" lookAt={-0.8} />
      </Canvas>
      <KineticText words={["TAK", "PERNAH", "DIDAFTARKAN"]} at={113} stagger={3} top={420} fontSize={64} accent={["DIDAFTARKAN"]} />
    </Camera>
  );
};

/** Shot 4 (744–930): close-up meja resepsionis klinik. Rizal merogoh dompet — tidak ada kartu BPJS. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 2 (100f+): Rizal membuka dompet — kosong; ekspresi worried -> sad.
  const m = frame < 100 ? "worried" : "sad";
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%">
      <Canvas bg="#f7f1e3">
        {/* meja resepsionis klinik */}
        <rect x={120} y={1150} width={840} height={26} fill="#5a7a8a" stroke={C.ink} strokeWidth={5} />
        <rect x={140} y={1176} width={800} height={224} fill="#3a5a6a" />
        <text x={540} y={1240} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill="#fdf8ea" textAnchor="middle">RESEPSIONIS</text>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={RIZAL} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt: 0.1 }} mood={m} lookAt={1} holdF={frame >= 100 ? <ClinicReceipt mini /> : undefined} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={RESEPSIONIS} pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: 0.02, headTilt: 0.1 }} mood="worried" lookAt={-0.6} holdF={<ClinicReceipt mini />} />
      </Canvas>
      <KineticText words={["BAYAR", "SENDIRI"]} at={40} stagger={3} top={420} fontSize={88} accent={["SENDIRI"]} />
    </Camera>
  );
};

/** Shot 5 (930–1142): Laras di meja kasir membuka dompetnya juga — "Laras juga sama". */
const Shot05: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 106 ? "resigned" : "determined";
  return (
    <Camera dur={dur} move="push-in" amount={0.04} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <OfficeBg />
        {/* meja kasir */}
        <rect x={120} y={1150} width={840} height={26} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
        <rect x={140} y={1176} width={800} height={224} fill="#4a3428" />
        <text x={540} y={1240} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill="#fdf8ea" textAnchor="middle">KASIR</text>
        <rect x={0} y={1400} width={1080} height={520} fill="#7a7568" />
        <rect x={0} y={1400} width={1080} height={14} fill="#5c564a" />
        <Stick x={300} floor={FLOOR} scale={1.15} look={RIZAL} pose={{ ...STAND, armF: [0.5, 0.5], armB: [0.2, 0.1], lean: 0.02, headTilt: 0.12 }} mood="worried" lookAt={1} />
        <Stick x={780} floor={FLOOR} scale={1.15} look={LARAS} pose={{ ...STAND, armF: [0.9, 0.3], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.06 }} mood={mood} lookAt={-0.6} holdF={frame >= 40 ? <ClinicReceipt mini /> : undefined} />
      </Canvas>
      <KineticText words={["LARAS", "JUGA", "SAMA"]} at={30} stagger={3} top={420} fontSize={88} accent={["SAMA"]} />
    </Camera>
  );
};

/** Shot 6 (1142–1288): rumah malam. Rizal mengangkat salinan pasal; big text kinetik. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–50f): jalan masuk ke meja. Beat 2 (50–146f): angkat pasal + big text.
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
          look={RIZAL}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 50 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["PASAL", "155", "AYAT", "2"]} at={50} stagger={3} top={420} fontSize={88} accent={["155"]} />
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

/** Shot 7 (1288–1503): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Rizal menunjuk item 1-2 (0–60f), lalu 3-4 (60–120f), item 5 tercentang (120f+).
  const pointY = frame < 60 ? 0 : frame < 120 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Rizal kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={RIZAL}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: C.alertRed }}>PASAL 155 AYAT 2</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · JAMINAN SOSIAL</div>
        <div style={{ height: 4, background: C.ink, marginTop: 12, opacity: 0.85 }} />
        <LawItem at={0}>
          Setiap pekerja + keluarga berhak atas jaminan sosial
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 155 ayat 1)</div>
        </LawItem>
        <LawItem at={30}>
          Pemberi kerja WAJIB mengikutsertakan pekerja — 6 program: JKN, JKK, JKM, JHT, JP, JKP
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 155 ayat 2–3)</div>
        </LawItem>
        <LawItem at={60}>
          Jaminan sosial wajib sejak masa percobaan — &quot;nanti kalau sudah tetap&quot; bukan alasan
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 92 ayat 2 huruf b)</div>
        </LawItem>
        <LawItem at={90}>
          Rizal: 3 tahun tidak didaftarkan → Rp875.000 bayar sendiri; Laras Rp650.000. Kalau terdaftar, JKN yang menanggung
        </LawItem>
        <LawItem at={120}>
          Sanksi: penjara paling lama 4 tahun dan/atau denda kategori IV; usaha mikro/kecil: peringatan tertulis/denda administratif
          <div style={{ fontSize: 22, color: "#6b675f", marginTop: 4 }}>(Pasal 290 ayat 1+3; Pasal 156 ayat 1)</div>
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–110): Rizal jalan kembali ke toko grosir membawa salinan pasal. */
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
          look={RIZAL}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<g transform="translate(40,10)"><PasalFolder /></g>}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–120): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
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
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Tidak didaftarkan bukan nasib.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Kamu sudah terdaftar BPJS? Cek kartumu, ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (1503–1733): kembali ke toko -> end card. */
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

export const EP22: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 239, words: timedCaptions([["Rizal", 0, 780], ["menatap", 780, 1400], ["kuitansi", 1400, 1960], ["kliniknya,", 1960, 2560], ["delapan", 2900, 3257], ["ratus", 3257, 3613], ["tujuh", 3613, 3970], ["puluh", 3970, 4327], ["lima", 4327, 4683], ["ribu", 4683, 5040], ["rupiah", 5040, 5500], ["dan", 5500, 6060], ["tidak", 6060, 6340], ["ada", 6340, 6740], ["satu", 6740, 7180], ["rupiah", 7180, 7620], ["pun", 7620, 7800], ["yang", 7800, 8200], ["ditanggung", 8200, 8800], ["BPJS.", 8800, 9600]], 0), yellow: ["BPJS", "RUPIAH"] },
    { start: 239, end: 518, words: timedCaptions([["Rizal,", 9960, 10560], ["tiga", 10920, 11070], ["puluh", 11070, 11220], ["tahun,", 11220, 11680], ["staf", 12220, 12540], ["gudang", 12540, 12980], ["di", 12980, 13180], ["toko", 13180, 13460], ["grosir", 13460, 13940], ["di", 13940, 14160], ["Jogjakarta,", 14160, 14900], ["gajinya", 15340, 15820], ["tiga", 15820, 16224], ["juta", 16224, 16628], ["delapan", 16628, 17032], ["ratus", 17032, 17436], ["ribu", 17436, 17840], ["rupiah", 17840, 18220], ["sebulan,", 18220, 18800], ["dan", 19280, 19340], ["ia", 19340, 19600], ["sudah", 19600, 19920], ["bekerja", 19920, 20440], ["tiga", 20440, 20820], ["tahun", 20820, 21140], ["di", 21140, 21380], ["sana.", 21380, 21600]], 9960), yellow: ["JOGJAKARTA", "TAHUN"] },
    { start: 518, end: 744, words: timedCaptions([["Tiga", 21600, 22280], ["tahun", 22280, 22640], ["ia", 22640, 22980], ["mengangkat", 22980, 23460], ["karung,", 23460, 23900], ["menyusun", 24260, 24660], ["rak,", 24660, 24880], ["dan", 25360, 25400], ["tidak", 25400, 25740], ["pernah", 25740, 26060], ["sekalipun", 26060, 26660], ["didaftarkan", 26660, 27360], ["ke", 27360, 27660], ["BPJS", 27660, 28280], ["Kesehatan", 28280, 29000], ["maupun", 29000, 29460], ["Ketenagakerjaan.", 29460, 30660]], 21600), yellow: ["BPJS", "KESEHATAN"] },
    { start: 744, end: 930, words: timedCaptions([["Saat", 31000, 31440], ["demamnya", 31440, 31860], ["naik,", 31860, 32200], ["klinik", 32600, 33000], ["bertanya", 33000, 33420], ["kartu", 33420, 33860], ["BPJS-nya.", 33860, 34640], ["Tidak", 35020, 35320], ["ada.", 35320, 35500], ["ia", 35940, 36220], ["membayar", 36220, 36660], ["sendiri,", 36660, 36960], ["dari", 37560, 37800], ["gajinya.", 37800, 38320]], 31000), yellow: ["BAYAR", "SENDIRI"] },
    { start: 930, end: 1142, words: timedCaptions([["Di", 38740, 38920], ["gudang", 38920, 39220], ["sebelah,", 39220, 39720], ["Laras", 40080, 40440], ["membuka", 40440, 40840], ["dompetnya", 40840, 41320], ["juga.", 41320, 41580], ["Ia", 42040, 42300], ["demam", 42300, 42580], ["bulan", 42580, 42900], ["lalu,", 42900, 43240], ["berobat", 43680, 44100], ["enam", 44100, 44392], ["ratus", 44392, 44684], ["lima", 44684, 44976], ["puluh", 44976, 45268], ["ribu", 45268, 45560], ["rupiah", 45560, 45980], ["dan", 45980, 46540], ["bayar", 46540, 46940], ["sendiri", 46940, 47240], ["juga.", 47240, 47600]], 38740), yellow: ["LARAS", "SAMA"] },
    { start: 1142, end: 1288, words: timedCaptions([["Undang-Undang", 47600, 48700], ["Nomor", 48700, 48980], ["dua", 48980, 49140], ["puluh", 49140, 49300], ["tujuh", 49300, 49460], ["Tahun", 49460, 49900], ["dua", 49900, 50128], ["ribu", 50128, 50356], ["dua", 50356, 50584], ["puluh", 50584, 50812], ["enam,", 50812, 51040], ["Pasal", 51340, 51640], ["seratus", 51640, 51910], ["lima", 51910, 52180], ["puluh", 52180, 52450], ["lima", 52450, 52720], ["ayat", 52720, 53080], ["dua.", 53080, 53260]], 47600), yellow: ["UNDANG-UNDANG", "PASAL"] },
    { start: 1288, end: 1503, words: timedCaptions([["Pemberi", 53680, 54050], ["Kerja", 54050, 54420], ["wajib", 54420, 54800], ["mengikutsertakan", 54800, 55580], ["Pekerja/Buruh", 55580, 56800], ["yang", 56980, 57120], ["dipekerjakan", 57120, 57800], ["dalam", 57800, 58060], ["program", 58060, 58420], ["jaminan", 58420, 58900], ["sosial,", 58900, 59420], ["sesuai", 59780, 60180], ["dengan", 60180, 60360], ["ketentuan", 60360, 60860], ["peraturan", 60860, 61380], ["perundang-undangan.", 61380, 62260]], 53680), yellow: ["WAJIB", "JAMINAN", "SOSIAL"] },
    { start: 1503, end: 1733, words: timedCaptions([["Rizal", 62640, 63080], ["kembali", 63080, 63480], ["keesokan", 63480, 63980], ["harinya", 63980, 64380], ["dengan", 64380, 64640], ["salinan", 64640, 65080], ["pasal", 65080, 65560], ["dan", 65560, 65720], ["kuitansi", 65720, 66280], ["kliniknya.", 66280, 66780], ["Tidak", 67160, 67440], ["didaftarkan", 67440, 67940], ["bukan", 67940, 68180], ["nasib,", 68180, 68680], ["itu", 69040, 69280], ["pelanggaran.", 69280, 69900], ["Karena", 70240, 70520], ["setiap", 70520, 71000], ["pekerja", 71000, 71440], ["punya", 71440, 71660], ["cerita.", 71660, 72040]], 62640), yellow: ["SALINAN", "PASAL", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep22.mp3")} />
      <Sequence durationInFrames={239}>
        <Shot01 dur={239} />
      </Sequence>
      <Sequence from={239} durationInFrames={279}>
        <Shot02 dur={279} />
      </Sequence>
      <Sequence from={518} durationInFrames={226}>
        <Shot03 dur={226} />
      </Sequence>
      <Sequence from={744} durationInFrames={186}>
        <Shot04 dur={186} />
      </Sequence>
      <Sequence from={930} durationInFrames={212}>
        <Shot05 dur={212} />
      </Sequence>
      <Sequence from={1142} durationInFrames={146}>
        <Shot06 dur={146} />
      </Sequence>
      <Sequence from={1288} durationInFrames={215}>
        <Shot07 />
      </Sequence>
      <Sequence from={1503}>
        <Shot08 dur={230} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
