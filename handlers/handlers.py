import pygen
import tornado.web
from utils.config import get_config
from utils.thrift import serialize_bin
from utils.storage import Storage

CONFIG = get_config()


class BaseEndpointHandler(tornado.web.RequestHandler):

  def set_default_headers(self) -> None:
    self.set_header("Content-Type", "application/octet-stream")
    if CONFIG.is_debug:
      self.set_header("Access-Control-Allow-Origin", "*")
      self.set_header("Access-Control-Allow-Headers", "x-requested-with")
      self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')


class ConfigHandler(BaseEndpointHandler):
  """
  Restful API endpoint to fetch config.
  """

  async def get(self) -> None:
    config_resp = pygen.types.FrontEndConfig(
      CONFIG.time_format, CONFIG.date_format
    )
    self.write(serialize_bin(config_resp))
    self.finish()


class StocksHandler(BaseEndpointHandler):
  """
  Restful API endpoint to fetch stocks data.
  """

  async def get(self) -> None:
    with Storage() as s:
      print(s.execute("SELECT * FROM stocks"))
    self.finish()
