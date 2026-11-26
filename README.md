# Cerita Pekerja — Remotion Stickman Shorts

Video stickman 9:16 untuk **@ceritapekerja_id** ("Setiap Pekerja Punya Cerita"),
dibangun dengan [Remotion](https://www.remotion.dev/) dan di-render **gratis** di
GitHub Actions — repo ini publik, jadi runner standar GitHub
(`ubuntu-latest`, 4 vCPU / 16 GB RAM) gratis dan tidak ada batas menit.

## Cara render

1. Buka tab **Actions** → workflow **Render** → **Run workflow**.
2. Isi composition id (default: `Sample10s`), klik **Run workflow**.
3. Tunggu sampai selesai, lalu download MP4 dari **Artifacts → video**
   (tersimpan 7 hari).

Push ke `main` yang mengubah `src/` juga otomatis me-render `Sample10s`.

## Cara stills (storyboard + cover, satu panggilan)

1. Buka tab **Actions** → workflow **Stills** → **Run workflow**.
2. Isi composition id (default: `EP19Test`), klik **Run workflow**.
3. Download dari **Artifacts → stills**: `storyboard.png` (1 halaman,
   8 panel + label) dan `cover.jpg` (frame cover + band hook + pill
   pasal + handle), plus frame tiap shot di `frames/`.

Lokal: `npm run stills -- <compositionId>` (butuh Chrome +
Pillow). Frame + label tiap komposisi tinggal di `scripts/stills.json`.

## Motion blur

Shot yang bergerak otomatis halus (`@remotion/motion-blur`,
shutter 180°, 8 sampel): `<Camera>` menyalakan blur untuk semua
gerakan kamera (push-in, pull-out, tracking, pan) dan mematikannya
untuk shot statis (kartu hukum, end card) supaya teks tetap tajam.
Shot kamera-statis yang isinya bergerak (mis. tracking parallax)
diberi `blur` eksplisit. Caption di luar `<Camera>` tidak kena blur.

## Komposisi

| ID | Durasi | Isi |
| --- | --- | --- |
| `Sample10s` | 10 detik | Raka lembur tak dibayar — 3 shot: kantor malam, jalan pulang, kartu Pasal 116 |
| `Cuti10s` | 10 detik | Agus cuti ditolak — demo 10 detik |
| `EP12` | 55,9 detik | Sari disuruh kerja di hari Lebaran — Pasal 125 (24 fps) |
| `EP19Test` | 56 detik | Salinan UJI EP19 (bukti upgrade kit) — bukan episode tayang |
| `KitDemo` | 10 detik | QA kit: stasiun + koper, rumah + kardus, kantor, parallax, kinetic text |

Tambah episode baru di `src/stories/cerita-pekerja/`, daftarkan di `src/Root.tsx`.

## Kit (`src/kit/`)

Komponen reusable semua episode — kamera, ekspresi/pose, properti,
teks kinetik, latar. Cara pakai: `src/kit/README.md`.
Jangan menulis ulang gerakan kamera / ekspresi / latar sebagai one-off
di file episode.

## Tidak ada secret

Pipeline ini tidak butuh API key, token, atau kredensial apa pun —
hanya Node + headless Chrome + repo ini. Jangan commit secret apa pun ke sini.

## Kredit

Kit stickman (rig SVG, kamera, caption) diturunkan dari
[SyedBahjat/claude-stickman-shorts](https://github.com/SyedBahjat/claude-stickman-shorts)
(lisensi MIT, lihat `LICENSE`). Cerita, karakter, dan naskah di repo ini
adalah karya asli Cerita Pekerja.
