# Kit Cerita Pekerja (Remotion)

Komponen reusable untuk semua episode. Episode baru tinggal merangkai
komponen kit — jangan menulis ulang gerakan kamera, ekspresi, atau latar
sebagai one-off di file episode (pelajaran dari EP12, yang gerakan
kameranya masih one-off per shot).

## Kamera — `kit/Camera.tsx`

```tsx
import { Camera, Parallax, ParallaxLayer } from "../../kit/Camera";

// Push-in ke wajah (default: skala +0.06)
<Camera dur={dur} move="push-in" origin="50% 55%">...</Camera>
// Menjauh di akhir shot
<Camera dur={dur} move="pull-out" amount={0.05}>...</Camera>
// Mengikuti karakter ke kanan (isi frame bergeser ke kiri, default 120px)
<Camera dur={dur} move="tracking-right" amount={120}>...</Camera>
// Tanpa gerakan / pan-up / pan-down / tracking-left — lihat CameraMove.
// shake={2} = guncangan halus yang mereda (adegan tegang, seperti EP12 S03).

// Motion blur: ON otomatis untuk gerakan kamera, OFF untuk move="static".
// Shot kamera-statis yang isinya bergerak (tracking parallax) perlu blur eksplisit:
<Camera dur={dur} move="static" blur>...</Camera>
// blur={false} mematikan blur di shot bergerak (teks harus super tajam).
```

Parallax (di dalam `<svg>` shot, lapis jauh = speed kecil):

```tsx
<Parallax dur={dur}>
  <ParallaxLayer speed={120}><SkylineFar /></ParallaxLayer>
  <ParallaxLayer speed={320}><SkylineNear /></ParallaxLayer>
</Parallax>
```

Gambar tiap lapis lebih lebar dari 1080px supaya tidak ada sisi kosong
saat bergeser. `<Cam>` lama di `Overlays.tsx` tetap ada untuk
EP12/Cuti10s/Sample10s — shot baru pakai `<Camera>`.

## Ekspresi & pose — `kit/Stick.tsx`

```tsx
import { CARRY, PACK, SIT, STAND, Stick, type Mood } from "../../kit/Stick";

<Stick ... mood="sad" />        // + worried, determined, scared, shocked,
                                //   angry, resigned, hopeful, tired, relieved
<Stick ... pose={CARRY} holdF={<Suitcase />} />  // membawa koper
<Stick ... pose={PACK} />       // mengepak kardus (kardus di lantai)
<Stick ... pose={SIT} />        // duduk di bangku (dudukan ~ lantai − 170px)
```

Setiap mood dibedakan oleh DUA ciri (alis + mulut) supaya terbaca di
frame kecil. `mood` default = netral (tampilan kit lama, Sample10s/
Cuti10s tidak berubah).

## Properti — `kit/Props.tsx`

```tsx
import { CardboardBox, DuffelBag, Suitcase } from "../../kit/Props";

<Stick ... pose={CARRY} holdF={<Suitcase />} />          // di tangan
<Stick ... pose={PACK} holdB={<DuffelBag />} />          // di tangan
<g transform="translate(700,1400)"><CardboardBox label="BARANG" /></g>  // di lantai
```

## Teks kinetik — `kit/KineticText.tsx`

```tsx
import { EmphasisLine, KineticText } from "../../kit/KineticText";

// Kata pop satu-per-satu, kata aksen merah + lebih besar, lalu DIAM (tetap terbaca)
<KineticText words={["TIDAK", "WAJIB", "KERJA"]} at={48} stagger={3}
  top={420} fontSize={104} accent={["TIDAK", "WAJIB"]} />
// Satu kalimat, kata kunci kuning + garis bawah tumbuh
<EmphasisLine text="DIPINDAHKAN KE KOTA LAIN" keyword="KOTA LAIN" at={8} top={380} />
```

Aturan keterbacaan: kata yang sudah muncul tidak pernah hilang/keluar
frame; maksimal 6 kata per blok; fontSize minimal 72; stagger 2–4 frame.

## Latar — `kit/Backgrounds.tsx`

```tsx
import { CitySkylineBg, HomeInteriorBg, OfficeBg, StationBg } from "../../kit/Backgrounds";

<Canvas bg="#e8e0c8"><OfficeBg /><Stick ... /></Canvas>
<Canvas bg="#e8e0c8"><HomeInteriorBg night /></Canvas>
<Canvas bg="#e8e0c8"><StationBg /></Canvas>              // train={false} = peron tanpa kereta
<Canvas bg="#f7d9a8"><CitySkylineBg variant="dusk" /></Canvas>  // day | dusk | night
```

Semua latar adalah `<g>` SVG (lantai default y=1400, ikut digambar),
detail dan asimetris — bukan bentuk geometris simetris polos.
`SkylineFar` / `SkylineNear` diekspor terpisah untuk dipakai sebagai
lapis `<Parallax>`.

## Demo / QA kit

Komposisi `KitDemo` (10 detik, 30 fps) menguji semua fitur kit di atas:
stasiun + koper + sad, rumah + kardus + resigned→hopeful, kantor +
angry vs shocked, parallax + tracking, duduk + kinetic text.
Render via Actions (`dispatch` composition `KitDemo`) setiap kali kit
berubah, cek frame-nya sebelum episode berikutnya dibuat.
