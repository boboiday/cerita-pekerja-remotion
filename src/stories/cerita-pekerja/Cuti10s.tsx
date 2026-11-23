import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cam, Captions, type CapLine, RuleCard, Vignette } from "../../kit/Overlays";
import { STAND, Stick, StickDefs, walk, walkCycle, type Look } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";

/**
 * Cuti10s — Cerita Pekerja 10-second sample (30 fps, 1080x1920).
 * SAME shared script as the 18 TGV style demos (apples-to-apples comparison):
 * "Tiga tahun kerja, nol hari cuti. Bos selalu bilang nanti ya, lagi sibuk.
 *  Sampai badanku menyerah. Ternyata cuti itu hak, bukan hadiah."
 * Word timings are the real faster-whisper alignment of the shared Sulafat VO.
 * 3 shots, motion inside every shot:
 *  S1 warehouse day — Agus by stacked boxes, slow push-in, big "NOL HARI CUTI" title.
 *  S2 office — boss behind desk, Agus walks in, tired beat (eyes closed at "menyerah").
 *  S3 law card — rule card slams in, follow card pops.
 * Built on the stickman kit (MIT, derived from SyedBahjat/claude-stickman-shorts).
 */

export const CUTI_TOTAL = 300;

/** Brand look: white shirt, black pants, red tie. */
const AGUS: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#c0241c" };
/** The boss: blue-grey shirt, dark red tie. */
const BOSS: Look = { body: "#8fa9c2", pants: "#23282e", tie: "#b3352b" };

/** Word timings from the shared-VO alignment (ms, absolute). startMs is relative to the line start. */
const timedCaptions = (words: [string, number, number][], lineStartMs: number): Caption[] =>
  words.map(([w, s, e], i) => ({
    text: (i ? " " : "") + w,
    startMs: Math.round(s - lineStartMs),
    endMs: Math.round(e - lineStartMs),
    timestampMs: Math.round((s + e) / 2 - lineStartMs),
    confidence: null,
  }));

/** SVG canvas in the composition's own pixel space. */
const Canvas: React.FC<{ children?: React.ReactNode; bg?: string }> = ({ children, bg = "#1e2436" }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, background: bg }}>
      <StickDefs />
      {children}
    </svg>
  );
};

/** Shot 1 (0–87): warehouse, daytime. Agus by stacked boxes, big hook title. */
const WarehouseDay: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  const box = (x: number, y: number, w: number, h: number, fill: string) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={C.ink} strokeWidth={6} />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={C.ink} strokeWidth={4} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={C.ink} strokeWidth={4} />
    </g>
  );
  return (
    <Cam dur={dur} from={1} to={1.07} origin="50% 55%">
      <Canvas bg="#f7f1e3">
        {/* sun + window */}
        <circle cx={880} cy={250} r={92} fill="#c0241c" opacity={0.85 + 0.15 * Math.sin(frame * 0.1)} />
        <rect x={80} y={180} width={380} height={420} fill="#bfe3f2" stroke={C.ink} strokeWidth={8} />
        <line x1={270} y1={180} x2={270} y2={600} stroke={C.ink} strokeWidth={8} />
        <line x1={80} y1={390} x2={460} y2={390} stroke={C.ink} strokeWidth={8} />
        <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
        {/* stacked boxes */}
        {box(700, 1150, 220, 180, "#c9a86a")}
        {box(730, 970, 180, 180, "#d8bc82")}
        {box(920, 1180, 150, 150, "#b3945e")}
        {/* floor */}
        <rect x={0} y={1400} width={1080} height={520} fill="#8a7a5c" />
        <rect x={0} y={1400} width={1080} height={18} fill="#6b5e46" />
        {/* Agus standing by the boxes, slight idle bob */}
        <Stick
          x={380}
          floor={1400 + Math.sin(frame * 0.4) * 3}
          scale={0.95}
          look={AGUS}
          pose={{ ...STAND, armF: [0.2 + Math.sin(frame * 0.3) * 0.04, 0.1], armB: [-0.1, 0.1], lean: 0.03 }}
        />
      </Canvas>
      {/* hook title pops in */}
      <div style={{ position: "absolute", top: 470, width: "100%", textAlign: "center", transform: `scale(${title}) rotate(-3deg)`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 108, lineHeight: 1.02, color: "white", textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>NOL HARI</div>
        <div style={{ fontFamily: FONT.title, fontSize: 108, lineHeight: 1.02, color: C.alertRed, textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>CUTI</div>
      </div>
    </Cam>
  );
};

/** Shot 2 (87–219): office. Boss behind desk, Agus walks in, tired beat at "menyerah". */
const OfficeBoss: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  const arrive = 70; // frames until Agus reaches the desk
  const walkX = interpolate(frame, [0, arrive], [120, 470], { extrapolateRight: "clamp" });
  const walking = frame <= arrive;
  const tired = frame > 110; // "menyerah" lands near the end of the shot
  const agusPose = walking
    ? walk((walkX - 120) / walkCycle(0.9, 0.9), 0.9)
    : { ...STAND, lean: tired ? 0.22 : 0.06, armF: [0.35, 0.15], armB: [-0.15, 0.1] };
  return (
    <Cam dur={dur} from={1} to={1.05} origin="50% 50%">
      <Canvas bg="#e8e0c8">
        {/* window with day sky */}
        <rect x={80} y={180} width={380} height={420} fill="#bfe3f2" stroke={C.ink} strokeWidth={8} />
        <line x1={270} y1={180} x2={270} y2={600} stroke={C.ink} strokeWidth={8} />
        <line x1={80} y1={390} x2={460} y2={390} stroke={C.ink} strokeWidth={8} />
        <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
        {/* wall clock */}
        <circle cx={820} cy={350} r={90} fill="#f5f2e8" stroke={C.ink} strokeWidth={8} />
        <line x1={820} y1={350} x2={820 + Math.sin(0.9) * 48} y2={350 - Math.cos(0.9) * 48} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={820} y1={350} x2={820 + Math.sin(0.5) * 68} y2={350 - Math.cos(0.5) * 68} stroke={C.alertRed} strokeWidth={7} strokeLinecap="round" />
        <circle cx={820} cy={350} r={9} fill={C.ink} />
        {/* floor */}
        <rect x={0} y={1400} width={1080} height={520} fill="#3a3a3f" />
        {/* boss standing behind the desk, pointing */}
        <Stick
          x={760}
          floor={1400}
          scale={1.0}
          look={BOSS}
          pose={{ ...STAND, armF: [1.5 + Math.sin(frame * 0.25) * 0.06, 0.2], armB: [0.3, 0.1], lean: -0.06 }}
        />
        {/* desk front */}
        <rect x={0} y={1150} width={1080} height={18} fill="#6b4a38" />
        <rect x={0} y={1168} width={1080} height={232} fill="#5c4033" />
        <line x1={0} y1={1280} x2={1080} y2={1280} stroke="#4a3428" strokeWidth={4} />
        {/* Agus walks in, then stands tired */}
        <Stick x={walkX} floor={1400} scale={0.9} look={AGUS} pose={agusPose} eyesClosed={tired} />
      </Canvas>
      {/* boss excuse title pops in */}
      <div style={{ position: "absolute", top: 470, width: "100%", textAlign: "center", transform: `scale(${title}) rotate(-2deg)`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 92, lineHeight: 1.02, color: "white", textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>NANTI YA,</div>
        <div style={{ fontFamily: FONT.title, fontSize: 92, lineHeight: 1.02, color: C.alertRed, textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>LAGI SIBUK</div>
      </div>
    </Cam>
  );
};

/** Shot 3 (219–300): the law card + follow card. */
const LawCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const follow = frame < 30 ? 0 : spring({ frame: frame - 30, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      <RuleCard label="PASAL 118" text={["CUTI", "ITU", "HAK"]} />
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", transform: `scale(${follow})`, opacity: follow }}>
        <div style={{ fontFamily: FONT.title, fontSize: 64, color: "white", textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
          FOLLOW <span style={{ color: C.capYellow }}>@CERITAPEKERJA_ID</span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#c9c4b4", marginTop: 18 }}>
          SETIAP PEKERJA PUNYA CERITA
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Cuti10s: React.FC = () => {
  const caps: CapLine[] = [
    {
      start: 0, end: 87,
      words: timedCaptions([["Tiga", 0, 660], ["tahun", 660, 920], ["kerja,", 920, 1460], ["nol", 1680, 2020], ["hari", 2020, 2200], ["cuti.", 2200, 2660]], 0),
      yellow: ["NOL", "CUTI"],
    },
    {
      start: 87, end: 219,
      words: timedCaptions([["Bos", 2980, 3280], ["selalu", 3280, 3660], ["bilang,", 3660, 3880], ["nanti", 4160, 4520], ["ya,", 4520, 4700], ["lagi", 4840, 5040], ["sibuk,", 5040, 5560], ["Sampai", 5800, 6200], ["badanku", 6200, 6720], ["menyerah.", 6720, 7120]], 2900),
      yellow: ["NANTI", "SIBUK", "MENYERAH"],
    },
    {
      start: 219, end: 300,
      words: timedCaptions([["Ternyata,", 7360, 7780], ["cuti", 8120, 8400], ["itu", 8400, 8620], ["hak,", 8620, 8880], ["bukan", 8880, 9320], ["hadiah.", 9320, 9780]], 7300),
      yellow: ["HAK", "HADIAH"],
    },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Sequence durationInFrames={87}>
        <WarehouseDay dur={87} />
      </Sequence>
      <Sequence from={87} durationInFrames={132}>
        <OfficeBoss dur={132} />
      </Sequence>
      <Sequence from={219}>
        <LawCard />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
