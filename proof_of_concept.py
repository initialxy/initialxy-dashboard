#!/usr/bin/python
# -*- coding:utf-8 -*-
import sys
import os
picdir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'pic')
libdir = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'lib')
if os.path.exists(libdir):
    sys.path.append(libdir)

import logging
import epaper
import time
from PIL import Image,ImageDraw,ImageFont
import traceback
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import io

logging.basicConfig(level=logging.DEBUG)

try:
    logging.info("epd7in5_V2 Demo")
    epd = epaper.epaper("epd7in5_V2").EPD()
    epd.init()

    logging.info("test")

    chrome_options = Options()
    chrome_options.add_argument("headless")
    chrome_options.add_argument("window-size=800x480")
    chrome_options.add_argument("hide-scrollbars")

    caps = DesiredCapabilities().CHROME
    caps["pageLoadStrategy"] = "none"

    driver = webdriver.Chrome(options=chrome_options, desired_capabilities=caps)
    driver.get("http://localhost:8000")
    for i in range(3):
      img_binary = driver.get_screenshot_as_png()
      image = Image.open(io.BytesIO(img_binary)) 
      epd.display(epd.getbuffer(image))
      time.sleep(10)

    driver.close()
    logging.info("Goto Sleep...")
    epd.Clear()
    epd.sleep()
    
except IOError as e:
    logging.info(e)
    
except KeyboardInterrupt:    
    logging.info("ctrl + c:")
    exit()
