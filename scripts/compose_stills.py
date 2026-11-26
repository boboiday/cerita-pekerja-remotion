#!/usr/bin/env python3
"""Susun stills/storyboard.png + stills/cover.jpg dari frame hasil
`remotion still` (scripts/stills.mjs). Format mengikuti standar episode:
storyboard = 1 halaman, 2 kolom x 4 baris panel 9:16 + label;
cover = band atas hook + frame + band bawah pill pasal + handle.
Dipanggil: python3 scripts/compose_stills.py <compositionId>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
CREAM = (245, 238, 220)
INK = (14, 16, 22)
WHITE = (255, 255, 255)
RED = "#c0241c"
YELLOW = "#ffc338"
DARK_TOP = "#2e2e33"
DARK_BOT = "#171a26"


def font(path_candidates, size):
    for path in path_candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


HEAD = [
    "/usr/share/fonts/truetype/noto/NotoSansDisplay-ExtraCondensedBold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
MONO = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def fit_font(candidates, text, size, max_w):
    while size > 20:
        f = font(candidates, size)
        if f.getlength(text) <= max_w:
            return f
        size -= 4
    return font(candidates, 20)


def main():
    comp = sys.argv[1] if len(sys.argv) > 1 else "EP19Test"
    manifest = json.loads((ROOT / "scripts" / "stills.json").read_text())
    entry = manifest[comp]
    frames_dir = ROOT / "stills" / "frames"

    # --- storyboard.png: 2 kolom x 4 baris, panel 525x933 + label ---
    PW, PH, LABEL_H, GUT, M = 525, 933, 56, 10, 10
    cols, rows = 2, 4
    W = M * 2 + PW * cols + GUT * (cols - 1)
    H = M * 2 + rows * (PH + LABEL_H) + GUT * (rows - 1)
    board = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(board)
    for i, shot in enumerate(entry["shots"]):
        img = Image.open(frames_dir / f"shot-{i + 1:02d}.jpg").convert("RGB")
        img = img.resize((PW, PH), Image.LANCZOS)
        x = M + (i % cols) * (PW + GUT)
        y = M + (i // cols) * (PH + LABEL_H + GUT)
        board.paste(img, (x, y))
        d.rectangle([x, y + PH, x + PW, y + PH + LABEL_H], fill=INK)
        f = fit_font(MONO, shot["label"], 26, PW - 20)
        d.text((x + 12, y + PH + 12), shot["label"], font=f, fill=WHITE)
    board.save(ROOT / "stills" / "storyboard.png")
    print(f"storyboard.png: {W}x{H}, {len(entry['shots'])} panels")

    # --- cover.jpg: band hook + frame + band pill (format cover EP19) ---
    CW, CH = 1080, 1920
    TOP_H, BOT_H = 270, 230
    cover = Image.new("RGB", (CW, CH), DARK_TOP)
    d = ImageDraw.Draw(cover)
    frame = Image.open(frames_dir / "cover.jpg").convert("RGB")
    frame = frame.resize((CW, CH - TOP_H - BOT_H), Image.LANCZOS)
    cover.paste(frame, (0, TOP_H))
    # band atas: hook 2 baris
    hook = entry["cover"]["hook"]
    y = 36
    for line in hook:
        f = fit_font(HEAD, line, 96, CW - 80)
        d.text(((CW - f.getlength(line)) / 2, y), line, font=f, fill=WHITE)
        y += 100
    # band bawah: pill pasal + handle
    d.rectangle([0, CH - BOT_H, CW, CH], fill=DARK_BOT)
    pill = entry["cover"]["pill"]
    pf = fit_font(MONO, pill, 44, CW - 120)
    pw, ph = int(pf.getlength(pill)) + 48, 76
    px, py = (CW - pw) // 2, CH - BOT_H + 36
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=38, fill=RED)
    d.text((px + 24, py + 16), pill, font=pf, fill=WHITE)
    hf = fit_font(MONO, "@ceritapekerja_id", 40, CW - 80)
    d.text(((CW - hf.getlength("@ceritapekerja_id")) / 2, CH - 78),
           "@ceritapekerja_id", font=hf, fill=YELLOW)
    cover.save(ROOT / "stills" / "cover.jpg", quality=92)
    print(f"cover.jpg: {CW}x{CH} (frame {entry['cover']['frame']})")


if __name__ == "__main__":
    main()
