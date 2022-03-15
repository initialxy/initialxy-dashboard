import pygen
import tornado.web
from utils.config import get_config
from utils.finance import CachedFinance
from utils.storage import CachedStorage
from utils.thrift import serialize_bin, deserialize_bin

CONFIG = get_config()


class BaseEndpointHandler(tornado.web.RequestHandler):

  def set_default_headers(self) -> None:
    self.set_header("Content-Type", "application/octet-stream")
    if CONFIG.is_debug:
      self.set_header("Access-Control-Allow-Origin", "*")
      self.set_header(
        "Access-Control-Allow-Headers",
        "x-requested-with, Content-Type",
      )
      self.set_header(
        "Access-Control-Allow-Methods",
        "POST, GET, DELETE, UPDATE, OPTIONS",
      )


class ConfigHandler(BaseEndpointHandler):
  """
  Restful API endpoint to fetch config.
  """

  async def get(self) -> None:
    config_resp = pygen.types.FrontEndConfig(
      CONFIG.time_format,
      CONFIG.date_format,
      CONFIG.date_short_format,
      CachedFinance.get_num_points_in_day(),
    )
    self.write(serialize_bin(config_resp))
    self.finish()


class StocksHandler(BaseEndpointHandler):
  """
  Restful API endpoint to fetch stocks data.
  """

  async def get(self) -> None:
    stocks_resp = pygen.types.Stocks(CachedStorage.get_stocks())
    stocks_resp = CachedFinance.get_stocks_info(stocks_resp)
    self.write(serialize_bin(stocks_resp))
    self.finish()

  async def post(self) -> None:
    stocks_resp = deserialize_bin(self.request.body, pygen.types.Stocks([]))
    stocks = CachedStorage.add_stocks(stocks_resp.stocks)
    stocks_resp = pygen.types.Stocks(stocks)
    self.write(serialize_bin(stocks_resp))
    self.finish()

  async def update(self) -> None:
    stocks_resp = deserialize_bin(self.request.body, pygen.types.Stocks([]))
    CachedStorage.update_stocks(stocks_resp.stocks)
    self.finish()

  async def delete(self) -> None:
    stocks_resp = deserialize_bin(self.request.body, pygen.types.Stocks([]))
    CachedStorage.delete_stocks(stocks_resp.stocks)
    self.finish()

  def options(self):
    pass


class TasksHandler(BaseEndpointHandler):
  """
  Restful API endpoint to fetch tasks data.
  """

  async def get(self) -> None:
    tasks_resp = pygen.types.Tasks(CachedStorage.get_tasks())
    self.write(serialize_bin(tasks_resp))
    self.finish()

  async def post(self) -> None:
    tasks_resp = deserialize_bin(self.request.body, pygen.types.Tasks([]))
    tasks = CachedStorage.add_tasks(tasks_resp.tasks)
    tasks_resp = pygen.types.Tasks(tasks)
    self.write(serialize_bin(tasks_resp))
    self.finish()

  async def update(self) -> None:
    tasks_resp = deserialize_bin(self.request.body, pygen.types.Tasks([]))
    CachedStorage.update_tasks(tasks_resp.tasks)
    self.finish()

  async def delete(self) -> None:
    tasks_resp = deserialize_bin(self.request.body, pygen.types.Tasks([]))
    CachedStorage.delete_tasks(tasks_resp.tasks)
    self.finish()

  def options(self):
    pass
