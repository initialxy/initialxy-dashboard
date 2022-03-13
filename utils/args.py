import argparse
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--debug", help="Run in debug mode", action="store_true")
parser.add_argument(
    "--no-display", help="Disable all display modes", action="store_true")
parser.add_argument(
    "--save-img",
    help="Instead of sending image to e-ink display, " +
    "save it as a PNG instead",
    type=Path
)
args = parser.parse_args()
