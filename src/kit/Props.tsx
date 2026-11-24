import React from "react";
import { C, FONT } from "./style";

/**
 * Properti genggam / set latar untuk cerita pindah kota (EP13) dan seterusnya.
 *
 * - Suitcase / DuffelBag: digambar DI TANGAN — pakai sebagai holdF/holdB
 *   pada <Stick>. Titik (0,0) = genggaman tangan. Contoh:
 *     <Stick ... pose={CARRY} holdF={<Suitcase />} />
 * - CardboardBox: digambar DI LANTAI — bungkus dengan <g transform> di
 *   koordinat scene. Titik (0,0) = tengah bawah kardus (menyentuh lantai).
 *   Contoh: <g transform="translate(700,1400)"><CardboardBox /></g>
 */

/** Koper beroda (gagang teleskopik). Gagang ~110px supaya roda menyentuh lantai saat pose CARRY. */
export const Suitcase: React.FC<{ color?: string }> = ({ color = "#7a2e2a" }) => (
  <g>
    {/* gagang teleskopik */}
    <line x1={-14} y1={0} x2={-14} y2={108} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <line x1={14} y1={0} x2={14} y2={108} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    <line x1={-14} y1={6} x2={14} y2={6} stroke={C.ink} strokeWidth={7} />
    {/* badan koper */}
    <rect x={-72} y={104} width={144} height={118} rx={10} fill={color} stroke={C.ink} strokeWidth={6} />
    <line x1={-72} y1={163} x2={72} y2={163} stroke="#00000055" strokeWidth={10} />
    <line x1={-72} y1={163} x2={72} y2={163} stroke={C.ink} strokeWidth={3} />
    {/* pegangan samping + label */}
    <rect x={-16} y={120} width={32} height={10} rx={5} fill={C.ink} />
    <rect x={-28} y={186} width={56} height={22} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={202} fontFamily={FONT.mono} fontWeight={800} fontSize={13} fill={C.ink} textAnchor="middle">KOTA</text>
    {/* roda */}
    <circle cx={-48} cy={230} r={12} fill={C.ink} />
    <circle cx={48} cy={230} r={12} fill={C.ink} />
  </g>
);

/** Tas jinjing / duffel bag — menggantung di tangan. */
export const DuffelBag: React.FC<{ color?: string }> = ({ color = "#284966" }) => (
  <g>
    {/* tali jinjing */}
    <path d="M-28,0 Q-30,34 0,40 Q30,34 28,0" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    {/* badan tas */}
    <rect x={-78} y={38} width={156} height={96} rx={28} fill={color} stroke={C.ink} strokeWidth={6} />
    <line x1={-78} y1={86} x2={78} y2={86} stroke="#00000055" strokeWidth={8} />
    {/* saku samping + tali bahu */}
    <rect x={-62} y={96} width={44} height={30} rx={6} fill="#00000033" stroke={C.ink} strokeWidth={3} />
    <path d="M-70,44 L70,128" stroke={C.ink} strokeWidth={5} opacity={0.55} />
  </g>
);

/** Kardus terbuka untuk adegan mengepak. `label` = tulisan di sisi kardus. */
export const CardboardBox: React.FC<{ label?: string; scale?: number }> = ({ label = "BARANG", scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    {/* tutup kardus terbuka ke kiri-kanan */}
    <path d="M-110,-150 L-168,-196 L-168,-150 L-110,-118Z" fill="#b3945e" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M110,-150 L168,-196 L168,-150 L110,-118Z" fill="#b3945e" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    {/* isi kardus (gelap) + badan */}
    <rect x={-110} y={-150} width={220} height={26} fill="#6b5233" stroke={C.ink} strokeWidth={5} />
    <rect x={-110} y={-124} width={220} height={124} fill="#c9a86a" stroke={C.ink} strokeWidth={6} />
    {/* lakban tengah + label */}
    <line x1={0} y1={-124} x2={0} y2={0} stroke="#8a6d3b" strokeWidth={10} />
    <rect x={-52} y={-96} width={104} height={34} rx={4} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-71} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle">{label}</text>
    {/* lipatan sudut */}
    <line x1={-110} y1={-40} x2={110} y2={-40} stroke="#8a6d3b" strokeWidth={3} opacity={0.6} />
  </g>
);
