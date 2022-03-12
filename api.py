import os
import time

import tornado.ioloop
import tornado.web

from handlers.handlers import ConfigHandler, StocksHandler, TasksHandler
from utils.config import get_config
from utils.display import Display

CONFIG = get_config()

static_dir_props = {
  "path": os.path.join(os.path.dirname(__file__), "frontend/dist"),
  "default_filename": "index.html",
}


def make_app() -> tornado.web.Application:
  return tornado.web.Application(
    [
      (r"/c", ConfigHandler),
      (r"/s", StocksHandler),
      (r"/t", TasksHandler),
      (r"/e/(.*)", tornado.web.StaticFileHandler, static_dir_props),
      (r"/(.*)", tornado.web.StaticFileHandler, static_dir_props),
    ],
    debug=CONFIG.is_debug
  )


def refresh_display():
  Display.refresh()
  tornado.ioloop.IOLoop.current().call_later(
    70 - (time.time() % 60),
    refresh_display,
  )


def init_display():
  Display.init_display()
  tornado.ioloop.IOLoop.current().call_later(15, refresh_display)


if __name__ == "__main__":
  app = make_app()
  app.listen(CONFIG.port)
  tornado.ioloop.IOLoop.current().call_later(1, init_display)
  try:
    tornado.ioloop.IOLoop.current().start()
  except (Exception, KeyboardInterrupt):
    Display.close()
