from utils.config import get_config, Config
import os
import tornado.ioloop
import tornado.web

static_dir_props = {
  "path": os.path.join(os.path.dirname(__file__), "frontend/dist"),
  "default_filename": "index.html",
}


def make_app(config: Config) -> tornado.web.Application:
  return tornado.web.Application(
    [
      (
        r"/e/(.*)",
        tornado.web.StaticFileHandler,
        static_dir_props,
      ),
      (
        r"/(.*)",
        tornado.web.StaticFileHandler,
        static_dir_props,
      ),
    ],
    debug=config.is_debug
  )


if __name__ == "__main__":
  config = get_config()
  app = make_app(config)
  app.listen(config.port)
  tornado.ioloop.IOLoop.current().start()
