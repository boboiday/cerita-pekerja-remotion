import type { Caption } from "@remotion/captions";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cam, Captions, type CapLine, RuleCard, Vignette } from "../../kit/Overlays";
import { STAND, Stick, StickDefs, walk, walkCycle, type Look } from "../../kit/Stick";
import { C, FONT } from "../../kit/style";

/**
 * Sample10s — Cerita Pekerja 10-second sample (30 fps, 1080x1920).
 * Raka, lembur tak dibayar. 3 distinct shots, motion inside every shot:
 *  S1 office night — slow push-in, typing arms, ticking clock, twinkling stars.
 *  S2 street day — Raka walks with a real walk cycle, parallax buildings, drifting clouds.
 *  S3 law card — rule card slams in, follow card pops.
 * Built on the stickman kit (MIT, derived from SyedBahjat/claude-stickman-shorts).
 */

export const SAMPLE_TOTAL = 300;

/** Brand look: white shirt, black pants, red tie. */
const RAKA: Look = { body: "#f5f2e8", pants: "#1d1d1f", tie: "#c0241c" };

/** Captions without a voice file: evenly paced words. */
const textCaptions = (text: string, wordsPerSec = 2.6): Caption[] =>
  text.split(/\s+/).map((w, i) => {
    const startMs = Math.round((i / wordsPerSec) * 1000);
    const endMs = Math.round(((i + 1) / wordsPerSec) * 1000);
    return { text: (i ? " " : "") + w, startMs, endMs, timestampMs: (startMs + endMs) / 2, confidence: null };
  });

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

/** Shot 1 (0–95): office at night. Raka typing at his desk, clock ticking. */
const OfficeNight: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = frame < 8 ? 0 : spring({ frame: frame - 8, fps, config: { stiffness: 260, damping: 12 } });
  const minuteAng = interpolate(frame, [0, dur], [0.4, 0.9]);
  const stars: [number, number][] = [
    [140, 240], [220, 180], [320, 260], [380, 200], [160, 340], [280, 330],
  ];
  return (
    <Cam dur={dur} from={1} to={1.07} origin="50% 45%">
      <Canvas bg="#1e2436">
        {/* window with night sky, moon, twinkling stars */}
        <rect x={80} y={180} width={380} height={420} fill="#0f1220" stroke={C.ink} strokeWidth={8} />
        <circle cx={350} cy={280} r={52} fill="#f5f2e8" />
        <circle cx={330} cy={268} r={10} fill="#d8d2ba" />
        <circle cx={362} cy={296} r={7} fill="#d8d2ba" />
        {stars.map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={5} fill="white" opacity={0.45 + 0.45 * Math.sin(frame * 0.15 + i * 1.7)} />
        ))}
        <line x1={270} y1={180} x2={270} y2={600} stroke={C.ink} strokeWidth={8} />
        <line x1={80} y1={390} x2={460} y2={390} stroke={C.ink} strokeWidth={8} />
        {/* wall clock, minute hand ticks */}
        <circle cx={820} cy={350} r={90} fill="#f5f2e8" stroke={C.ink} strokeWidth={8} />
        <line x1={820} y1={350} x2={820 + Math.sin(0.9) * 48} y2={350 - Math.cos(0.9) * 48} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={820} y1={350} x2={820 + Math.sin(minuteAng) * 68} y2={350 - Math.cos(minuteAng) * 68} stroke={C.alertRed} strokeWidth={7} strokeLinecap="round" />
        <circle cx={820} cy={350} r={9} fill={C.ink} />
        {/* floor */}
        <rect x={0} y={1400} width={1080} height={520} fill="#141824" />
        {/* Raka typing: arms move, body bobs subtly */}
        <Stick
          x={420}
          floor={1400 + Math.sin(frame * 0.4) * 3}
          scale={0.95}
          look={RAKA}
          pose={{
            ...STAND,
            armF: [1.25 + Math.sin(frame * 0.6) * 0.08, 0.25],
            armB: [1.05 + Math.sin(frame * 0.6 + 1.2) * 0.08, 0.35],
            lean: 0.14,
          }}
        />
        {/* desk front hides the legs: Raka reads as seated */}
        <rect x={0} y={1150} width={1080} height={18} fill="#6b4a38" />
        <rect x={0} y={1168} width={1080} height={232} fill="#5c4033" />
        <line x1={0} y1={1280} x2={1080} y2={1280} stroke="#4a3428" strokeWidth={4} />
        {/* monitor + keyboard on the desk */}
        <rect x={700} y={950} width={260} height={170} rx={10} fill="#22252b" stroke={C.ink} strokeWidth={6} />
        <rect x={716} y={966} width={228} height={138} rx={6} fill="#2e6f8e" />
        <rect x={730} y={990} width={140} height={10} rx={5} fill="#bfe3f2" opacity={0.9} />
        <rect x={730} y={1014} width={180} height={10} rx={5} fill="#bfe3f2" opacity={0.7} />
        <rect x={730} y={1038} width={110} height={10} rx={5} fill="#bfe3f2" opacity={0.5} />
        <rect x={806} y={1120} width={48} height={30} fill="#22252b" />
        <rect x={620} y={1132} width={180} height={18} rx={6} fill="#2a2a2e" stroke={C.ink} strokeWidth={3} />
      </Canvas>
      {/* hook title pops in */}
      <div style={{ position: "absolute", top: 470, width: "100%", textAlign: "center", transform: `scale(${title}) rotate(-3deg)`, opacity: title }}>
        <div style={{ fontFamily: FONT.title, fontSize: 108, lineHeight: 1.02, color: "white", textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>LEMBUR TAK</div>
        <div style={{ fontFamily: FONT.title, fontSize: 108, lineHeight: 1.02, color: C.alertRed, textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>DIBAYAR?</div>
      </div>
    </Cam>
  );
};

/** Shot 2 (96–200): street, daytime. Raka walks home, parallax buildings, drifting clouds. */
const StreetWalk: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const far = [
    { x: -300, w: 280, h: 640 }, { x: 0, w: 220, h: 820 }, { x: 250, w: 300, h: 600 },
    { x: 580, w: 240, h: 760 }, { x: 850, w: 260, h: 640 }, { x: 1140, w: 300, h: 800 }, { x: 1470, w: 260, h: 660 },
  ];
  const near = [
    { x: -260, w: 320, h: 420 }, { x: 120, w: 260, h: 540 }, { x: 460, w: 300, h: 460 },
    { x: 820, w: 280, h: 580 }, { x: 1140, w: 320, h: 480 }, { x: 1500, w: 280, h: 560 },
  ];
  const x = interpolate(frame, [0, dur], [120, 900]);
  const building = (b: { x: number; w: number; h: number }, color: string, win: string, i: number) => (
    <g key={i}>
      <rect x={b.x} y={1400 - b.h} width={b.w} height={b.h} fill={color} />
      {Array.from({ length: 3 }).map((_, c) =>
        Array.from({ length: Math.floor(b.h / 130) }).map((_, r) => (
          <rect key={`${c}-${r}`} x={b.x + 30 + c * 80} y={1400 - b.h + 50 + r * 130} width={40} height={60} fill={win} opacity={0.85} />
        )),
      )}
    </g>
  );
  return (
    <Cam dur={dur} from={1.04} to={1} origin="50% 60%">
      <Canvas bg="#f7f1e3">
        {/* sun + drifting clouds */}
        <circle cx={880} cy={250} r={92} fill="#c0241c" opacity={0.85 + 0.15 * Math.sin(frame * 0.1)} />
        <ellipse cx={200 + frame * 0.5} cy={300} rx={95} ry={26} fill="white" opacity={0.9} />
        <ellipse cx={700 - frame * 0.3} cy={190} rx={80} ry={22} fill="white" opacity={0.8} />
        {/* parallax buildings */}
        <g transform={`translate(${-frame * 0.6},0)`}>{far.map((b, i) => building(b, "#1e2436", "#f7f1e3", i))}</g>
        <g transform={`translate(${-frame * 1.4},0)`}>{near.map((b, i) => building(b, "#2a3350", "#e8e0c8", i))}</g>
        {/* road */}
        <rect x={0} y={1360} width={1080} height={40} fill="#6b6b66" />
        <rect x={0} y={1400} width={1080} height={520} fill="#3a3a3f" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={i * 150 + 20} y={1640} width={80} height={12} fill="#f5f2e8" opacity={0.8} />
        ))}
        {/* Raka walks with a real walk cycle, feet planted on the road */}
        <Stick x={x} floor={1400} scale={0.9} look={RAKA} pose={walk((x - 120) / walkCycle(0.9, 0.9), 0.9)} />
      </Canvas>
    </Cam>
  );
};

/** Shot 3 (201–299): the law card + follow card. */
const LawCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const follow = frame < 30 ? 0 : spring({ frame: frame - 30, fps, config: { stiffness: 260, damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#1e2436" }}>
      <RuleCard label="PASAL 116" text={["LEMBUR", "WAJIB", "DIBAYAR"]} />
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

export const Sample10s: React.FC = () => {
  const caps: CapLine[] = [
    { start: 0, end: 95, words: textCaptions("Jam sembilan malam. Raka masih di kantor."), yellow: ["MALAM", "KANTOR"] },
    { start: 96, end: 200, words: textCaptions("Lima tahun lembur. Tak pernah dibayar."), yellow: ["LEMBUR"] },
    { start: 201, end: 300, words: textCaptions("Pasal 116: lembur wajib dibayar."), yellow: ["116", "DIBAYAR"] },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Sequence durationInFrames={96}>
        <OfficeNight dur={96} />
      </Sequence>
      <Sequence from={96} durationInFrames={105}>
        <StreetWalk dur={105} />
      </Sequence>
      <Sequence from={201}>
        <LawCard />
      </Sequence>
      <Vignette strength={0.5} />
      <Captions lines={caps} />
    </AbsoluteFill>
  );
};
