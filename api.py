from email.headerregistry import ContentTransferEncodingHeader
import os

import tornado.ioloop
import tornado.web

from handlers.handlers import ConfigHandler
from utils.config import Config, get_config

CONFIG = get_config()

static_dir_props = {
  "path": os.path.join(os.path.dirname(__file__), "frontend/dist"),
  "default_filename": "index.html",
}


def make_app() -> tornado.web.Application:
  return tornado.web.Application(
    [
      (r"/c", ConfigHandler),
      (r"/e/(.*)", tornado.web.StaticFileHandler, static_dir_props),
      (r"/(.*)", tornado.web.StaticFileHandler, static_dir_props),
    ],
    debug=CONFIG.is_debug
  )


if __name__ == "__main__":
  app = make_app()
  app.listen(CONFIG.port)
  tornado.ioloop.IOLoop.current().start()
