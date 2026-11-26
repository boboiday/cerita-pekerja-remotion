import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";

/**
 * Primitif gerakan kamera kit Cerita Pekerja.
 *
 * EP12 memakai gerakan kamera sebagai one-off per shot (push-in di S01,
 * tracking + parallax manual di S02). File ini menjadikannya komponen
 * reusable: komposisi episode berikutnya tinggal membungkus shot dengan
 * <Camera> / <Parallax>, tanpa menghitung ulang interpolate tiap shot.
 *
 * Aturan pakai:
 * - Bungkus SATU shot (di dalam <Sequence>) dengan <Camera dur={durShot}>.
 * - `dur` = durasi shot dalam frame (sama seperti <Cam> di Overlays).
 * - `amount`: push-in/pull-out = delta skala (default 0.06);
 *   tracking/pan = jarak geser px (default 120).
 * - <Cam> lama di Overlays.tsx tetap ada untuk EP12/Cuti10s/Sample10s;
 *   shot baru sebaiknya memakai <Camera> (nama gerakan eksplisit).
 *
 * Motion blur (Remotion 4.0.543, @remotion/motion-blur):
 * - `blur` default = ON untuk semua gerakan kamera (push-in, pull-out,
 *   tracking, pan) dan OFF untuk `move="static"` — shot statis (kartu
 *   hukum, end card) harus tetap tajam dan terbaca.
 * - Shot yang kameranya statis TAPI isinya bergerak (mis. tracking shot
 *   parallax S02 EP19: karakter jalan + latar bergeser) tetap perlu blur:
 *   beri `blur` eksplisit di shot itu.
 * - Blur membungkus SELURUH shot (termasuk gerakan kameranya sendiri),
 *   tapi TIDAK menyentuh <Captions> / <Vignette> di luar <Camera> —
 *   teks caption tetap tajam.
 * - shutterAngle 180 (= setengah frame) + samples 8 = default Remotion.
 */
export type CameraMove =
  | "push-in" // mendekat: skala 1 -> 1+amount (fokus ke wajah / emosi)
  | "pull-out" // menjauh: skala 1+amount -> 1 (membuka ruang / akhir shot)
  | "tracking-right" // kamera mengikuti ke kanan: isi frame bergeser ke kiri
  | "tracking-left" // kamera mengikuti ke kiri: isi frame bergeser ke kanan
  | "pan-up" // kamera menengadah: isi frame turun
  | "pan-down" // kamera menunduk: isi frame naik
  | "static"; // tanpa gerakan (tetap pakai wrapper supaya shot konsisten)

export const Camera: React.FC<{
  dur: number;
  move?: CameraMove;
  amount?: number;
  origin?: string; // titik tumpu zoom, "%" dari frame (default "50% 50%")
  shake?: number; // guncangan halus yang mereda (px, default 0 = stabil)
  ease?: (t: number) => number;
  /**
   * Motion blur untuk shot ini. Default: ON kalau kamera bergerak
   * (push-in / pull-out / tracking / pan), OFF kalau `move="static"`.
   * Isi `blur` eksplisit untuk shot kamera-statis yang isinya bergerak
   * (mis. parallax + karakter jalan) — atau `blur={false}` untuk
   * mematikan blur di shot bergerak (mis. teks harus super tajam).
   */
  blur?: boolean;
  children: React.ReactNode;
}> = ({ dur, move = "push-in", amount, origin = "50% 50%", shake = 0, ease, blur, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = interpolate(frame, [0, dur], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease ?? Easing.inOut(Easing.sin),
  });
  const amt = amount ?? (move === "push-in" || move === "pull-out" ? 0.06 : 120);
  // Tracking/pan menggeser isi frame: tanpa kompensasi, tepi frame yang
  // ditinggalkan akan menampilkan latar hitam. Skala dikompensasi otomatis
  // sebesar jarak geser dibagi lebar/tinggi frame, jadi tepi tetap tertutup.
  let scale = move === "tracking-left" || move === "tracking-right" ? 1 + amt / 1080 : move === "pan-up" || move === "pan-down" ? 1 + amt / 1920 : 1;
  let tx = 0;
  let ty = 0;
  switch (move) {
    case "push-in":
      scale = 1 + amt * t;
      break;
    case "pull-out":
      scale = 1 + amt * (1 - t);
      break;
    case "tracking-right":
      tx = -amt * t;
      break;
    case "tracking-left":
      tx = amt * t;
      break;
    case "pan-up":
      ty = amt * t;
      break;
    case "pan-down":
      ty = -amt * t;
      break;
    case "static":
      break;
  }
  const sx = shake ? (random(`cam-sx${frame}`) - 0.5) * shake * Math.exp(-frame / 20) : 0;
  const sy = shake ? (random(`cam-sy${frame}`) - 0.5) * shake * Math.exp(-frame / 20) : 0;
  const shot = (
    <AbsoluteFill style={{ transform: `translate(${tx + sx}px,${ty + sy}px) scale(${scale})`, transformOrigin: origin }}>
      {children}
    </AbsoluteFill>
  );
  // Motion blur hanya untuk shot yang bergerak. Shot statis (kartu hukum,
  // end card) tidak dibungkus — teksnya harus tetap tajam.
  const useBlur = blur ?? move !== "static";
  if (!useBlur) return shot;
  return (
    <HtmlInCanvasMotionBlur width={width} height={height} shutterAngle={180} samples={8}>
      {shot}
    </HtmlInCanvasMotionBlur>
  );
};

const ParallaxCtx = React.createContext<{ t: number; axis: "x" | "y" }>({ t: 0, axis: "x" });

/**
 * Parallax — latar bergerak berlapis dengan kecepatan berbeda.
 *
 * Pakai di dalam <svg> shot:
 *   <Parallax dur={dur}>
 *     <ParallaxLayer speed={120}>{/* lapis jauh: gedung, lambat *\/}</ParallaxLayer>
 *     <ParallaxLayer speed={420}>{/* lapis dekat: lampu jalan, cepat *\/}</ParallaxLayer>
 *   </Parallax>
 *   <Stick x={...} ... />  // karakter jalan di depan, digerakkan terpisah
 *
 * - `speed` = total px yang digeser lapis itu selama shot (0..1 progress).
 * - Gambar tiap lapis LEBIH LEBAR dari 1080px (atau tile berulang) supaya
 *   tidak ada sisi kosong saat bergeser. Lapis jauh = speed kecil.
 * - `axis="y"` untuk parallax vertikal (mis. lift / naik-turun).
 */
export const Parallax: React.FC<{ dur: number; axis?: "x" | "y"; children: React.ReactNode }> = ({
  dur,
  axis = "x",
  children,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  return <ParallaxCtx.Provider value={{ t, axis }}>{children}</ParallaxCtx.Provider>;
};

export const ParallaxLayer: React.FC<{ speed: number; children: React.ReactNode }> = ({ speed, children }) => {
  const { t, axis } = React.useContext(ParallaxCtx);
  const d = -speed * t;
  return <g transform={axis === "x" ? `translate(${d},0)` : `translate(0,${d})`}>{children}</g>;
};
