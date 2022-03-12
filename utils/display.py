import io
from typing import Any, Optional

import epaper
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chromium.webdriver import ChromiumDriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

from utils.config import get_config

CONFIG = get_config()


class Display:
  __epd: Any = None
  __driver: Optional[ChromiumDriver] = None

  @classmethod
  def init_display(cls):
    if not cls.__driver:
      chrome_options = Options()
      chrome_options.add_argument("headless")
      chrome_options.add_argument("window-size=800x480")
      chrome_options.add_argument("hide-scrollbars")

      caps = DesiredCapabilities().CHROME
      caps["pageLoadStrategy"] = "none"

      cls.__driver = webdriver.Chrome(
        options=chrome_options,
        desired_capabilities=caps,
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
