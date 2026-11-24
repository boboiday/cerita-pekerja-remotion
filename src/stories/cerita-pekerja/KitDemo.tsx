import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { CitySkylineBg, HomeInteriorBg, OfficeBg, SkylineFar, SkylineNear, StationBg } from "../../kit/Backgrounds";
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";
import { EmphasisLine, KineticText } from "../../kit/KineticText";
import { CardboardBox, DuffelBag, Suitcase } from "../../kit/Props";
import { CARRY, PACK, SIT, STAND, Stick, StickDefs, walk, walkCycle, type Look } from "../../kit/Stick";
import { FONT } from "../../kit/style";

/**
 * KitDemo — komposisi QA 10 detik (30 fps) untuk kit Cerita Pekerja.
 * BUKAN episode tayang: 5 shot x 2 detik, masing-masing menguji satu
 * kelompok fitur kit baru. Render via Actions (dispatch KitDemo) setiap
 * kali kit berubah, lalu cek frame-nya sebelum episode berikutnya dibuat.
 *
 * S1 stasiun + koper + sad | S2 rumah + kardus + resigned->hopeful
 * S3 kantor + angry vs shocked | S4 parallax skyline + tracking
 * S5 stasiun + duduk + kinetic text
 */
export const KIT_TOTAL = 300;

const FLOOR = 1400;
const RANI: Look = { body: "#f5f2e8", pants: "#1d1d1f", bun: true, hair: "#2a1a12" };
const BOSS: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };

const Canvas: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = "#1e2436" }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, background: bg }}>
      <StickDefs />
      {children}
    </svg>
  );
};

/** Label kecil penanda shot (hanya untuk QA demo, bukan episode). */
const ShotLabel: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", top: 60, left: 40, fontFamily: FONT.mono, fontWeight: 800, fontSize: 26, letterSpacing: 1, color: "white", background: "#130f0b", padding: "10px 18px", borderRadius: 999 }}>
    {text}
  </div>
);

/** S1 (0–60): stasiun, Rani membawa koper, mood sad, push-in. */
const Shot1: React.FC<{ dur: number }> = ({ dur }) => (
  <Camera dur={dur} move="push-in" amount={0.05} origin="50% 55%">
    <Canvas bg="#e8e0c8">
      <StationBg />
      <Stick x={540} floor={FLOOR} scale={0.95} look={RANI} pose={CARRY} mood="sad" lookAt={0.9} holdF={<Suitcase />} />
    </Canvas>
    <ShotLabel text="S1 STASIUN + KOPER + SAD" />
  </Camera>
);

/** S2 (0–60): rumah, Rani mengepak kardus, resigned -> hopeful di tengah shot. */
const Shot2: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const mood = frame < 30 ? "resigned" : "hopeful";
  return (
    <Camera dur={dur} move="static">
      <Canvas bg="#e8e0c8">
        <HomeInteriorBg />
        <g transform={`translate(700,${FLOOR})`}>
          <CardboardBox label="BARANG" />
        </g>
        <g transform={`translate(880,${FLOOR})`}>
          <CardboardBox label="BUKU" scale={0.7} />
        </g>
        <Stick x={430} floor={FLOOR} scale={0.95} look={RANI} pose={PACK} mood={mood} lookAt={0.9} holdB={<DuffelBag />} />
      </Canvas>
      <ShotLabel text="S2 RUMAH + KARDUS + RESIGNED→HOPEFUL" />
    </Camera>
  );
};

/** S3 (0–60): kantor, atasan angry menunjuk, Rani shocked, pull-out. */
const Shot3: React.FC<{ dur: number }> = ({ dur }) => (
  <Camera dur={dur} move="pull-out" amount={0.05} origin="50% 50%">
    <Canvas bg="#e8e0c8">
      <OfficeBg />
      <Stick x={380} floor={FLOOR} scale={0.95} look={RANI} pose={{ ...STAND, lean: -0.08, headTilt: 0.12 }} mood="shocked" lookAt={1} />
      <Stick
        x={780}
        floor={FLOOR}
        scale={1.0}
        look={BOSS}
        pose={{ ...STAND, armF: [1.5, 0.15], armB: [0.3, 0.1], lean: -0.06, headTilt: -0.05 }}
        mood="angry"
        lookAt={-0.7}
      />
    </Canvas>
    <ShotLabel text="S3 KANTOR + ANGRY vs SHOCKED" />
  </Camera>
);

/** S4 (0–60): parallax skyline 2 lapis + tracking, Rani jalan kiri -> kanan. */
const Shot4: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, dur], [140, 940], { extrapolateRight: "clamp" });
  return (
    <Camera dur={dur} move="tracking-right" amount={60}>
      <Canvas bg="#f7d9a8">
        <Parallax dur={dur}>
          <ParallaxLayer speed={120}>
            <SkylineFar />
          </ParallaxLayer>
          <ParallaxLayer speed={320}>
            <SkylineNear />
          </ParallaxLayer>
        </Parallax>
        {/* jalan di depan lapis parallax */}
        <rect x={0} y={FLOOR} width={1080} height={520} fill="#3a3a3f" />
        <rect x={0} y={FLOOR} width={1080} height={16} fill="#5c564a" />
        <Stick x={x} floor={FLOOR} scale={0.95} look={RANI} pose={walk((x - 140) / walkCycle(0.9, 0.95), 0.9)} mood="determined" lookAt={0.9} />
      </Canvas>
      <ShotLabel text="S4 PARALLAX + TRACKING" />
    </Camera>
  );
};

/** S5 (0–60): stasiun, Rani duduk di bangku (tired) + kinetic text. */
const Shot5: React.FC<{ dur: number }> = ({ dur }) => (
  <Camera dur={dur} move="push-in" amount={0.04} origin="50% 45%">
    <Canvas bg="#e8e0c8">
      <StationBg />
      <Stick x={570} floor={FLOOR} scale={0.95} look={RANI} pose={SIT} mood="tired" lookAt={0.5} />
      <g transform={`translate(760,${FLOOR})`}>
        <CardboardBox label="BARANG" scale={0.8} />
      </g>
    </Canvas>
    <EmphasisLine text="DIPINDAHKAN KE KOTA LAIN" keyword="KOTA LAIN" at={8} top={380} fontSize={84} />
    <KineticText words={["TIDAK", "ADA", "PILIHAN"]} at={30} stagger={3} top={560} fontSize={72} accent={["TIDAK"]} />
    <ShotLabel text="S5 DUDUK + KINETIC TEXT" />
  </Camera>
);

export const KitDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Sequence durationInFrames={60}>
        <Shot1 dur={60} />
      </Sequence>
      <Sequence from={60} durationInFrames={60}>
        <Shot2 dur={60} />
      </Sequence>
      <Sequence from={120} durationInFrames={60}>
        <Shot3 dur={60} />
      </Sequence>
      <Sequence from={180} durationInFrames={60}>
        <Shot4 dur={60} />
      </Sequence>
      <Sequence from={240}>
        <Shot5 dur={60} />
      </Sequence>
    </AbsoluteFill>
  );
};
