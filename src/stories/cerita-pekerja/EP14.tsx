import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, type CapLine, Vignette } from "../../kit/Overlays";
import { CARRY, SIT, STAND, Stick, StickDefs, walk, walkCycle, type Look, type Pose } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { KineticText } from "../../kit/KineticText";
import { CitySkylineBg, HomeInteriorBg, MinimarketBg, SkylineFar, SkylineNear } from "../../kit/Backgrounds";
import { PASSENGERS } from "../../kit/Stick";

/**
 * EP14 — "Bos Memaki Karyawan" (24 fps, 1080x1920, 54.9 detik).
 * Eko, kasir minimarket di Sidoarjo 3 tahun: dimaki bos Pak Rudi di depan
 * antrean pelanggan karena selisih kas Rp50.000.
 * Hukum: UU 27/2026 Pasal 231 huruf g angka 1 — frasa "menghina secara
 * kasar" adalah kata persis UU (verbatim, spplaw.id) — + Pasal 241 ayat (1)
 * (pesangon 2x BILA TERBUKTI) + Pasal 46 ayat (8) huruf e/g/h + Pasal 129
 * ayat (1) huruf c. TIDAK ADA pasal "larangan memaki" khusus; tidak ada
 * klaim pesangon 2x otomatis (syarat terbukti dicatat di kartu hukum).
 * VO: Sulafat 54.9 dtk (public/voice_over_ep14.mp3), word timings dari
 * alignment.json faster-whisper (122 kata; "Antreyan"->"Antrean",
 * "dosnya"->"bosnya", "Arama."->"ramah.", "Dia"->"Ia", "tenah"->"tengah",
 * "Undang"+"-undang"->"Undang-Undang", "No."->"Nomor", "50"->"lima puluh").
 * 8 shot, 3 beat per shot, match cuts, 3-second hook gate di S01,
 * tracking shot penuh di S02, arc 5 tahap. Render: GitHub Actions.
 * Perbaikan gambar kecil vs EP13: set minimarket baru (meja kasir + mesin
 * kasir + struk + rak produk + label harga) + name tag "EKO" + mood baru
 * "humiliated" (menunduk menahan malu) — set lebih detail, bukan bentuk
 * geometris simetris polos.
 */

export const EP14_TOTAL = 1318; // 54.9 s @ 24 fps

/** Eko: kemeja putih, dasi hitam, celana hitam + name tag "EKO". */
const EKO: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#1d1d1f", nameTag: "EKO" };
/** Pak Rudi (bos): kemeja biru-abu, dasi merah. */
const RUDI: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };
/** Istri Eko: ungu, rambut bun. */
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

/** Struk belanja panjang dengan angka selisih kas merah (di tangan bos). */
const LongReceipt: React.FC = () => (
  <g>
    <rect x={-55} y={-80} width={110} height={190} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={-40} y1={-60} x2={40} y2={-60} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-40} y1={-44} x2={40} y2={-44} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-40} y1={-28} x2={40} y2={-28} stroke="#b9b6ae" strokeWidth={3} />
    <line x1={-40} y1={-12} x2={40} y2={-12} stroke="#b9b6ae" strokeWidth={3} />
    <text x={0} y={24} fontFamily={FONT.mono} fontWeight={800} fontSize={21} fill={C.ink} textAnchor="middle">SELISIH</text>
    <text x={0} y={52} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill="#c0241c" textAnchor="middle">Rp50.000</text>
    <line x1={-40} y1={70} x2={40} y2={70} stroke="#b9b6ae" strokeWidth={3} />
    <path d="M-55,110 L-40,96 L-25,110 L-10,96 L5,110 L20,96 L35,110 L55,96 L55,110 Z" fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Map cokelat berlabel PASAL 231 (di meja S06, di tangan S08a). */
const PasalFolder: React.FC<{ big?: boolean }> = ({ big = false }) => (
  <g>
    <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={-60} y={-80} width={120} height={34} rx={8} fill="#6b4423" stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-58} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="#fdf8ea" textAnchor="middle">PASAL</text>
    <text x={0} y={10} fontFamily={FONT.mono} fontWeight={800} fontSize={big ? 30 : 24} fill="#fdf8ea" textAnchor="middle">231</text>
    <line x1={-44} y1={40} x2={44} y2={40} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
    <line x1={-44} y1={58} x2={44} y2={58} stroke="#fdf8ea" strokeWidth={4} opacity={0.7} />
  </g>
);

/** Depan meja kasir (digambar SETELAH Stick supaya Eko tampak di balik kasir). */
const CounterFront: React.FC = () => (
  <g>
    <rect x={60} y={1180} width={460} height={220} fill="#5c4033" />
    <rect x={60} y={1180} width={460} height={14} fill="#6b4a38" />
  </g>
);

/** Antrean pelanggan: 2-3 stickman kecil di kanan frame, menatap (worried). */
const Queue: React.FC<{ from?: number; xs?: number[] }> = ({ from = 0, xs = [880, 980] }) => {
  const frame = useCurrentFrame();
  if (frame < from) return null;
  return (
    <g>
      {xs.map((x, i) => (
        <Stick key={x} x={x} floor={FLOOR} scale={0.85} look={PASSENGERS[i % PASSENGERS.length]} pose={STAND} mood="worried" lookAt={-0.8} />
      ))}
    </g>
  );
};

/** Shot 1 (0–228): minimarket pagi. Eko jalan masuk, buka kasir, bos datang marah. */
const Shot01: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  // Beat 1 (0–60f): jalan masuk kiri -> kasir. Beat 2 (60–120f): buka laci, antrean masuk. Beat 3 (120–228f): bos masuk kanan bawa struk, Eko worried.
  const walking = frame < 60;
  const walkDist = walking ? interpolate(frame, [0, 60], [0, 240]) : 240;
  const x = 60 + walkDist;
  const pose = walking
    ? { ...walk(walkDist / walkCycle(0.9, 0.95), 0.9), headTilt: 0 }
    : { ...STAND, headTilt: frame < 120 ? 0.1 : 0.14, lean: 0.02 };
  const bossX = frame < 120 ? 1080 : interpolate(frame, [120, 156], [1080, 780], { extrapolateRight: "clamp" });
  const bossPose: Pose = frame < 156
    ? walk((1080 - bossX) / walkCycle(0.9, 1.0), 0.9)
    : { ...STAND, armF: [1.25, 0.2], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        <MorningSky />
        <MinimarketBg />
        <Stick
          x={x}
          floor={FLOOR}
          scale={0.95}
          look={EKO}
          pose={pose}
          mood="worried"
          lookAt={frame >= 120 ? 1 : 0.5}
        />
        <CounterFront />
        <Queue from={60} />
        {frame >= 120 ? (
          <Stick
            x={bossX}
            floor={FLOOR}
            scale={1.0}
            look={RUDI}
            pose={bossPose}
            mood="determined"
            lookAt={-0.6}
            holdF={frame >= 156 ? <LongReceipt /> : undefined}
          />
        ) : null}
      </Canvas>
      {/* pill hook */}
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", transform: `scale(${pill})`, opacity: pill }}>
        <span style={{ fontFamily: FONT.title, fontSize: 52, color: "white", background: "#130f0b", padding: "14px 30px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.4)" }}>
          PAGI. <span style={{ color: C.capYellow }}>KASIR BARU BUKA.</span>
        </span>
      </div>
      <KineticText words={["SELISIH", "KAS", "Rp50.000"]} at={150} stagger={3} top={460} fontSize={96} accent={["Rp50.000"]} />
    </Camera>
  );
};

/** Shot 2 (0–150): tracking shot trotoar pagi. Eko menyeberang penuh kiri -> kanan, parallax 2 lapis. */
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
        <Stick x={x} floor={FLOOR} scale={0.95} look={EKO} pose={pose} mood="worried" lookAt={lookRight ? 1 : 0.5} />
      </Canvas>
      <KineticText words={["3", "TAHUN", "KASIR", "DI", "SIDOARJO"]} at={60} stagger={3} top={420} fontSize={96} accent={["SIDOARJO"]} />
    </Camera>
  );
};

/** Shot 3 (0–138): kasir. Bos masuk kanan, menunjuk Eko sambil memaki; Eko menunduk. */
const Shot03: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–36f): bos jalan masuk. Beat 2 (36–72f): bos menunjuk, "BODOH!". Beat 3 (72–138f): "TIDAK BECUS! MALAS!", Eko menunduk.
  const bossX = interpolate(frame, [0, 36], [1020, 760], { extrapolateRight: "clamp" });
  const bossPose: Pose = frame < 36
    ? walk((1020 - bossX) / walkCycle(0.9, 1.0), 0.9)
    : { ...STAND, armF: [1.5, 0.15], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 };
  const mood = frame < 72 ? "shocked" : "humiliated";
  const ekoPose: Pose = { ...STAND, headTilt: frame >= 72 ? 0.2 : 0.1, lean: frame >= 72 ? -0.03 : 0 };
  return (
    <Camera dur={dur} move="push-in" amount={0.05} origin="50% 50%" shake={2}>
      <Canvas bg="#f7f1e3">
        <MinimarketBg />
        <Stick x={300} floor={FLOOR} scale={0.95} look={EKO} pose={ekoPose} mood={mood} lookAt={1} />
        <CounterFront />
        <Queue from={0} />
        <Stick
          x={bossX}
          floor={FLOOR}
          scale={1.0}
          look={RUDI}
          pose={bossPose}
          mood="determined"
          lookAt={-0.6}
          holdF={frame >= 36 ? <LongReceipt /> : undefined}
        />
      </Canvas>
      <KineticText words={["BODOH!"]} at={36} stagger={3} top={420} fontSize={120} accent={["BODOH!"]} />
      <KineticText words={["TIDAK", "BECUS!", "MALAS!"]} at={72} stagger={3} top={580} fontSize={96} accent={["BECUS!", "MALAS!"]} />
    </Camera>
  );
};

/** Shot 4 (0–84): close-up Eko menunduk, bos di belakang menunjuk. */
const Shot04: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 56 ? "humiliated" : "sad";
  const headTilt = frame < 56 ? 0.22 : 0.08;
  return (
    <Camera dur={dur} move="push-in" amount={0.08} origin="50% 45%" shake={1.5}>
      <Canvas bg="#f7f1e3">
        <MinimarketBg />
        <Stick
          x={540}
          floor={FLOOR}
          scale={1.05}
          look={EKO}
          pose={{ ...STAND, armF: [0.5, 0.6], armB: [0.35, 0.55], lean: -0.02, headTilt }}
          mood={mood}
          lookAt={0.5}
        />
        <CounterFront />
        <Stick
          x={860}
          floor={FLOOR}
          scale={0.95}
          look={RUDI}
          pose={{ ...STAND, armF: [1.5, 0.15], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 }}
          mood="determined"
          lookAt={-0.7}
        />
        <Stick x={1000} floor={FLOOR} scale={0.8} look={PASSENGERS[2]} pose={STAND} mood="worried" lookAt={-0.8} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5a (0–72): rumah malam. Eko duduk murung di sofa, istri berdiri, struk di meja kopi. */
const Shot05a: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230) scale(0.6)">
          <LongReceipt />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={EKO} pose={SIT} mood="sad" lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={ISTRI} pose={{ ...STAND, headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5b (0–72): kilas balik minimarket. Eko sendiri di kasir, antrean menatap. */
const Shot05b: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Camera dur={72} move="push-in" amount={0.03} origin="50% 50%">
      <Canvas bg="#f7f1e3">
        <MinimarketBg />
        <Stick x={460} floor={FLOOR} scale={0.95} look={EKO} pose={{ ...STAND, headTilt: 0.2, lean: -0.03 }} mood="humiliated" lookAt={0.5} />
        <CounterFront />
        <Queue from={0} xs={[820, 920, 1010]} />
      </Canvas>
      <KineticText words={["DIMAKI", "DI", "DEPAN", "ORANG"]} at={12} stagger={3} top={480} fontSize={88} accent={["DIMAKI"]} />
    </Camera>
  );
};

/** Shot 5c (0–65): kembali ke rumah. Istri menyentuh bahu Eko; Eko tak sanggup menjawab. */
const Shot05c: React.FC = () => {
  const frame = useCurrentFrame();
  const mood = frame < 40 ? "sad" : "resigned";
  return (
    <Camera dur={65} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
        <HomeInteriorBg night />
        <g transform="translate(700,1230) scale(0.6)">
          <LongReceipt />
        </g>
        <Stick x={300} floor={FLOOR} scale={0.95} look={EKO} pose={SIT} mood={mood} lookAt={0.9} />
        <Stick x={820} floor={FLOOR} scale={0.95} look={ISTRI} pose={{ ...STAND, armF: [0.9, 0.2], armB: [-0.1, 0.1], headTilt: 0.12, lean: 0.04 }} mood="worried" lookAt={-0.8} />
      </Canvas>
    </Camera>
  );
};

/** Shot 5 (0–209): rumah -> minimarket -> rumah (cut internal lewat tatapan Eko). */
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

/** Shot 6 (0–158): rumah malam. Eko mengangkat salinan pasal; big text kinetik per kata. */
const Shot06: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  // Beat 1 (0–36f): jalan masuk ke meja. Beat 2 (36–84f): angkat pasal + big text stagger. Beat 3 (84–158f): menatap big text.
  const walking = frame < 36;
  const x = walking ? interpolate(frame, [0, 36], [80, 420], { extrapolateRight: "clamp" }) : 420;
  const pose: Pose = walking
    ? walk((x - 80) / walkCycle(0.9, 0.95), 0.9)
    : { ...STAND, armF: [1.0, 0.25], armB: [0.2, 0.1], lean: -0.04, headTilt: -0.08 };
  return (
    <Camera dur={dur} move="push-in" amount={0.06} origin="50% 45%">
      <Canvas bg="#2f2122">
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
          look={EKO}
          pose={pose}
          mood="determined"
          lookAt={0.5}
          holdF={frame >= 36 ? <PasalFolder /> : undefined}
        />
      </Canvas>
      <KineticText words={["MENGHINA", "SECARA", "KASAR"]} at={36} stagger={3} top={420} fontSize={104} accent={["KASAR"]} />
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

/** Shot 7 (0–177): kartu hukum. Kamera STATIS — kartu harus stabil dan terbaca. */
const Shot07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardIn = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 240, damping: 14 } });
  // Eko menunjuk item 1-2 (0–64f), lalu 3-4 (64–128f), item 5 tercentang (128f+).
  const pointY = frame < 64 ? 0 : frame < 128 ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      {/* Eko kiri menunjuk kartu */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <StickDefs />
        <rect x={0} y={1400} width={1080} height={520} fill="#171a26" />
        <Stick
          x={250}
          floor={FLOOR}
          scale={0.95}
          look={EKO}
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 38, letterSpacing: 2, color: C.alertRed }}>PASAL 231 HURUF G ANGKA 1</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: "#6b675f", marginTop: 6 }}>UU 27/2026 · PENGHINAAN KASAR</div>
        <div style={{ height: 4, background: C.ink, marginTop: 18, opacity: 0.85 }} />
        <LawItem at={0}>
          Pekerja berhak atas perlakuan sesuai harkat dan martabat manusia
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 129 ayat 1 huruf c)</div>
        </LawItem>
        <LawItem at={32}>
          Perusahaan wajib cegah perundungan + sediakan pengaduan internal
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 46 ayat 8 huruf e, g, h)</div>
        </LawItem>
        <LawItem at={64}>
          Menghina secara kasar = alasan pekerja mengajukan PHK
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 231 huruf g angka 1)</div>
          <span style={{ fontFamily: FONT.title, fontSize: 64, color: "#c0241c", lineHeight: 1 }}>231</span>
        </LawItem>
        <LawItem at={96}>
          Bila terbukti: pesangon 2x + penghargaan masa kerja 1x + penggantian hak
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 241 ayat 1)</div>
        </LawItem>
        <LawItem at={128}>
          Bila tidak terbukti: hanya penggantian hak + uang pisah
          <div style={{ fontSize: 24, color: "#6b675f", marginTop: 4 }}>(Pasal 241 ayat 2)</div>
        </LawItem>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8a (0–72): Eko jalan kembali ke minimarket membawa salinan pasal. */
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
          look={EKO}
          pose={walk((x - 120) / walkCycle(0.9, 0.95), 0.9)}
          mood="hopeful"
          holdF={<PasalFolder />}
        />
      </Canvas>
    </Camera>
  );
};

/** Shot 8b (0–102): end card — brand, kalimat penutup, pertanyaan diskusi, handle. */
const Shot08b: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 4 ? 0 : spring({ frame: frame - 4, fps, config: { stiffness: 260, damping: 13 } });
  const line = frame < 30 ? 0 : spring({ frame: frame - 30, fps, config: { stiffness: 260, damping: 13 } });
  const q = frame < 60 ? 0 : spring({ frame: frame - 60, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 480, width: "100%", textAlign: "center", transform: `scale(${title})`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 118, color: "white", textShadow: "0 6px 16px rgba(0,0,0,0.8)" }}>CERITA PEKERJA</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#c9c4b4", marginTop: 16 }}>SETIAP PEKERJA PUNYA CERITA</div>
      </div>
      <div style={{ position: "absolute", top: 820, width: "100%", textAlign: "center", transform: `scale(${line})`, opacity: line }}>
        <div style={{ fontFamily: FONT.title, fontSize: 76, color: C.capYellow, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>Makian bukan teguran.</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", transform: `scale(${q})`, opacity: q, padding: "0 70px" }}>
        <div style={{ fontFamily: FONT.title, fontSize: 62, lineHeight: 1.2, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          Pernah dimaki bos di depan orang? Ceritain di komen.
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 44, color: C.capYellow, marginTop: 34 }}>@ceritapekerja_id</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shot 8 (0–174): kembali bekerja -> end card. */
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

export const EP14: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 228, words: timedCaptions([["Pagi", 0, 500], ["itu,", 500, 900], ["Eko", 1220, 1600], ["baru", 1600, 1940], ["membuka", 1940, 2400], ["kasir.", 2400, 2860], ["Antrean", 3400, 3860], ["pelanggan", 3860, 4320], ["mengular,", 4320, 4760], ["lalu", 5280, 5600], ["bosnya", 5600, 5920], ["datang,", 5920, 6340], ["marah", 6680, 7140], ["soal", 7140, 7480], ["selisih", 7480, 7840], ["kas", 7840, 8040], ["lima", 8040, 8220], ["puluh", 8220, 8400], ["ribu.", 8400, 8980]], 0), yellow: ["PAGI", "KASIR", "BOSNYA", "50.000"] },
    { start: 228, end: 378, words: timedCaptions([["Eko,", 9500, 10040], ["kasir", 10400, 10720], ["minimarket", 10720, 11300], ["di", 11300, 11460], ["Sidoarjo.", 11460, 11960], ["Tiga", 12440, 12600], ["tahun", 12600, 12900], ["bekerja", 12900, 13340], ["di", 13340, 13460], ["sini,", 13460, 13680], ["pelanggan", 14160, 14600], ["kenal", 14600, 14960], ["di", 14960, 15140], ["ramah.", 15140, 15440]], 9500), yellow: ["KASIR", "SIDOARJO", "TIGA", "TAHUN", "RAMAH"] },
    { start: 378, end: 516, words: timedCaptions([["Tapi", 15740, 16420], ["hari", 16420, 16660], ["itu", 16660, 16940], ["bosnya", 16940, 17360], ["memaki", 17360, 17720], ["di", 17720, 17880], ["depan", 17880, 18100], ["semua", 18100, 18300], ["orang,", 18300, 18620], ["bodoh,", 19080, 19480], ["tidak", 19780, 19920], ["becus,", 19920, 20300], ["malas.", 20700, 21080]], 15750), yellow: ["MEMAKI", "BODOH", "BECUS", "MALAS"] },
    { start: 516, end: 600, words: timedCaptions([["Eko", 21500, 21800], ["hanya", 21800, 22060], ["menunduk,", 22060, 22500], ["menahan", 22960, 23200], ["malu", 23200, 23620], ["di", 23620, 23760], ["depan", 23760, 23980], ["Antrean.", 23980, 24480]], 21500), yellow: ["MENUNDUK", "MALU", "ANTREAN"] },
    { start: 600, end: 809, words: timedCaptions([["Eko", 25000, 25360], ["pulang,", 25360, 25740], ["istrinya", 26280, 26700], ["bertanya", 26700, 27100], ["kenapa", 27100, 27500], ["dia", 27500, 27660], ["murung.", 27660, 28020], ["Ia", 28020, 28600], ["tak", 28600, 28800], ["sanggup", 28800, 29100], ["menjawab.", 29100, 29620], ["Dimaki", 30080, 30440], ["di", 30440, 30580], ["depan", 30580, 30780], ["orang", 30780, 31020], ["rasanya", 31020, 31540], ["seperti", 31540, 31760], ["ditelanjangi", 31760, 32540], ["di", 32540, 32660], ["tengah", 32660, 32860], ["pasar.", 32860, 33120]], 25000), yellow: ["PULANG", "MURUNG", "DIMAKI", "PASAR"] },
    { start: 809, end: 967, words: timedCaptions([["Undang-Undang", 33720, 34520], ["Nomor", 34520, 34640], ["27", 34780, 35200], ["Tahun", 35200, 35800], ["2026,", 35800, 36600], ["Pasal", 37000, 37340], ["231", 37340, 38420], ["Huruf", 38420, 38780], ["G", 38780, 39000], ["Angka", 39000, 39540], ["1.", 39540, 39840]], 33708), yellow: ["UNDANG-UNDANG", "PASAL", "231"] },
    { start: 967, end: 1144, words: timedCaptions([["Pemberi", 40280, 40640], ["kerja", 40640, 40960], ["yang", 40960, 41140], ["menghina", 41140, 41520], ["secara", 41520, 41860], ["kasar,", 41860, 42260], ["pekerja", 42560, 42920], ["berhak", 42920, 43180], ["mengajukan", 43180, 43620], ["pemutusan", 43620, 44140], ["hubungan", 44140, 44500], ["kerja,", 44500, 44980], ["dengan", 45180, 45420], ["pesangon", 45420, 45880], ["dua", 45880, 46020], ["kali", 46020, 46220], ["lipat", 46220, 46540], ["bila", 46540, 46740], ["terbukti.", 46740, 47160]], 40292), yellow: ["MENGHINA", "KASAR", "PESANGON", "TERBUKTI"] },
    { start: 1144, end: 1318, words: timedCaptions([["Eko", 47680, 48000], ["kembali", 48000, 48340], ["keesokan", 48340, 48820], ["harinya,", 48820, 49160], ["dengan", 49500, 49680], ["salinan", 49680, 50180], ["pasal", 50180, 50560], ["di", 50560, 50660], ["tangannya.", 50660, 51000], ["Makian", 51420, 51860], ["bukan", 51860, 52080], ["teguran,", 52080, 52480], ["karena", 52860, 53160], ["setiap", 53160, 53560], ["pekerja", 53560, 53920], ["punya", 53920, 54200], ["cerita.", 54200, 54580]], 47667), yellow: ["SALINAN", "PASAL", "MAKIAN", "CERITA"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("voice_over_ep14.mp3")} />
      <Sequence durationInFrames={228}>
        <Shot01 dur={228} />
      </Sequence>
      <Sequence from={228} durationInFrames={150}>
        <Shot02 dur={150} />
      </Sequence>
      <Sequence from={378} durationInFrames={138}>
        <Shot03 dur={138} />
      </Sequence>
      <Sequence from={516} durationInFrames={84}>
        <Shot04 dur={84} />
      </Sequence>
      <Sequence from={600} durationInFrames={209}>
        <Shot05 dur={209} />
      </Sequence>
      <Sequence from={809} durationInFrames={158}>
        <Shot06 dur={158} />
      </Sequence>
      <Sequence from={967} durationInFrames={177}>
        <Shot07 />
      </Sequence>
      <Sequence from={1144}>
        <Shot08 dur={174} />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
