from __future__ import annotations

import argparse
from pathlib import Path

import pdfplumber


FIGURES = {
    "overview.png": (0, (315, 190, 610, 415)),
    "architecture.png": (2, (24, 55, 588, 420)),
    "qualitative.png": (5, (20, 45, 592, 345)),
    "spatial-support.png": (6, (260, 230, 590, 525)),
}


def crop_to_pixels(box: tuple[float, float, float, float], scale: float) -> tuple[int, int, int, int]:
    return tuple(round(value * scale) for value in box)


def main() -> None:
    parser = argparse.ArgumentParser(description="Render CrossScope manuscript figures for the project page.")
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--resolution", type=int, default=200)
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    scale = args.resolution / 72
    with pdfplumber.open(args.pdf) as paper:
        for filename, (page_index, box) in FIGURES.items():
            page_image = paper.pages[page_index].to_image(resolution=args.resolution).original
            page_image.crop(crop_to_pixels(box, scale)).save(args.out / filename, optimize=True)

        icon = paper.pages[0].to_image(resolution=72).original
        icon.crop(crop_to_pixels(FIGURES["overview.png"][1], 1)).resize((64, 64)).save(args.out / "favicon.png")


if __name__ == "__main__":
    main()
