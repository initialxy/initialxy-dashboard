import io
from typing import Any, Optional

import epaper
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chromium.webdriver import ChromiumDriver
from selenium.webdriver.chrome.service import Service

from utils.config import get_config

CONFIG = get_config()


class Display:
  __epd: Any = None
  __driver: Optional[ChromiumDriver] = None

  @classmethod
  def init_display(cls):
    if not cls.__driver:
      window_size = (str(CONFIG.resolution[0]) + "," + str(CONFIG.resolution[1]
        + CONFIG.chrome_toolbar_height))
      chrome_options = Options()
      chrome_options.add_argument("--headless=new")
      chrome_options.add_argument("--window-size=" + window_size)
      chrome_options.add_argument("--hide-scrollbars")
      chrome_options.set_capability("pageLoadStrategy", "none")
      service = Service("/home/pi/bin/chromedriver")

      cls.__driver = webdriver.Chrome(
        service=service,
        options=chrome_options
      )
      cls.__driver.get("http://localhost:" + str(CONFIG.port))

    if not cls.__epd and not CONFIG.save_image:
      cls.__epd = epaper.epaper(CONFIG.epaper_model).EPD()

  @classmethod
  def refresh(cls):
    cls.init_display()

    img_binary = cls.__driver.get_screenshot_as_png()
    image = Image.open(io.BytesIO(img_binary))

    if CONFIG.save_image:
      image.save(CONFIG.save_image)
    else:
      cls.__epd.init()
      cls.__epd.display(cls.__epd.getbuffer(image))
      cls.__epd.sleep()

  @classmethod
  def close(cls):
    if cls.__driver:
      cls.__driver.quit()
      cls.__driver = None
    if cls.__epd:
      cls.__epd.init()
      cls.__epd.Clear()
      cls.__epd.sleep()
      cls.__epd = None
