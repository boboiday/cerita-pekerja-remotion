import React from "react";
import { C, FONT } from "./style";

/**
 * Latar reusable kit Cerita Pekerja — komponen <g> SVG dalam ruang
 * 1080x1920, lantai default y=1400 (sama seperti EP12).
 *
 * Standar ilustrasi (sama seperti aturan Cerita Pekerja): DETAIL, bukan
 * bentuk geometris simetris polos — jendela menyala acak, kertas berserakan,
 * poster miring, tanaman, kabel. Setiap latar sengaja ASIMETRIS.
 *
 * Pakai di dalam <Canvas>/<svg> shot, SEBELUM <Stick>:
 *   <Canvas bg="#e8e0c8"><OfficeBg /><Stick ... /></Canvas>
 * Warna dinding/langit diatur lewat `bg` Canvas; komponen ini hanya
 * menggambar isi (lantai ikut digambar di tiap latar).
 */

const FLOOR_DEF = 1400;

/** Grid jendela gedung: sebagian menyala (pola deterministik, bukan acak). */
const Windows: React.FC<{ x: number; y: number; cols: number; rows: number; w?: number; h?: number; gx?: number; gy?: number }> = ({
  x, y, cols, rows, w = 22, h = 30, gx = 34, gy = 44,
}) => (
  <g>
    {Array.from({ length: rows }).map((_, j) =>
      Array.from({ length: cols }).map((_, i) => (
        <rect
          key={`${i}-${j}`}
          x={x + i * gx}
          y={y + j * gy}
          width={w}
          height={h}
          fill={(i * 7 + j * 11) % 4 === 0 ? "#ffc338" : "#1d1d1f"}
          stroke={C.ink}
          strokeWidth={2}
        />
      )),
    )}
  </g>
);

/** Kantor: jendela + kerai, jam dinding, whiteboard, 2 meja, lemari arsip, tanaman. */
export const OfficeBg: React.FC<{ floor?: number; night?: boolean }> = ({ floor = FLOOR_DEF, night = false }) => (
  <g>
    {/* lantai + lis dinding */}
    <rect x={0} y={floor} width={1080} height={1920 - floor} fill="#7a7568" />
    <rect x={0} y={floor} width={1080} height={14} fill="#5c564a" />
    {/* lampu plafon + AC */}
    <rect x={120} y={70} width={300} height={44} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <rect x={660} y={70} width={300} height={44} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <rect x={400} y={150} width={280} height={72} rx={10} fill="#d8d5c8" stroke={C.ink} strokeWidth={5} />
    <line x1={430} y1={186} x2={650} y2={186} stroke="#8a877f" strokeWidth={4} />
    <line x1={430} y1={202} x2={650} y2={202} stroke="#8a877f" strokeWidth={4} />
    <circle cx={656} cy={168} r={6} fill={night ? "#3ecf6e" : "#8a877f"} />
    {/* jendela kiri + kerai (satu bilah miring) */}
    <rect x={70} y={300} width={400} height={600} fill={night ? "#1e2436" : "#bfe3f2"} stroke={C.ink} strokeWidth={7} />
    <line x1={270} y1={300} x2={270} y2={900} stroke={C.ink} strokeWidth={5} />
    <line x1={70} y1={600} x2={470} y2={600} stroke={C.ink} strokeWidth={5} />
    {!night ? <circle cx={400} cy={380} r={44} fill="#ffe9a8" stroke={C.ink} strokeWidth={4} /> : <circle cx={400} cy={380} r={36} fill="#f5f2e8" stroke={C.ink} strokeWidth={4} />}
    <rect x={110} y={720} width={120} height={180} fill="#8a877f" stroke={C.ink} strokeWidth={4} />
    <rect x={300} y={780} width={90} height={120} fill="#6b675f" stroke={C.ink} strokeWidth={4} />
    {[330, 380, 430, 480].map((y, i) => (
      <rect key={y} x={70} y={y} width={400} height={26} fill="#e8e0c8" stroke={C.ink} strokeWidth={4} transform={i === 2 ? "rotate(4 270 443)" : undefined} />
    ))}
    {/* jam dinding 10:08 */}
    <g>
      <circle cx={880} cy={420} r={55} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1={880 + Math.sin((a * Math.PI) / 180) * 44} y1={420 - Math.cos((a * Math.PI) / 180) * 44} x2={880 + Math.sin((a * Math.PI) / 180) * 50} y2={420 - Math.cos((a * Math.PI) / 180) * 50} stroke={C.ink} strokeWidth={4} />
      ))}
      <line x1={880} y1={420} x2={858} y2={388} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={880} y1={420} x2={912} y2={436} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <circle cx={880} cy={420} r={6} fill={C.ink} />
    </g>
    {/* whiteboard + coretan + spidol */}
    <rect x={640} y={500} width={370} height={320} fill="#fdf8ea" stroke={C.ink} strokeWidth={6} />
    <path d="M670,560 q60,18 120,4 q50,-10 90,8" fill="none" stroke="#28518b" strokeWidth={4} />
    <path d="M670,630 q70,-14 140,6 q40,10 80,-4" fill="none" stroke={C.ink} strokeWidth={4} />
    <path d="M670,700 q80,10 170,-6" fill="none" stroke="#c0241c" strokeWidth={5} />
    <rect x={640} y={820} width={370} height={16} fill="#b9b6ae" stroke={C.ink} strokeWidth={4} />
    <rect x={700} y={806} width={70} height={14} rx={7} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
    <rect x={800} y={806} width={70} height={14} rx={7} fill="#28518b" stroke={C.ink} strokeWidth={3} />
    {/* lemari arsip */}
    <rect x={60} y={950} width={170} height={450} fill="#8f969b" stroke={C.ink} strokeWidth={6} />
    {[980, 1100, 1220].map((y) => (
      <g key={y}>
        <rect x={76} y={y} width={138} height={100} fill="none" stroke={C.ink} strokeWidth={4} />
        <rect x={110} y={y + 42} width={70} height={12} rx={6} fill={C.ink} />
        <rect x={86} y={y + 12} width={34} height={18} fill="#fdf8ea" stroke={C.ink} strokeWidth={2} />
      </g>
    ))}
    {/* meja jauh + monitor + tanaman kecil */}
    <rect x={640} y={1080} width={370} height={22} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={660} y={1102} width={330} height={298} fill="#5c4033" />
    <rect x={700} y={980} width={150} height={100} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
    <rect x={716} y={994} width={118} height={72} fill="#7fb3d5" />
    <rect x={940} y={1020} width={56} height={60} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
    <path d="M968,1020 q-14,-34 4,-52 q20,10 12,52" fill="#3f7a4a" stroke={C.ink} strokeWidth={3} />
    {/* poster target di atas meja jauh */}
    <rect x={700} y={880} width={180} height={120} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} transform="rotate(-2 790 940)" />
    <text x={790} y={920} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill={C.ink} textAnchor="middle" transform="rotate(-2 790 940)">TARGET</text>
    <path d="M730,980 L770,950 L810,965 L860,920" fill="none" stroke="#c0241c" strokeWidth={5} transform="rotate(-2 790 940)" />
    {/* meja dekat + monitor grafik + mug + tumpukan kertas + kabel */}
    <rect x={80} y={1160} width={480} height={22} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={100} y={1182} width={440} height={218} fill="#5c4033" />
    <rect x={140} y={1040} width={190} height={120} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
    <rect x={156} y={1054} width={158} height={92} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} />
    <rect x={172} y={1116} width={22} height={30} fill="#28518b" />
    <rect x={202} y={1096} width={22} height={50} fill="#3f7a4a" />
    <rect x={232} y={1076} width={22} height={70} fill="#c0241c" />
    <rect x={360} y={1100} width={120} height={60} fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
    <rect x={400} y={1080} width={46} height={22} fill="#c0241c" stroke={C.ink} strokeWidth={4} />
    <rect x={420} y={1120} width={90} height={12} fill="#fdf8ea" stroke={C.ink} strokeWidth={3} transform="rotate(-4 465 1126)" />
    <rect x={424} y={1132} width={90} height={12} fill="#e8e0c8" stroke={C.ink} strokeWidth={3} transform="rotate(3 469 1138)" />
    <path d="M330,1160 q40,60 -10,120 q-30,40 20,120" fill="none" stroke={C.ink} strokeWidth={4} />
    {/* kursi putar */}
    <rect x={300} y={1180} width={130} height={90} rx={14} fill="#284966" stroke={C.ink} strokeWidth={5} />
    <rect x={290} y={1270} width={150} height={26} fill="#284966" stroke={C.ink} strokeWidth={5} />
    <rect x={356} y={1296} width={18} height={104} fill={C.ink} />
    <line x1={290} y1={1400} x2={440} y2={1400} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
    {/* tanaman sudut */}
    <path d="M1010,1400 L1000,1300 L1060,1300 L1050,1400Z" fill="#b3352b" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={1010} cy={1240} rx={26} ry={70} fill="#3f7a4a" stroke={C.ink} strokeWidth={4} transform="rotate(-18 1010 1240)" />
    <ellipse cx={1050} cy={1230} rx={26} ry={76} fill="#4a8a58" stroke={C.ink} strokeWidth={4} transform="rotate(14 1050 1230)" />
    <ellipse cx={1030} cy={1210} rx={24} ry={64} fill="#3f7a4a" stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Interior rumah: jendela + gorden, foto dinding, sofa, meja kopi, karpet, lampu, pintu. */
export const HomeInteriorBg: React.FC<{ floor?: number; night?: boolean }> = ({ floor = FLOOR_DEF, night = false }) => (
  <g>
    <rect x={0} y={floor} width={1080} height={1920 - floor} fill="#9a7d5c" />
    <rect x={0} y={floor} width={1080} height={14} fill="#6b5233" />
    {/* lampu gantung */}
    <line x1={540} y1={0} x2={540} y2={130} stroke={C.ink} strokeWidth={6} />
    <path d="M540,130 L470,210 L610,210Z" fill="#e2a748" stroke={C.ink} strokeWidth={5} />
    <circle cx={540} cy={222} r={20} fill="#ffe9a8" opacity={night ? 0.95 : 0.6} />
    {/* jendela + gorden (kanan diikat) */}
    <rect x={90} y={320} width={390} height={540} fill={night ? "#1e2436" : "#bfe3f2"} stroke={C.ink} strokeWidth={7} />
    <line x1={285} y1={320} x2={285} y2={860} stroke={C.ink} strokeWidth={5} />
    <line x1={90} y1={590} x2={480} y2={590} stroke={C.ink} strokeWidth={5} />
    {!night ? <circle cx={400} cy={400} r={40} fill="#ffe9a8" stroke={C.ink} strokeWidth={4} /> : <circle cx={400} cy={400} r={32} fill="#f5f2e8" stroke={C.ink} strokeWidth={4} />}
    <circle cx={180} cy={430} r={26} fill="#f5f2e8" />
    <circle cx={230} cy={450} r={20} fill="#f5f2e8" />
    <path d="M90,320 q-30,270 0,540 L150,860 q-20,-270 0,-540Z" fill="#8a5bb5" stroke={C.ink} strokeWidth={5} />
    <path d="M480,320 q30,270 0,540 L420,860 q20,-270 0,-540Z" fill="#8a5bb5" stroke={C.ink} strokeWidth={5} />
    <rect x={420} y={580} width={60} height={16} rx={8} fill="#c0241c" transform="rotate(8 450 588)" />
    {/* ambang jendela + pot kecil */}
    <rect x={70} y={860} width={430} height={20} fill="#6b4a38" stroke={C.ink} strokeWidth={4} />
    <rect x={330} y={820} width={50} height={40} fill="#b3352b" stroke={C.ink} strokeWidth={4} />
    <circle cx={355} cy={800} r={22} fill="#3f7a4a" stroke={C.ink} strokeWidth={3} />
    {/* foto dinding (3 ukuran, satu miring) */}
    <g>
      <rect x={560} y={340} width={150} height={110} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
      <path d="M575,430 L620,380 L660,420 L690,390 L695,430Z" fill="#5d93c9" stroke={C.ink} strokeWidth={3} />
      <rect x={740} y={330} width={110} height={140} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} transform="rotate(-3 795 400)" />
      <circle cx={795} cy={380} r={18} fill="#e2a748" stroke={C.ink} strokeWidth={3} transform="rotate(-3 795 400)" />
      <path d="M760,450 q35,-40 70,0" fill="none" stroke={C.ink} strokeWidth={4} transform="rotate(-3 795 400)" />
      <rect x={880} y={350} width={180} height={120} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
      <rect x={910} y={400} width={60} height={50} fill="#b3352b" stroke={C.ink} strokeWidth={3} />
      <path d="M900,450 L940,410 L985,450Z" fill="#3f7a4a" stroke={C.ink} strokeWidth={3} />
    </g>
    {/* jam dinding kecil */}
    <circle cx={600} cy={580} r={40} fill="#fdf8ea" stroke={C.ink} strokeWidth={5} />
    <line x1={600} y1={580} x2={588} y2={556} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <line x1={600} y1={580} x2={622} y2={590} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    {/* pintu kanan (sedikit terbuka, celah cahaya) */}
    <rect x={900} y={700} width={180} height={700} fill="#8a5a34" stroke={C.ink} strokeWidth={6} />
    <rect x={900} y={700} width={26} height={700} fill="#ffe9a8" />
    <circle cx={1040} cy={1060} r={10} fill="#c9a24a" stroke={C.ink} strokeWidth={3} />
    {/* sofa + selimut + bantal */}
    <rect x={80} y={1060} width={640} height={180} rx={18} fill="#284966" stroke={C.ink} strokeWidth={6} />
    <rect x={80} y={1240} width={640} height={160} fill="#284966" stroke={C.ink} strokeWidth={6} />
    <rect x={110} y={1130} width={280} height={110} rx={12} fill="#3a5a78" stroke={C.ink} strokeWidth={4} />
    <rect x={410} y={1130} width={280} height={110} rx={12} fill="#33526e" stroke={C.ink} strokeWidth={4} />
    <path d="M80,1060 q-10,120 30,180 L180,1240 q-20,-90 -10,-180Z" fill="#c0241c" stroke={C.ink} strokeWidth={4} />
    <circle cx={620} cy={1170} r={52} fill="#e2a748" stroke={C.ink} strokeWidth={5} />
    {/* meja kopi + buku + mug */}
    <rect x={560} y={1240} width={420} height={20} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
    <rect x={590} y={1260} width={20} height={140} fill={C.ink} />
    <rect x={930} y={1260} width={20} height={140} fill={C.ink} />
    <rect x={620} y={1196} width={130} height={18} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
    <rect x={630} y={1178} width={110} height={18} fill="#28518b" stroke={C.ink} strokeWidth={3} />
    <rect x={640} y={1160} width={90} height={18} fill="#3f7a4a" stroke={C.ink} strokeWidth={3} transform="rotate(-6 685 1169)" />
    <rect x={830} y={1200} width={40} height={40} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    {/* karpet */}
    <rect x={150} y={1520} width={780} height={240} rx={20} fill="#b3352b" stroke={C.ink} strokeWidth={5} />
    <rect x={180} y={1550} width={720} height={180} rx={12} fill="none" stroke="#fdf8ea" strokeWidth={4} strokeDasharray="18 14" />
    {[300, 480, 660, 840].map((x) => (
      <rect key={x} x={x - 18} y={1618} width={36} height={36} fill="#e2a748" stroke={C.ink} strokeWidth={3} transform={`rotate(45 ${x} 1636)`} />
    ))}
    {/* lampu lantai (di kiri pintu supaya kap tidak menabrak pintu) */}
    <rect x={805} y={1380} width={70} height={20} fill={C.ink} />
    <rect x={833} y={900} width={14} height={480} fill={C.ink} />
    <path d="M840,900 L785,810 L895,810Z" fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
    <circle cx={840} cy={890} r={18} fill="#ffe9a8" opacity={0.7} />
  </g>
);

/** Stasiun / peron kereta: kereta di latar, papan jadwal, bangku, papan nama, tiang. */
export const StationBg: React.FC<{ floor?: number; train?: boolean }> = ({ floor = FLOOR_DEF, train = true }) => (
  <g>
    {/* langit-langit + balok */}
    <rect x={0} y={60} width={1080} height={26} fill="#5c564a" />
    <rect x={0} y={140} width={1080} height={18} fill="#6b675f" />
    {/* lampu gantung */}
    {[250, 830].map((x) => (
      <g key={x}>
        <line x1={x} y1={0} x2={x} y2={180} stroke={C.ink} strokeWidth={5} />
        <path d={`M${x},180 L${x - 42},250 L${x + 42},250Z`} fill="#e2a748" stroke={C.ink} strokeWidth={5} />
        <circle cx={x} cy={262} r={16} fill="#ffe9a8" opacity={0.85} />
      </g>
    ))}
    {/* kereta di latar */}
    {train ? (
      <g>
        <rect x={0} y={540} width={1080} height={40} fill="#1d1d1f" />
        <rect x={120} y={500} width={150} height={40} fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
        <rect x={800} y={500} width={150} height={40} fill="#3a3a3f" stroke={C.ink} strokeWidth={4} />
        <rect x={0} y={580} width={1080} height={480} fill="#2f6db3" stroke={C.ink} strokeWidth={7} />
        <rect x={0} y={700} width={1080} height={46} fill="#f5f2e8" />
        <line x1={0} y1={746} x2={1080} y2={746} stroke={C.ink} strokeWidth={4} />
        {/* jendela: satu menyala, satu ada penumpang, satu setengah terbuka */}
        <rect x={40} y={620} width={110} height={80} fill="#ffe9a8" stroke={C.ink} strokeWidth={4} />
        <rect x={180} y={620} width={110} height={80} fill="#bfe3f2" stroke={C.ink} strokeWidth={4} />
        <circle cx={235} cy={672} r={20} fill={C.ink} />
        <path d="M205,700 q30,-28 60,0Z" fill={C.ink} />
        <rect x={460} y={620} width={110} height={80} fill="#7a9cc2" stroke={C.ink} strokeWidth={4} />
        <line x1={515} y1={620} x2={515} y2={700} stroke={C.ink} strokeWidth={4} />
        <rect x={880} y={620} width={110} height={80} fill="#bfe3f2" stroke={C.ink} strokeWidth={4} />
        {/* pintu ganda */}
        {[300, 700].map((x) => (
          <g key={x}>
            <rect x={x} y={620} width={120} height={440} fill="#28518b" stroke={C.ink} strokeWidth={5} />
            <line x1={x + 60} y1={620} x2={x + 60} y2={1060} stroke={C.ink} strokeWidth={4} />
            <rect x={x + 10} y={640} width={40} height={60} fill="#bfe3f2" stroke={C.ink} strokeWidth={3} />
            <rect x={x + 70} y={640} width={40} height={60} fill="#bfe3f2" stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* bogie + roda */}
        <rect x={60} y={1060} width={300} height={46} fill="#1d1d1f" />
        <rect x={720} y={1060} width={300} height={46} fill="#1d1d1f" />
        {[120, 300, 780, 960].map((x) => (
          <circle key={x} cx={x} cy={1106} r={26} fill="#3a3a3f" stroke={C.ink} strokeWidth={5} />
        ))}
      </g>
    ) : null}
    {/* tiang + poster */}
    {[110, 920].map((x) => (
      <rect key={x} x={x} y={180} width={60} height={1220} fill="#8a877f" stroke={C.ink} strokeWidth={6} />
    ))}
    <rect x={96} y={420} width={88} height={120} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} transform="rotate(-2 140 480)" />
    <text x={140} y={452} fontFamily={FONT.mono} fontWeight={800} fontSize={20} fill={C.ink} textAnchor="middle" transform="rotate(-2 140 480)">JADWAL</text>
    <line x1={112} y1={474} x2={168} y2={474} stroke={C.ink} strokeWidth={3} transform="rotate(-2 140 480)" />
    <line x1={112} y1={492} x2={168} y2={492} stroke={C.ink} strokeWidth={3} transform="rotate(-2 140 480)" />
    <line x1={112} y1={510} x2={150} y2={510} stroke="#c0241c" strokeWidth={3} transform="rotate(-2 140 480)" />
    <rect x={906} y={260} width={88} height={120} fill="#c0241c" stroke={C.ink} strokeWidth={4} transform="rotate(2 950 320)" />
    <text x={950} y={318} fontFamily={FONT.mono} fontWeight={800} fontSize={24} fill="white" textAnchor="middle" transform="rotate(2 950 320)">KOPI</text>
    <text x={950} y={348} fontFamily={FONT.mono} fontWeight={800} fontSize={16} fill="white" textAnchor="middle" transform="rotate(2 950 320)">PANAS</text>
    {/* papan nama stasiun gantung */}
    <line x1={420} y1={86} x2={420} y2={240} stroke={C.ink} strokeWidth={5} />
    <line x1={660} y1={86} x2={660} y2={240} stroke={C.ink} strokeWidth={5} />
    <rect x={380} y={240} width={320} height={90} rx={8} fill="#1d1d1f" stroke={C.ink} strokeWidth={5} />
    <text x={540} y={298} fontFamily={FONT.mono} fontWeight={800} fontSize={34} fill="white" textAnchor="middle">STASIUN KOTA</text>
    {/* papan jadwal besar */}
    <rect x={700} y={480} width={310} height={340} fill="#1d1d1f" stroke={C.ink} strokeWidth={6} />
    <text x={855} y={530} fontFamily={FONT.mono} fontWeight={800} fontSize={26} fill="#c0241c" textAnchor="middle">JADWAL KERETA</text>
    {[560, 606, 652, 698, 744].map((y, i) => (
      <line key={y} x1={726} y1={y} x2={i === 2 ? 920 : 984} y2={y} stroke={i === 2 ? "#c0241c" : "#f5f2e8"} strokeWidth={5} />
    ))}
    <circle cx={968} cy={560} r={16} fill="#ffe9a8" stroke={C.ink} strokeWidth={3} />
    {/* bangku peron (dudukan y=1230 = lantai − 170, cocok untuk pose SIT) */}
    <g>
      <rect x={380} y={1120} width={380} height={18} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
      <rect x={380} y={1150} width={380} height={18} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
      <rect x={380} y={1180} width={380} height={18} fill="#6b4a38" stroke={C.ink} strokeWidth={5} />
      <rect x={380} y={1230} width={380} height={22} fill="#8a5a34" stroke={C.ink} strokeWidth={5} />
      <rect x={396} y={1120} width={14} height={132} fill={C.ink} />
      <rect x={730} y={1120} width={14} height={132} fill={C.ink} />
      <rect x={396} y={1252} width={16} height={148} fill={C.ink} />
      <rect x={730} y={1252} width={16} height={148} fill={C.ink} />
      <rect x={380} y={1180} width={380} height={14} fill="#6b4a38" stroke={C.ink} strokeWidth={4} />
    </g>
    {/* lantai peron + jalur taktil + garis aman + tulisan */}
    <rect x={0} y={floor} width={1080} height={1920 - floor} fill="#b9b6ae" />
    <rect x={0} y={floor} width={1080} height={14} fill="#8a877f" />
    <rect x={0} y={floor + 20} width={1080} height={32} fill="#e2a748" />
    {Array.from({ length: 30 }).map((_, i) => (
      <circle key={i} cx={18 + i * 36} cy={floor + 36} r={6} fill="#8a6d3b" />
    ))}
    <rect x={0} y={floor + 100} width={1080} height={10} fill="#fdf8ea" />
    <text x={540} y={floor + 220} fontFamily={FONT.mono} fontWeight={800} fontSize={44} fill="#6b675f" textAnchor="middle">PERON 2</text>
  </g>
);

/** Lapis jauh skyline: siluet gedung, antena, kubah — untuk parallax (speed kecil).
 *  Sengaja digambar LEBIH LEBAR dari 1080px (sampai x=1280) supaya saat
 *  lapis bergeser ke kiri (parallax), sisi kanan frame tidak kosong. */
export const SkylineFar: React.FC<{ floor?: number }> = ({ floor = FLOOR_DEF }) => (
  <g>
    <rect x={0} y={900} width={180} height={floor - 900} fill="#5d6280" stroke={C.ink} strokeWidth={4} />
    <rect x={170} y={760} width={200} height={floor - 760} fill="#545872" stroke={C.ink} strokeWidth={4} />
    <rect x={360} y={980} width={150} height={floor - 980} fill="#5d6280" stroke={C.ink} strokeWidth={4} />
    <rect x={500} y={700} width={220} height={floor - 700} fill="#4e5270" stroke={C.ink} strokeWidth={4} />
    <line x1={610} y1={700} x2={610} y2={600} stroke={C.ink} strokeWidth={6} />
    <circle cx={610} cy={592} r={10} fill="#c0241c" />
    <rect x={710} y={880} width={170} height={floor - 880} fill="#5d6280" stroke={C.ink} strokeWidth={4} />
    <rect x={870} y={780} width={210} height={floor - 780} fill="#545872" stroke={C.ink} strokeWidth={4} />
    <path d="M870,780 a105,70 0 0 1 210,0Z" fill="#545872" stroke={C.ink} strokeWidth={4} />
    <rect x={1080} y={840} width={200} height={floor - 840} fill="#5d6280" stroke={C.ink} strokeWidth={4} />
    <circle cx={250} cy={820} r={7} fill="#ffc338" />
    <circle cx={560} cy={780} r={7} fill="#ffc338" />
    <circle cx={940} cy={860} r={7} fill="#ffc338" />
    <circle cx={90} cy={980} r={7} fill="#ffc338" />
    <circle cx={1150} cy={920} r={7} fill="#ffc338" />
  </g>
);

/** Lapis dekat skyline: gedung detail + jendela menyala, menara air, crane, billboard.
 *  Sengaja digambar LEBIH LEBAR dari 1080px (sampai x=1420) — lihat SkylineFar. */
export const SkylineNear: React.FC<{ floor?: number }> = ({ floor = FLOOR_DEF }) => (
  <g>
    <rect x={60} y={1020} width={220} height={floor - 1020} fill="#2c3048" stroke={C.ink} strokeWidth={5} />
    <Windows x={84} y={1050} cols={5} rows={7} />
    <rect x={300} y={900} width={260} height={floor - 900} fill="#333752" stroke={C.ink} strokeWidth={5} />
    <Windows x={326} y={930} cols={6} rows={10} />
    {/* crane di atap gedung tengah */}
    <rect x={420} y={800} width={16} height={100} fill="#e2a748" stroke={C.ink} strokeWidth={4} />
    <rect x={340} y={800} width={260} height={14} fill="#e2a748" stroke={C.ink} strokeWidth={4} />
    <line x1={580} y1={814} x2={580} y2={880} stroke={C.ink} strokeWidth={4} />
    <rect x={566} y={880} width={28} height={22} fill="#c0241c" stroke={C.ink} strokeWidth={3} />
    <rect x={580} y={1060} width={180} height={floor - 1060} fill="#2c3048" stroke={C.ink} strokeWidth={5} />
    <Windows x={604} y={1090} cols={4} rows={6} />
    {/* billboard */}
    <rect x={600} y={1000} width={140} height={60} fill="#fdf8ea" stroke={C.ink} strokeWidth={4} />
    <text x={670} y={1040} fontFamily={FONT.mono} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">KOTA</text>
    <rect x={780} y={860} width={240} height={floor - 860} fill="#333752" stroke={C.ink} strokeWidth={5} />
    <Windows x={806} y={890} cols={5} rows={11} />
    {/* menara air */}
    <line x1={820} y1={860} x2={800} y2={780} stroke={C.ink} strokeWidth={5} />
    <line x1={980} y1={860} x2={1000} y2={780} stroke={C.ink} strokeWidth={5} />
    <ellipse cx={900} cy={760} rx={90} ry={34} fill="#8f969b" stroke={C.ink} strokeWidth={5} />
    <rect x={810} y={726} width={180} height={40} fill="#8f969b" stroke={C.ink} strokeWidth={5} />
    {/* gedung ekstra di kanan (cadangan parallax) */}
    <rect x={1020} y={980} width={220} height={floor - 980} fill="#2c3048" stroke={C.ink} strokeWidth={5} />
    <Windows x={1044} y={1010} cols={5} rows={8} />
    <rect x={1240} y={1020} width={180} height={floor - 1020} fill="#333752" stroke={C.ink} strokeWidth={5} />
    <Windows x={1264} y={1050} cols={4} rows={7} />
  </g>
);

/** Skyline kota lengkap (jauh + dekat + jalan). `variant`: day | dusk | night. */
export const CitySkylineBg: React.FC<{ floor?: number; variant?: "day" | "dusk" | "night" }> = ({ floor = FLOOR_DEF, variant = "dusk" }) => (
  <g>
    {/* langit: matahari / bulan + awan + burung */}
    {variant === "night" ? (
      <>
        <circle cx={880} cy={300} r={56} fill="#f5f2e8" stroke={C.ink} strokeWidth={4} />
        <circle cx={862} cy={286} r={12} fill="#cfcab3" />
        <circle cx={896} cy={318} r={8} fill="#cfcab3" />
        {[[200, 220], [420, 160], [640, 260], [120, 380], [980, 180]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="#f5f2e8" />
        ))}
      </>
    ) : (
      <>
        <circle cx={880} cy={variant === "dusk" ? 430 : 280} r={variant === "dusk" ? 74 : 60} fill={variant === "dusk" ? "#e2a748" : "#ffe9a8"} stroke={C.ink} strokeWidth={4} />
        <g fill="#f5f2e8" opacity={0.9}>
          <circle cx={200} cy={260} r={34} />
          <circle cx={244} cy={244} r={26} />
          <circle cx={158} cy={250} r={22} />
          <circle cx={640} cy={180} r={28} />
          <circle cx={676} cy={168} r={20} />
        </g>
        <path d="M300,420 q14,-14 28,0 q14,-14 28,0" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M520,360 q12,-12 24,0 q12,-12 24,0" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      </>
    )}
    <SkylineFar floor={floor} />
    <SkylineNear floor={floor} />
    {/* jalan + trotoar + lampu jalan + pohon */}
    <rect x={0} y={floor} width={1080} height={1920 - floor} fill="#3a3a3f" />
    <rect x={0} y={floor} width={1080} height={16} fill="#5c564a" />
    <rect x={0} y={floor + 60} width={1080} height={10} fill="#e2a748" strokeDasharray="40 30" />
    {[140, 940].map((x) => (
      <g key={x}>
        <rect x={x} y={floor - 320} width={14} height={320} fill={C.ink} />
        <circle cx={x + 7} cy={floor - 336} r={26} fill="#ffe9a8" stroke={C.ink} strokeWidth={5} />
      </g>
    ))}
    {[60, 1020].map((x) => (
      <g key={x}>
        <rect x={x + 8} y={floor - 120} width={16} height={120} fill="#6b4a38" stroke={C.ink} strokeWidth={4} />
        <circle cx={x + 16} cy={floor - 160} r={52} fill="#3f7a4a" stroke={C.ink} strokeWidth={4} />
        <circle cx={x - 16} cy={floor - 130} r={36} fill="#4a8a58" stroke={C.ink} strokeWidth={4} />
        <circle cx={x + 48} cy={floor - 130} r={36} fill="#3f7a4a" stroke={C.ink} strokeWidth={4} />
      </g>
    ))}
  </g>
);
