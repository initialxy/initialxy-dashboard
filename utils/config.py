from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Optional

from utils.args import args

CONFIG_FILE_NAME = "appconfig.json"


@dataclass
class Config:
  is_debug: bool
  is_no_display: bool
  save_image: Optional[Path]
  port: int
  time_format: str
  date_format: str
  date_short_format: str
  epaper_model: str
  chrome_toolbar_height: int
  resolution: tuple[int, int]
  market_open_time: str
  market_close_time: str
  market_time_zone: str


@lru_cache(maxsize=1)
def get_config() -> Config:
  """
  Parse appconfig.json and put it into the Config dataclass. As much as I'd like
  to use Thrift, TSimpleJSONProtocol is write only and TJSONProtocol is not
  humanly readable. So we have to do some old school parsing here.
  """

  with open(Path(__file__).parent.parent.joinpath(CONFIG_FILE_NAME)) as f:
    contents = f.read()

  config_dict = json.loads(contents)
  resolution = config_dict["resolution"].split(",")

  return Config(
    args.debug,
    args.no_display,
    args.save_img,
    config_dict.get("port", 8010)
      if not args.debug else config_dict.get("devPort", 8000),
    config_dict.get("timeFormat", "h:mm a"),
    config_dict.get("dateFormat", "yyyy-MM-dd"),
    config_dict.get("dateShortFormat", "MM-dd"),
    config_dict["epaperModel"],
    int(config_dict["chromeToolbarHeight"]),
    (int(resolution[0]), int(resolution[1])),
    config_dict.get("marketOpenTime", "09:30"),
    config_dict.get("marketCloseTime", "16:00"),
    config_dict.get("marketTimeZone", "America/New_York"),
  )
