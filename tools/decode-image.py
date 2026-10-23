"""Decode image bytes from stdin for the Daily News image verifier."""
import io
import json
import sys
import warnings
import xml.etree.ElementTree as ET

from PIL import Image


def main():
    data = sys.stdin.buffer.read()
    if len(sys.argv) > 1 and sys.argv[1] == "svg":
        root = ET.fromstring(data)
        if root.tag != "{http://www.w3.org/2000/svg}svg" and root.tag != "svg":
            raise ValueError("SVG root element missing")
        print(json.dumps({"format": "svg"}))
        return

    Image.MAX_IMAGE_PIXELS = 50_000_000
    with warnings.catch_warnings():
        warnings.simplefilter("error", Image.DecompressionBombWarning)
        with Image.open(io.BytesIO(data)) as picture:
            image_format = (picture.format or "").lower()
            width, height = picture.size
            picture.load()
    if width < 1 or height < 1:
        raise ValueError("Invalid image dimensions")
    print(json.dumps({"format": image_format, "width": width, "height": height}))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
