import React from "react";
import { C } from "./style";

/**
 * StickyPrison — set sel penjara + 2 karakter ORIGINAL untuk trial "Penjara Bintang Lima".
 *
 * Karakter digambar sebagai SVG flat 2D (bukan jiplak The Sticky: tanpa kepala
 * kuning, tanpa topi merah, tanpa baju garis). UDIN = jumpsuit oranye, rambut
 * hitam acak-acakan. PAK SIPIR = seragam navy gelap, topi pet, kumis tebal.
 * Satu komponen rig per karakter; ekspresi ganti via prop, bukan gambar ulang.
 *
 * Ruang koordinat: komposisi 1080x1920, lantai y=1500.
 */

const TAU = Math.PI / 180;
const rotPt = (x: number, y: number, deg: number) => {
  const r = deg * TAU;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: x * c - y * s, y: x * s + y * c };
};

// ---------------------------------------------------------------------------
// BACKGROUND — sel penjara (satu set, satu angle)
// ---------------------------------------------------------------------------
export const PrisonCell: React.FC = () => {
  const bricks: React.ReactNode[] = [];
  for (let row = 0; row < 34; row++) {
    const off = row % 2 === 0 ? 0 : -65;
    for (let col = -1; col < 10; col++) {
      bricks.push(
        <rect
          key={`${row}-${col}`}
          x={off + col * 130}
          y={row * 44}
          width={126}
          height={40}
          rx={4}
          fill={row % 5 === 4 ? "#8f9296" : "#9a9a96"}
        />,
      );
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* dinding bata */}
      <svg width={1080} height={1500} style={{ position: "absolute", left: 0, top: 0, background: "#7d8085" }}>
        {bricks}
      </svg>
      {/* jendela berjeruji + sorot cahaya */}
      <div style={{ position: "absolute", left: 90, top: 130, width: 280, height: 300, background: "#cfd8e2", border: "14px solid #4a4d52", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 78, top: 0, width: 14, height: "100%", background: "#3a3f45" }} />
        <div style={{ position: "absolute", left: 168, top: 0, width: 14, height: "100%", background: "#3a3f45" }} />
        <div style={{ position: "absolute", left: 0, top: 130, width: "100%", height: 14, background: "#3a3f45" }} />
        <div style={{ position: "absolute", left: 30, top: 40, width: 90, height: 90, borderRadius: "50%", background: "#fff3c4", opacity: 0.9 }} />
      </div>
      <div
        style={{
          position: "absolute", left: 150, top: 430, width: 420, height: 1070,
          background: "linear-gradient(160deg, rgba(255,248,224,0.22), rgba(255,248,224,0))",
          clipPath: "polygon(0 0, 55% 0, 100% 100%, 20% 100%)",
        }}
      />
      {/* lantai kayu */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, height: 420, background: "#b98a56" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 30 + i * 100, height: 5, background: "#9a6f42", opacity: 0.7 }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1496, height: 6, background: "#8a6a44" }} />
      {/* ranjang kiri */}
      <div style={{ position: "absolute", left: 60, top: 1180, width: 500, height: 60, background: "#5b6066", borderRadius: 8, border: `4px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 70, top: 1120, width: 480, height: 64, background: "#e8e0c8", borderRadius: 10, border: `4px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 84, top: 1090, width: 130, height: 44, background: "#fdf8ea", borderRadius: 12, border: `4px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 330, top: 1140, width: 200, height: 40, background: "#7a8ba0", borderRadius: 8, border: `4px solid ${C.ink}` }} />
      <div style={{ position: "absolute", left: 80, top: 1240, width: 14, height: 260, background: "#4a4d52" }} />
      <div style={{ position: "absolute", left: 526, top: 1240, width: 14, height: 260, background: "#4a4d52" }} />
      {/* meja kecil + nampan + koran */}
      <div style={{ position: "absolute", left: 620, top: 1290, width: 260, height: 26, background: "#8a5a34", border: `4px solid ${C.ink}`, borderRadius: 6 }} />
      <div style={{ position: "absolute", left: 650, top: 1316, width: 16, height: 184, background: "#6b4423" }} />
      <div style={{ position: "absolute", left: 834, top: 1316, width: 16, height: 184, background: "#6b4423" }} />
      <div style={{ position: "absolute", left: 660, top: 1252, width: 150, height: 40, background: "#c8c8c8", border: `4px solid ${C.ink}`, borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 700, top: 1232, width: 44, height: 26, background: "#fdf8ea", border: `3px solid ${C.ink}`, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 820, top: 1240, width: 70, height: 52, background: "#fdf8ea", border: `3px solid ${C.ink}`, transform: "rotate(6deg)" }}>
        <div style={{ width: 54, margin: "6px auto 0", height: 4, background: C.ink }} />
        <div style={{ width: 54, margin: "5px auto 0", height: 4, background: C.ink }} />
        <div style={{ width: 40, margin: "5px auto 0", height: 4, background: C.ink }} />
      </div>
      {/* pintu sel berjeruji kanan */}
      <div style={{ position: "absolute", left: 940, top: 0, width: 140, height: 1500, background: "#6e7276" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", left: 18 + i * 46, top: 0, width: 14, height: "100%", background: "#3a3f45" }} />
        ))}
        <div style={{ position: "absolute", left: 0, top: 500, width: "100%", height: 14, background: "#3a3f45" }} />
        <div style={{ position: "absolute", left: 0, top: 1000, width: "100%", height: 14, background: "#3a3f45" }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// WAJAH — varian ekspresi (dipakai kedua karakter, warna kulit beda)
// ---------------------------------------------------------------------------
export type FaceMood = "relaxed" | "smile" | "surprised" | "laugh" | "serious" | "confused" | "angry";

const Face: React.FC<{ mood: FaceMood; cx: number; cy: number; s: number }> = ({ mood, cx, cy, s }) => {
  const eyeY = cy - 8 * s;
  const mouthY = cy + 26 * s;
  const eye = (x: number) => {
    if (mood === "laugh") {
      return <path d={`M ${x - 11 * s} ${eyeY + 4 * s} Q ${x} ${eyeY - 12 * s} ${x + 11 * s} ${eyeY + 4 * s}`} stroke={C.ink} strokeWidth={5 * s} fill="none" strokeLinecap="round" />;
    }
    if (mood === "surprised") {
      return <circle cx={x} cy={eyeY} r={7 * s} fill={C.ink} />;
    }
    return <ellipse cx={x} cy={eyeY} rx={6 * s} ry={10 * s} fill={C.ink} />;
  };
  const brows = () => {
    if (mood === "angry") {
      return (
        <g stroke={C.ink} strokeWidth={6 * s} strokeLinecap="round">
          <line x1={cx - 30 * s} y1={eyeY - 24 * s} x2={cx - 8 * s} y2={eyeY - 14 * s} />
          <line x1={cx + 8 * s} y1={eyeY - 14 * s} x2={cx + 30 * s} y2={eyeY - 24 * s} />
        </g>
      );
    }
    if (mood === "confused") {
      return (
        <g stroke={C.ink} strokeWidth={5 * s} strokeLinecap="round">
          <line x1={cx - 30 * s} y1={eyeY - 26 * s} x2={cx - 8 * s} y2={eyeY - 30 * s} />
          <line x1={cx + 8 * s} y1={eyeY - 18 * s} x2={cx + 30 * s} y2={eyeY - 26 * s} />
        </g>
      );
    }
    if (mood === "surprised") {
      return (
        <g stroke={C.ink} strokeWidth={5 * s} strokeLinecap="round">
          <line x1={cx - 30 * s} y1={eyeY - 30 * s} x2={cx - 8 * s} y2={eyeY - 28 * s} />
          <line x1={cx + 8 * s} y1={eyeY - 28 * s} x2={cx + 30 * s} y2={eyeY - 30 * s} />
        </g>
      );
    }
    return (
      <g stroke={C.ink} strokeWidth={5 * s} strokeLinecap="round">
        <line x1={cx - 30 * s} y1={eyeY - 22 * s} x2={cx - 8 * s} y2={eyeY - 24 * s} />
        <line x1={cx + 8 * s} y1={eyeY - 24 * s} x2={cx + 30 * s} y2={eyeY - 22 * s} />
      </g>
    );
  };
  const mouth = () => {
    if (mood === "laugh") {
      return (
        <g>
          <ellipse cx={cx} cy={mouthY + 6 * s} rx={20 * s} ry={14 * s} fill="#7a2a1e" stroke={C.ink} strokeWidth={4 * s} />
          <ellipse cx={cx} cy={mouthY + 12 * s} rx={10 * s} ry={5 * s} fill="#d96a6a" />
        </g>
      );
    }
    if (mood === "smile") {
      return <path d={`M ${cx - 18 * s} ${mouthY} Q ${cx} ${mouthY + 18 * s} ${cx + 18 * s} ${mouthY}`} stroke={C.ink} strokeWidth={5 * s} fill="none" strokeLinecap="round" />;
    }
    if (mood === "surprised" || mood === "confused") {
      return <ellipse cx={cx} cy={mouthY + 4 * s} rx={8 * s} ry={10 * s} fill={C.ink} />;
    }
    if (mood === "angry") {
      return (
        <g>
          <path d={`M ${cx - 16 * s} ${mouthY + 10 * s} L ${cx + 16 * s} ${mouthY + 10 * s}`} stroke={C.ink} strokeWidth={6 * s} strokeLinecap="round" />
          <path d={`M ${cx - 10 * s} ${mouthY + 18 * s} L ${cx + 10 * s} ${mouthY + 18 * s}`} stroke={C.ink} strokeWidth={4 * s} strokeLinecap="round" />
        </g>
      );
    }
    return <path d={`M ${cx - 12 * s} ${mouthY} Q ${cx} ${mouthY + 8 * s} ${cx + 12 * s} ${mouthY}`} stroke={C.ink} strokeWidth={5 * s} fill="none" strokeLinecap="round" />;
  };
  return (
    <g>
      {mood === "angry" && (
        <g fill="#c0241c" opacity={0.35}>
          <ellipse cx={cx - 34 * s} cy={cy + 12 * s} rx={14 * s} ry={10 * s} />
          <ellipse cx={cx + 34 * s} cy={cy + 12 * s} rx={14 * s} ry={10 * s} />
        </g>
      )}
      {eye(cx - 20 * s)}
      {eye(cx + 20 * s)}
      {brows()}
      {mouth()}
    </g>
  );
};

// Lengan sebagai rect berotasi dari pivot bahu; kembalikan ujung (tangan).
const Limb: React.FC<{
  px: number; py: number; len: number; w: number; deg: number; color: string;
  hand?: boolean; handColor?: string;
}> = ({ px, py, len, w, deg, color, hand = true, handColor = "#e8b98a" }) => {
  const end = rotPt(0, len, deg);
  return (
    <g transform={`translate(${px} ${py}) rotate(${deg})`}>
      <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} fill={color} stroke={C.ink} strokeWidth={4} />
      {hand && <circle cx={0} cy={len + 8} r={w * 0.62} fill={handColor} stroke={C.ink} strokeWidth={4} />}
      <circle cx={0} cy={0} r={w * 0.5} fill={color} stroke={C.ink} strokeWidth={3} />
      <circle cx={0} cy={0} r={1} fill="none" data-ex={end.x} data-ey={end.y} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// UDIN — tahanan, jumpsuit oranye. hip di (x, hipY). sitT 0 = berbaring, 1 = duduk.
// ---------------------------------------------------------------------------
export type UdinMood = "relaxed" | "smile" | "surprised" | "laugh";
const lerpLocal = (a: number, b: number, t: number) => a + (b - a) * t;
export const Udin: React.FC<{
  x: number; hipY: number; sitT: number; mood: UdinMood;
  headTilt?: number; bounce?: number; laughShake?: number;
}> = ({ x, hipY, sitT, mood, headTilt = 0, bounce = 0, laughShake = 0 }) => {
  const torsoDeg = -72 + 72 * sitT; // berbaring -> duduk
  const legOp = sitT < 0.5 ? 1 : 0; // kaki lurus (berbaring) vs tertekuk (duduk)
  const legOp2 = 1 - legOp;
  const shake = laughShake * 3;
  // Koran: dipegang di depan muka saat berbaring -> diletakkan di ranjang
  // sebelah kanan saat duduk (ikut sitT, jadi terlihat ditaruh saat bangun).
  const paperX = lerpLocal(0, 150, sitT);
  const paperY = lerpLocal(-330, -105, sitT);
  const paperRot = lerpLocal(0, 8, sitT);
  return (
    <div style={{ position: "absolute", left: x, top: hipY + bounce, width: 0, height: 0 }}>
      <svg width={520} height={620} viewBox="-260 -320 520 620" style={{ position: "absolute", left: -260, top: -320, overflow: "visible" }}>
        {/* kaki lurus (berbaring, ke kanan) */}
        <g opacity={legOp}>
          <rect x={-10} y={-26} width={210} height={30} rx={15} fill="#e8702a" stroke={C.ink} strokeWidth={5} />
          <rect x={-10} y={8} width={200} height={30} rx={15} fill="#d95f1e" stroke={C.ink} strokeWidth={5} />
          <ellipse cx={212} cy={-10} rx={26} ry={14} fill="#3a2a1a" stroke={C.ink} strokeWidth={4} />
          <ellipse cx={202} cy={24} rx={26} ry={14} fill="#3a2a1a" stroke={C.ink} strokeWidth={4} />
        </g>
        {/* kaki tertekuk (duduk, ke bawah) */}
        <g opacity={legOp2}>
          <rect x={-58} y={-10} width={34} height={150} rx={17} fill="#e8702a" stroke={C.ink} strokeWidth={5} />
          <rect x={14} y={-10} width={34} height={150} rx={17} fill="#d95f1e" stroke={C.ink} strokeWidth={5} />
          <ellipse cx={-41} cy={150} rx={26} ry={13} fill="#3a2a1a" stroke={C.ink} strokeWidth={4} />
          <ellipse cx={31} cy={150} rx={26} ry={13} fill="#3a2a1a" stroke={C.ink} strokeWidth={4} />
        </g>
        {/* torso + kepala + lengan (berotasi dari pinggul) */}
        <g transform={`rotate(${torsoDeg + shake})`}>
          <rect x={-72} y={-212} width={144} height={216} rx={26} fill="#e8702a" stroke={C.ink} strokeWidth={6} />
          <rect x={-72} y={-212} width={144} height={34} rx={16} fill="#d95f1e" stroke={C.ink} strokeWidth={4} />
          <line x1={0} y1={-178} x2={0} y2={-20} stroke="#c24e12" strokeWidth={5} />
          <rect x={-46} y={-150} width={92} height={34} rx={6} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
          <text x={0} y={-126} fontFamily="monospace" fontWeight={800} fontSize={22} fill={C.ink} textAnchor="middle">UDIN</text>
          {/* lengan kiri (pegang koran) */}
          <Limb px={-70} py={-180} len={120} w={30} deg={paperUp ? -38 : 18} color="#e8702a" />
          {/* lengan kanan */}
          <Limb px={70} py={-180} len={120} w={30} deg={paperUp ? 38 : -14} color="#d95f1e" />
          {/* kepala */}
          <g transform={`rotate(${headTilt})`}>
            <ellipse cx={0} cy={-268} rx={56} ry={62} fill="#e8b98a" stroke={C.ink} strokeWidth={6} />
            {/* rambut hitam acak-acakan */}
            <path d="M -56 -272 Q -58 -330 -20 -336 Q -6 -352 10 -334 Q 34 -348 48 -326 Q 60 -312 56 -272 Q 30 -300 -6 -298 Q -40 -300 -56 -272 Z" fill="#1d1d1f" stroke={C.ink} strokeWidth={4} />
            <Face mood={mood} cx={0} cy={-268} s={1} />
          </g>
          {/* koran: dipegang saat berbaring, ditaruh di ranjang saat duduk */}
          <g transform={`translate(${paperX} ${paperY}) rotate(${paperRot})`}>
            <rect x={-70} y={-46} width={140} height={92} rx={6} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
            <rect x={-70} y={-46} width={140} height={22} fill="#1d1d1f" />
            <text x={0} y={-30} fontFamily="monospace" fontWeight={800} fontSize={13} fill="#fdf8ea" textAnchor="middle">KORAN PAGI</text>
            <line x1={-58} y1={-8} x2={58} y2={-8} stroke={C.ink} strokeWidth={3} />
            <line x1={-58} y1={8} x2={58} y2={8} stroke={C.ink} strokeWidth={3} />
            <line x1={-58} y1={24} x2={20} y2={24} stroke={C.ink} strokeWidth={3} />
          </g>
        </g>
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PAK SIPIR — tinggi kurus, seragam navy, topi pet, kumis. feet di (x, floorY).
// ---------------------------------------------------------------------------
export type SipirMood = "serious" | "confused" | "angry";
export const PakSipir: React.FC<{
  x: number; floorY: number; mood: SipirMood;
  pointT?: number; headTilt?: number; bounce?: number; lean?: number;
}> = ({ x, floorY, mood, pointT = 0, headTilt = 0, bounce = 0, lean = 0 }) => {
  // pointT 0 = lengan kanan menggantung, 1 = nunjuk horizontal ke kiri (ke pintu/ke Udin)
  const armRDeg = -8 + pointT * -82;
  return (
    <div style={{ position: "absolute", left: x, top: floorY + bounce, width: 0, height: 0 }}>
      <svg width={360} height={640} viewBox="-180 -640 360 640" style={{ position: "absolute", left: -180, top: -640, overflow: "visible" }}>
        <g transform={`rotate(${lean})`}>
          {/* kaki */}
          <rect x={-52} y={-270} width={44} height={252} rx={16} fill="#232f52" stroke={C.ink} strokeWidth={5} />
          <rect x={8} y={-270} width={44} height={252} rx={16} fill="#1d2a4d" stroke={C.ink} strokeWidth={5} />
          <ellipse cx={-30} cy={-6} rx={34} ry={15} fill="#141414" stroke={C.ink} strokeWidth={4} />
          <ellipse cx={30} cy={-6} rx={34} ry={15} fill="#141414" stroke={C.ink} strokeWidth={4} />
          {/* torso seragam */}
          <rect x={-78} y={-452} width={156} height={196} rx={22} fill="#2b3a67" stroke={C.ink} strokeWidth={6} />
          <rect x={-78} y={-268} width={156} height={26} fill="#141414" stroke={C.ink} strokeWidth={4} />
          <rect x={-14} y={-268} width={28} height={26} fill="#c8a03a" stroke={C.ink} strokeWidth={3} />
          <line x1={0} y1={-452} x2={0} y2={-280} stroke="#1d2a4d" strokeWidth={4} />
          <circle cx={0} cy={-420} r={5} fill="#c8a03a" />
          <circle cx={0} cy={-380} r={5} fill="#c8a03a" />
          <circle cx={0} cy={-340} r={5} fill="#c8a03a" />
          {/* lencana + name tag */}
          <circle cx={-48} cy={-400} r={14} fill="#c8a03a" stroke={C.ink} strokeWidth={3} />
          <rect x={14} y={-414} width={48} height={20} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
          {/* lengan kiri menggantung */}
          <Limb px={-76} py={-420} len={150} w={30} deg={6} color="#2b3a67" />
          {/* lengan kanan (nunjuk saat pointT=1) */}
          <g transform={`translate(76 -420)`}>
            <Limb px={0} py={0} len={150} w={30} deg={armRDeg} color="#232f52" />
            {/* jari telunjuk saat nunjuk */}
            {pointT > 0.6 && (
              <g transform={`rotate(${armRDeg}) translate(0 168)`}>
                <rect x={-5} y={0} width={10} height={26} rx={5} fill="#e8b98a" stroke={C.ink} strokeWidth={3} />
              </g>
            )}
          </g>
          {/* kepala */}
          <g transform={`rotate(${headTilt})`}>
            <ellipse cx={0} cy={-516} rx={50} ry={60} fill="#e8b98a" stroke={C.ink} strokeWidth={6} />
            {/* kumis tebal */}
            <path d="M -34 -492 Q -16 -506 0 -494 Q 16 -506 34 -492 Q 30 -478 12 -482 Q 0 -486 -12 -482 Q -30 -478 -34 -492 Z" fill="#1d1d1f" stroke={C.ink} strokeWidth={3} />
            <Face mood={mood} cx={0} cy={-516} s={0.95} />
            {/* topi pet */}
            <path d="M -52 -556 Q -54 -600 0 -604 Q 54 -600 52 -556 Q 0 -570 -52 -556 Z" fill="#1d2a4d" stroke={C.ink} strokeWidth={5} />
            <ellipse cx={0} cy={-556} rx={58} ry={12} fill="#141414" stroke={C.ink} strokeWidth={4} />
            <circle cx={0} cy={-584} r={10} fill="#c8a03a" stroke={C.ink} strokeWidth={3} />
          </g>
        </g>
      </svg>
    </div>
  );
};
