import React from "react";
import { C, FONT } from "./style";

/**
 * Characters — 5 model karakter Cerita Pekerja, gaya CHIBI (DRAFT PREVIEW).
 *
 * GAYA VISUAL DIKUNCI 28 Nov 2026: chibi — kepala besar + badan kecil,
 * outline tebal, warna flat, palet merah-hitam-putih + aksen.
 * Sumber kebenaran visual:
 *   ~/workspace/cerita-pekerja/character-models/style-reference-chibi.jpg
 *   ("Cerita Pekerja — Karakter Utama", tagline "Bekerja • Berjuang • Bersama")
 * Sumber identitas/latar belakang/konflik hukum (TETAP):
 *   referensi-model-karakter-cerita-pekerja-teks.docx (TEKS SAJA).
 * PNG model sheet lama hanya contoh — bila teks dan gambar bertentangan,
 * TEKS yang diikuti (celana Yanto HITAM; Bambang TIDAK pakai topi cap).
 *
 * DRAFT PREVIEW — komponen ini BELUM dipakai episode mana pun dan BELUM
 * disetujui Avenir untuk produksi. Jangan sambungkan ke komposisi episode
 * sebelum ada persetujuan eksplisit. Rig ini MENGGANTIKAN versi stickman
 * sebelumnya — jangan tinggalkan dua gaya di kit.
 *
 * Geometri rig (koordinat lokal, lantai y=0): kepala elips (0,-420)
 * rx=110 ry=105 (~40% tinggi total 525), badan y -300..-135, kaki
 * -145..0. Ekspresi: senyum = "smile", khawatir = "worried",
 * tegas = "determined" (alis + mulut, seperti mood kit).
 */

export type ChibiMood = "neutral" | "smile" | "worried" | "determined";

export interface ChibiCharProps {
  x: number; // pusat kaki (px)
  floor: number; // lantai y (px) — kaki menapak di sini
  scale?: number;
  mood?: ChibiMood;
}

const SKIN = "#f6ead2";
const HAIR_DARK = "#3a2a1a";
const HAIR_GREY = "#b9b6ae";
const HIJAB = "#e8dcc0";
const GREEN = "#3a9e4d";
const MOUTH = "#8a2e2a";

/** Wajah chibi: mata oval + mulut/alis per mood. Pusat kepala (0,-420). */
const Face: React.FC<{ mood: ChibiMood }> = ({ mood }) => (
  <g>
    {mood === "smile" ? (
      <>
        {/* mata tertutup bahagia */}
        <path d="M-58,-436 Q-42,-452 -26,-436" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M26,-436 Q42,-452 58,-436" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {/* senyum terbuka */}
        <path d="M-26,-396 Q0,-362 26,-396 Z" fill={MOUTH} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={0} cy={-382} rx={9} ry={5} fill="#db483b" />
      </>
    ) : mood === "worried" ? (
      <>
        <ellipse cx={-42} cy={-435} rx={10} ry={14} fill={C.ink} />
        <ellipse cx={42} cy={-435} rx={10} ry={14} fill={C.ink} />
        <ellipse cx={0} cy={-388} rx={9} ry={12} fill={MOUTH} stroke={C.ink} strokeWidth={4} />
        {/* tetes keringat */}
        <path d="M96,-498 Q110,-476 96,-468 Q82,-476 96,-498 Z" fill="#5d93c9" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      </>
    ) : mood === "determined" ? (
      <>
        {/* alis miring turun ke dalam (tegas) */}
        <path d="M-58,-458 L-26,-448" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M26,-448 L58,-458" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={-42} cy={-435} rx={10} ry={14} fill={C.ink} />
        <ellipse cx={42} cy={-435} rx={10} ry={14} fill={C.ink} />
        <path d="M-24,-388 L24,-388" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx={-42} cy={-435} rx={10} ry={14} fill={C.ink} />
        <ellipse cx={42} cy={-435} rx={10} ry={14} fill={C.ink} />
        <path d="M-16,-390 Q0,-382 16,-390" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      </>
    )}
  </g>
);

/** Tanda gerak merah (seperti di referensi: garis kecil dekat gestur). */
const Burst: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke="#db483b" strokeWidth={5} strokeLinecap="round">
    <line x1={x} y1={y} x2={x + 16} y2={y - 12} />
    <line x1={x + 6} y1={y + 14} x2={x + 22} y2={y + 8} />
    <line x1={x - 2} y1={y - 16} x2={x + 6} y2={y - 30} />
  </g>
);

interface FigureProps {
  mood?: ChibiMood;
  topColor: string;
  sleeveColor: string;
  shoe?: "sneakers" | "flats" | "boots";
  ears?: boolean; // false = telinga disembunyikan (hijab Wulan menutupinya)
  back?: React.ReactNode; // di belakang segalanya (tas, rambut panjang)
  hair?: React.ReactNode; // di kepala, sesudah wajah dasar, sebelum topi
  hat?: React.ReactNode;
  faceExtra?: React.ReactNode; // kacamata, kumis — sesudah wajah
  topDetail?: React.ReactNode; // rompi, apron, dasi, kancing, logo
  armR?: React.ReactNode; // gestur kanan (dirender akhir, di atas wajah)
  armL?: React.ReactNode; // gestur kiri
  held?: React.ReactNode; // barang di tangan (paling akhir)
}

/** Rig chibi bersama: kaki → badan → lengan → kepala → wajah → gestur. */
const ChibiFigure: React.FC<FigureProps> = ({
  mood = "neutral", topColor, sleeveColor, shoe = "sneakers", ears = true,
  back, hair, hat, faceExtra, topDetail, armR, armL, held,
}) => {
  const arm = (side: 1 | -1) => (
    <g>
      <path d={`M${side * 70},-278 L${side * 94},-168`} stroke={sleeveColor} strokeWidth={30} strokeLinecap="round" />
      <circle cx={side * 94} cy={-168} r={15} fill={SKIN} stroke={C.ink} strokeWidth={5} />
    </g>
  );
  return (
    <g>
      {back}
      {/* kaki + sepatu */}
      <rect x={-58} y={-145} width={44} height={138} rx={18} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
      <rect x={14} y={-145} width={44} height={138} rx={18} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
      {shoe === "sneakers" ? (
        <>
          <rect x={-72} y={-18} width={68} height={24} rx={10} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
          <rect x={4} y={-18} width={68} height={24} rx={10} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
          <rect x={-72} y={-6} width={68} height={8} rx={4} fill="#fdf8ea" />
          <rect x={4} y={-6} width={68} height={8} rx={4} fill="#fdf8ea" />
        </>
      ) : shoe === "boots" ? (
        <>
          <rect x={-72} y={-24} width={66} height={28} rx={8} fill="#7a4a2b" stroke={C.ink} strokeWidth={6} />
          <rect x={6} y={-24} width={66} height={28} rx={8} fill="#7a4a2b" stroke={C.ink} strokeWidth={6} />
          <rect x={-72} y={-4} width={66} height={8} fill="#1d1d1f" />
          <rect x={6} y={-4} width={66} height={8} fill="#1d1d1f" />
        </>
      ) : (
        <>
          <ellipse cx={-36} cy={-4} rx={32} ry={12} fill="#1d1d1f" stroke={C.ink} strokeWidth={5} />
          <ellipse cx={36} cy={-4} rx={32} ry={12} fill="#1d1d1f" stroke={C.ink} strokeWidth={5} />
        </>
      )}
      {/* badan + leher */}
      <rect x={-78} y={-300} width={156} height={165} rx={38} fill={topColor} stroke={C.ink} strokeWidth={7} />
      <rect x={-16} y={-322} width={32} height={30} fill={SKIN} stroke={C.ink} strokeWidth={5} />
      {topDetail}
      {/* lengan gantung (hanya yang tidak diganti gestur) */}
      {!armL && arm(-1)}
      {!armR && arm(1)}
      {/* kepala (telinga hanya bila tidak tertutup hijab) */}
      {ears && (
        <>
          <circle cx={-112} cy={-415} r={14} fill={SKIN} stroke={C.ink} strokeWidth={6} />
          <circle cx={112} cy={-415} r={14} fill={SKIN} stroke={C.ink} strokeWidth={6} />
        </>
      )}
      <ellipse cx={0} cy={-420} rx={110} ry={105} fill={SKIN} stroke={C.ink} strokeWidth={8} />
      {hair}
      {hat}
      <Face mood={mood} />
      {faceExtra}
      {/* gestur + barang di tangan (paling atas) */}
      {armR}
      {armL}
      {held}
    </g>
  );
};

/* ------------------------------ topi ------------------------------ */

/** Helm safety putih bergaris merah (Dedi) — jambul rambut di pelipis. */
const HelmetWhite: React.FC<{ tuftColor: string }> = ({ tuftColor }) => (
  <g>
    <path d="M-112,-470 A112,80 0 0 1 112,-470 Z" fill="#fdf8ea" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M-80,-505 Q0,-525 80,-505" fill="none" stroke="#db483b" strokeWidth={9} strokeLinecap="round" />
    <path d="M-100,-485 Q0,-505 100,-485" fill="none" stroke="#db483b" strokeWidth={9} strokeLinecap="round" />
    <rect x={-122} y={-478} width={244} height={16} rx={8} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
    <circle cx={0} cy={-535} r={10} fill="#db483b" stroke={C.ink} strokeWidth={3} />
    {/* jambul di pelipis, keluar dari bawah brim */}
    <path d="M-108,-452 L-92,-436 L-104,-420 L-88,-404" fill="none" stroke={tuftColor} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M108,-452 L92,-436 L104,-420 L88,-404" fill="none" stroke={tuftColor} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** Helm proyek kuning (Bambang) — jambul uban di pelipis. */
const HelmetYellow: React.FC = () => (
  <g>
    <path d="M-112,-470 A112,80 0 0 1 112,-470 Z" fill="#ffc338" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M0,-550 L0,-478" stroke="#00000033" strokeWidth={6} strokeLinecap="round" />
    <rect x={-122} y={-478} width={244} height={16} rx={8} fill="#ffc338" stroke={C.ink} strokeWidth={6} />
    <path d="M-108,-452 L-92,-436 L-104,-420 L-88,-404" fill="none" stroke={HAIR_GREY} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M108,-452 L92,-436 L104,-420 L88,-404" fill="none" stroke={HAIR_GREY} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/* ------------------------------ rambut ------------------------------ */

/** Rambut spike Yanto — tepi bawah bergerigi (bukan garis lurus) supaya
 *  terbaca sebagai rambut, bukan mahkota/headband. */
const SpikyHair: React.FC = () => (
  <path
    d="M-110,-428 L-98,-502 L-68,-464 L-50,-514 L-16,-470 L6,-516 L36,-472 L64,-508 L88,-466 L110,-428 Q88,-462 66,-446 Q44,-470 22,-452 Q0,-472 -22,-452 Q-44,-470 -66,-446 Q-88,-462 -110,-428 Z"
    fill={HAIR_DARK} stroke={C.ink} strokeWidth={6} strokeLinejoin="round"
  />
);

/** Rambut panjang Putri — massa belakang (di belakang badan). Cokelat hangat
 *  #4a3220 supaya terpisah dari blazer hitam #23282e. */
const LongHairBack: React.FC = () => (
  <path d="M-122,-420 A122,122 0 1,1 122,-420 L128,-150 Q128,-110 92,-110 L-92,-110 Q-128,-110 -128,-150 Z" fill="#4a3220" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
);

/** Helaian rambut depan Putri (di sisi wajah, jatuh ke dada). */
const LongHairFront: React.FC = () => (
  <g>
    <path d="M-88,-440 Q-104,-320 -96,-180 L-70,-180 Q-80,-320 -64,-436 Z" fill="#4a3220" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M64,-436 Q80,-320 96,-180 L70,-180 Q80,-320 88,-440 Z" fill="#4a3220" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/** Hijab Wulan — lingkaran krem di belakang kepala. */
const HijabBack: React.FC = () => (
  <circle cx={0} cy={-420} r={122} fill={HIJAB} stroke={C.ink} strokeWidth={8} />
);

/** Ujung hijab di sisi leher. */
const HijabDrape: React.FC = () => (
  <g>
    <path d="M-84,-392 Q-96,-300 -88,-240 L-58,-240 Q-68,-300 -56,-388 Z" fill={HIJAB} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M56,-388 Q68,-300 88,-240 L58,-240 Q68,-300 84,-392 Z" fill={HIJAB} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/* ------------------------------ gestur ------------------------------ */

/** Jempol Dedi (tangan kanan terangkat) — kepalan + jempol dibesarkan. */
const ThumbArm: React.FC = () => (
  <g>
    <path d="M70,-278 L98,-306 L110,-340" fill="none" stroke="#f5f2e8" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={110} cy={-340} r={18} fill={SKIN} stroke={C.ink} strokeWidth={5} />
    <rect x={101} y={-374} width={18} height={30} rx={9} fill={SKIN} stroke={C.ink} strokeWidth={5} />
    <Burst x={140} y={-368} />
  </g>
);

/** Lambaian Wulan (tangan kanan terangkat, jari terbuka). */
const WaveArm: React.FC = () => (
  <g>
    <path d="M70,-278 L118,-352" fill="none" stroke="#f5f2e8" strokeWidth={30} strokeLinecap="round" />
    <circle cx={118} cy={-352} r={16} fill={SKIN} stroke={C.ink} strokeWidth={5} />
    <path d="M108,-364 L104,-382 M118,-368 L118,-386 M128,-364 L132,-382" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <Burst x={148} y={-384} />
  </g>
);

/** Lengan Bambang memegang gagang sekop. */
const ShovelArm: React.FC = () => (
  <g>
    <path d="M70,-278 L100,-192" fill="none" stroke={SKIN} strokeWidth={30} strokeLinecap="round" />
    <circle cx={100} cy={-192} r={15} fill={SKIN} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Sekop yang dipegang (gagang di tangan, mata di tanah). */
const ShovelHeld: React.FC = () => (
  <g>
    <rect x={92} y={-196} width={16} height={180} rx={6} fill="#e2a748" stroke={C.ink} strokeWidth={5} />
    <path d="M80,-20 L124,-20 L114,6 Q102,14 90,6 Z" fill="#4a4a4f" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Tangan Putri membetulkan kacamata + lengan kiri memegang laptop. */
const AdjustArm: React.FC = () => (
  <g>
    <path d="M70,-278 L58,-340 L54,-396" fill="none" stroke="#23282e" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={54} cy={-396} r={14} fill={SKIN} stroke={C.ink} strokeWidth={5} />
  </g>
);
const LaptopArm: React.FC = () => (
  <g>
    <path d="M-70,-278 L-96,-232" fill="none" stroke="#23282e" strokeWidth={30} strokeLinecap="round" />
    <circle cx={-96} cy={-232} r={14} fill={SKIN} stroke={C.ink} strokeWidth={5} />
  </g>
);
const LaptopHeld: React.FC = () => (
  <g transform="rotate(-8 -80 -218)">
    <rect x={-128} y={-252} width={96} height={68} rx={8} fill="#8f969b" stroke={C.ink} strokeWidth={6} />
    <circle cx={-80} cy={-218} r={8} fill={C.ink} />
  </g>
);

/** Tangan Yanto memegang HP terangkat. */
const PhoneArm: React.FC = () => (
  <g>
    <path d="M70,-278 L94,-208" fill="none" stroke={GREEN} strokeWidth={30} strokeLinecap="round" />
    <circle cx={94} cy={-208} r={15} fill={SKIN} stroke={C.ink} strokeWidth={5} />
    <Burst x={126} y={-256} />
  </g>
);
const PhoneHeld: React.FC = () => (
  <g>
    <rect x={80} y={-262} width={34} height={62} rx={6} fill="#1d1d1f" stroke={C.ink} strokeWidth={5} />
    <rect x={84} y={-254} width={26} height={46} rx={3} fill="#ece5dd" />
  </g>
);

/* ------------------------------ karakter ------------------------------ */

const Wrap: React.FC<ChibiCharProps & { children: React.ReactNode }> = ({ x, floor, scale = 1, children }) => (
  <g transform={`translate(${x},${floor}) scale(${scale})`}>{children}</g>
);

/** 1. DEDI SANTOSO — operator pabrik garmen, Bekasi. Helm putih garis merah + rompi abu-abu + name tag "DEDI", jempol. */
export const Dedi: React.FC<ChibiCharProps> = ({ x, floor, scale = 1, mood = "neutral" }) => (
  <Wrap x={x} floor={floor} scale={scale}>
    <ChibiFigure
      mood={mood} topColor="#f5f2e8" sleeveColor="#f5f2e8" shoe="sneakers"
      hat={<HelmetWhite tuftColor={HAIR_DARK} />}
      topDetail={
        <g>
          {/* rompi abu-abu, dasi + kemeja di celah tengah */}
          <path d="M-78,-300 L-16,-300 L-20,-138 L-78,-138 Z" fill="#8f969b" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M16,-300 L78,-300 L78,-138 L20,-138 Z" fill="#8f969b" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-9,-296 L9,-296 L6,-246 L0,-226 L-6,-246 Z" fill="#1d1d1f" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
          <rect x={-64} y={-200} width={20} height={16} rx={3} fill="#7c838a" stroke={C.ink} strokeWidth={3} />
          <rect x={44} y={-200} width={20} height={16} rx={3} fill="#7c838a" stroke={C.ink} strokeWidth={3} />
          {/* name tag di panel KANAN — panel kiri tertutup lengan gantung */}
          <rect x={22} y={-268} width={46} height={26} rx={3} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
          <text x={45} y={-250} fontFamily={FONT.mono} fontWeight={800} fontSize={14} fill={C.ink} textAnchor="middle">DEDI</text>
        </g>
      }
      armR={<ThumbArm />}
    />
  </Wrap>
);

/** 2. WULAN AYU — kasir minimarket, Yogyakarta. Hijab krem + apron merah + name tag "WULAN", melambai. */
export const Wulan: React.FC<ChibiCharProps> = ({ x, floor, scale = 1, mood = "neutral" }) => (
  <Wrap x={x} floor={floor} scale={scale}>
    <ChibiFigure
      mood={mood} topColor="#f5f2e8" sleeveColor="#f5f2e8" shoe="flats"
      ears={false}
      back={<HijabBack />}
      hair={<HijabDrape />}
      topDetail={
        <g>
          {/* apron merah + 2 saku + name tag */}
          <path d="M-62,-298 L62,-298 L70,-138 L-70,-138 Z" fill="#c8241c" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-48} y={-190} width={26} height={28} rx={4} fill="#9e1b14" stroke={C.ink} strokeWidth={3} />
          <rect x={22} y={-190} width={26} height={28} rx={4} fill="#9e1b14" stroke={C.ink} strokeWidth={3} />
          <rect x={-34} y={-276} width={68} height={26} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
          <text x={0} y={-258} fontFamily={FONT.mono} fontWeight={800} fontSize={15} fill={C.ink} textAnchor="middle">WULAN</text>
        </g>
      }
      armR={<WaveArm />}
    />
  </Wrap>
);

/** 3. BAMBANG RIYANTO — kuli bangunan, Jakarta. Helm kuning + kumis + kaos putih + sekop. TIDAK pakai topi cap. */
export const Bambang: React.FC<ChibiCharProps> = ({ x, floor, scale = 1, mood = "neutral" }) => (
  <Wrap x={x} floor={floor} scale={scale}>
    <ChibiFigure
      mood={mood} topColor="#f5f2e8" sleeveColor={SKIN} shoe="boots"
      hat={<HelmetYellow />}
      faceExtra={
        /* kumis abu-abu besar — mulut mood tetap terlihat di bawahnya */
        <ellipse cx={0} cy={-404} rx={34} ry={10} fill={HAIR_GREY} stroke={C.ink} strokeWidth={4} />
      }
      topDetail={
        <rect x={-54} y={-252} width={26} height={22} rx={3} fill="#f5f2e8" stroke="#c0241c" strokeWidth={3} />
      }
      armR={<ShovelArm />}
      held={<ShovelHeld />}
    />
  </Wrap>
);

/** 4. PUTRI MAHARANI — staf admin startup, Bandung. Rambut panjang hitam + kacamata + blazer hitam + laptop. */
export const Putri: React.FC<ChibiCharProps> = ({ x, floor, scale = 1, mood = "neutral" }) => (
  <Wrap x={x} floor={floor} scale={scale}>
    <ChibiFigure
      mood={mood} topColor="#23282e" sleeveColor="#23282e" shoe="flats"
      back={<LongHairBack />}
      hair={<LongHairFront />}
      faceExtra={
        <g>
          <circle cx={-42} cy={-435} r={24} fill="#ffffff" opacity={0.25} stroke={C.ink} strokeWidth={6} />
          <circle cx={42} cy={-435} r={24} fill="#ffffff" opacity={0.25} stroke={C.ink} strokeWidth={6} />
          <line x1={-18} y1={-438} x2={18} y2={-438} stroke={C.ink} strokeWidth={5} />
          <line x1={-66} y1={-438} x2={-104} y2={-442} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={66} y1={-438} x2={104} y2={-442} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
      }
      topDetail={
        <g>
          <path d="M-18,-300 L18,-300 L0,-238 Z" fill="#f5f2e8" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={0} cy={-200} r={5} fill="#db483b" stroke={C.ink} strokeWidth={2} />
          <circle cx={0} cy={-168} r={5} fill="#db483b" stroke={C.ink} strokeWidth={2} />
        </g>
      }
      armR={<AdjustArm />}
      armL={<LaptopArm />}
      held={<LaptopHeld />}
    />
  </Wrap>
);

/** 5. YANTO PRASETYO — driver ojek online, Surabaya. Jaket hijau + tas delivery merah + HP. Celana HITAM (teks). */
export const Yanto: React.FC<ChibiCharProps> = ({ x, floor, scale = 1, mood = "neutral" }) => (
  <Wrap x={x} floor={floor} scale={scale}>
    <ChibiFigure
      mood={mood} topColor={GREEN} sleeveColor={GREEN} shoe="sneakers"
      back={
        <g>
          {/* tas delivery merah di punggung (sisi kanan) */}
          <rect x={52} y={-312} width={112} height={142} rx={14} fill="#c0241c" stroke={C.ink} strokeWidth={7} />
          <rect x={96} y={-292} width={26} height={26} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
          <path d="M109,-292 L109,-266 M96,-279 L122,-279" stroke={C.ink} strokeWidth={2} />
        </g>
      }
      hair={<SpikyHair />}
      topDetail={
        <g>
          {/* tali tas di bahu + kaos putih + logo jaket + resleting */}
          <rect x={48} y={-300} width={16} height={110} rx={6} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
          <path d="M-14,-300 L14,-300 L0,-272 Z" fill="#f5f2e8" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={-40} cy={-244} r={14} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
          <circle cx={-40} cy={-244} r={6} fill={GREEN} />
          <line x1={0} y1={-296} x2={0} y2={-140} stroke="#00000044" strokeWidth={4} />
        </g>
      }
      armR={<PhoneArm />}
      held={<PhoneHeld />}
    />
  </Wrap>
);

/* ------------------------------------------------------------------ */
/* Prop khas (digambar di panel model sheet, titik 0,0 = tengah prop).  */
/* ------------------------------------------------------------------ */

/** Jam dinding shift malam. */
export const WallClock: React.FC = () => (
  <g>
    <circle r={88} fill="#fdf8ea" stroke={C.ink} strokeWidth={7} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * Math.PI) / 6;
      const big = i % 3 === 0;
      return (
        <line key={i} x1={Math.sin(a) * (big ? 70 : 76)} y1={-Math.cos(a) * (big ? 70 : 76)} x2={Math.sin(a) * 82} y2={-Math.cos(a) * 82} stroke={C.ink} strokeWidth={big ? 6 : 3} strokeLinecap="round" />
      );
    })}
    {/* jarum ke ~11:00 (shift malam) */}
    <line x1={0} y1={0} x2={-28} y2={-38} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={-58} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <circle r={7} fill={C.ink} />
  </g>
);

/** Alat jahit: benang, gunting, meteran. */
export const SewingKit: React.FC = () => (
  <g>
    {/* gulungan benang merah */}
    <rect x={-108} y={-52} width={46} height={104} rx={8} fill="#db483b" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={-85} cy={-52} rx={23} ry={10} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <line x1={-108} y1={-24} x2={-62} y2={-24} stroke="#00000044" strokeWidth={6} />
    <line x1={-108} y1={0} x2={-62} y2={0} stroke="#00000044" strokeWidth={6} />
    {/* gunting */}
    <g transform="translate(10,0)">
      <path d="M-34,44 L26,-46" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
      <path d="M-34,44 L26,-46" stroke="#cfcab3" strokeWidth={8} strokeLinecap="round" />
      <path d="M34,44 L-26,-46" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
      <path d="M34,44 L-26,-46" stroke="#cfcab3" strokeWidth={8} strokeLinecap="round" />
      <circle cx={-42} cy={58} r={14} fill="none" stroke={C.ink} strokeWidth={6} />
      <circle cx={42} cy={58} r={14} fill="none" stroke={C.ink} strokeWidth={6} />
    </g>
    {/* meteran melingkar */}
    <g transform="translate(96,10)">
      <circle r={40} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
      <circle r={26} fill="none" stroke={C.ink} strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3;
        return <line key={i} x1={Math.sin(a) * 30} y1={-Math.cos(a) * 30} x2={Math.sin(a) * 38} y2={-Math.cos(a) * 38} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />;
      })}
    </g>
  </g>
);

/** Mesin kasir merah. */
export const CashRegister: React.FC = () => (
  <g>
    <rect x={-110} y={-64} width={220} height={128} rx={10} fill="#c8241c" stroke={C.ink} strokeWidth={6} />
    <rect x={-110} y={-64} width={220} height={34} rx={10} fill="#9e1b14" stroke={C.ink} strokeWidth={4} />
    {/* display */}
    <rect x={36} y={-108} width={74} height={40} rx={6} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <text x={73} y={-80} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">0.00</text>
    {/* keypad */}
    {[-58, -24, 10].map((y) =>
      [-84, -50, -16].map((x) => (
        <rect key={`${x},${y}`} x={x} y={y} width={26} height={20} rx={3} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
      )),
    )}
    {/* laci + gagang */}
    <line x1={-96} y1={44} x2={96} y2={44} stroke={C.ink} strokeWidth={4} />
    <rect x={-24} y={26} width={48} height={12} rx={6} fill={C.ink} />
  </g>
);

/** Struk belanja. */
export const Receipt: React.FC = () => {
  const zig = (w: number, h: number, teeth: number) => {
    let d = `M${-w / 2},${-h / 2}`;
    for (let i = 0; i < teeth; i++) {
      d += ` L${-w / 2 + ((i + 0.5) * w) / teeth},${-h / 2 + 12} L${-w / 2 + ((i + 1) * w) / teeth},${-h / 2}`;
    }
    d += ` L${w / 2},${h / 2}`;
    for (let i = 0; i < teeth; i++) {
      d += ` L${w / 2 - ((i + 0.5) * w) / teeth},${h / 2 - 12} L${w / 2 - ((i + 1) * w) / teeth},${h / 2}`;
    }
    return d + " Z";
  };
  return (
    <g>
      <path d={zig(170, 230, 8)} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <text x={0} y={-72} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle">RECEIPT</text>
      <line x1={-62} y1={-54} x2={62} y2={-54} stroke={C.ink} strokeWidth={3} />
      <text x={0} y={-16} fontFamily={FONT.mono} fontWeight={700} fontSize={17} fill={C.ink} textAnchor="middle">SNACK 5.000</text>
      <text x={0} y={14} fontFamily={FONT.mono} fontWeight={700} fontSize={17} fill={C.ink} textAnchor="middle">DRINK 3.000</text>
      <line x1={-62} y1={38} x2={62} y2={38} stroke={C.ink} strokeWidth={3} />
      <text x={0} y={76} fontFamily={FONT.mono} fontWeight={800} fontSize={19} fill={C.ink} textAnchor="middle">TOTAL 8.000</text>
    </g>
  );
};

/** Helm proyek (prop samping). */
export const HelmetProp: React.FC<{ color?: string }> = ({ color = "#ffc338" }) => (
  <g>
    <path d="M-84,-7 A84,84 0 0 1 84,-7 Z" fill={color} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-14,-86 L-8,-20 M14,-86 L8,-20" stroke={C.ink} strokeWidth={4} opacity={0.5} />
    <rect x={-96} y={-14} width={192} height={16} rx={8} fill={color} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Sekop. */
export const Shovel: React.FC = () => (
  <g>
    <rect x={-10} y={-150} width={20} height={150} rx={6} fill="#e2a748" stroke={C.ink} strokeWidth={5} />
    <rect x={-10} y={-62} width={20} height={18} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
    <path d="M-42,0 L42,0 L30,86 Q0,106 -30,86 Z" fill="#4a4a4f" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Laptop. */
export const Laptop: React.FC = () => (
  <g>
    <rect x={-105} y={-80} width={210} height={130} rx={8} fill="#3a3a3f" stroke={C.ink} strokeWidth={6} />
    <rect x={-93} y={-68} width={186} height={106} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <rect x={-120} y={50} width={240} height={16} rx={6} fill="#8f969b" stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Map folder berisi dokumen. */
export const Folder: React.FC = () => (
  <g>
    <rect x={-95} y={-60} width={190} height={130} rx={8} fill="#c0241c" stroke={C.ink} strokeWidth={6} />
    <rect x={-70} y={-98} width={140} height={62} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <line x1={-56} y1={-76} x2={56} y2={-76} stroke={C.ink} strokeWidth={3} />
    <line x1={-56} y1={-58} x2={56} y2={-58} stroke={C.ink} strokeWidth={3} />
    <rect x={-95} y={-22} width={190} height={92} rx={8} fill="#e4d4a8" stroke={C.ink} strokeWidth={6} />
    <rect x={-95} y={-22} width={64} height={20} rx={6} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Ponsel (prop samping). */
export const Phone: React.FC = () => (
  <g>
    <rect x={-45} y={-110} width={90} height={220} rx={16} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
    <rect x={-35} y={-95} width={70} height={178} rx={8} fill="#ece5dd" stroke={C.ink} strokeWidth={3} />
    <line x1={-20} y1={-102} x2={20} y2={-102} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <circle cx={0} cy={96} r={8} fill="#3a3a3f" stroke={C.ink} strokeWidth={2} />
  </g>
);
