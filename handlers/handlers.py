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
        "POST, GET, DELETE, OPTIONS",
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
    to_add = [s for s in stocks_resp.stocks if s.id == 0]
    to_update = [s for s in stocks_resp.stocks if s.id != 0]
    stocks_added = CachedStorage.add_stocks(to_add)
    CachedStorage.update_stocks(to_update)
    stocks_resp = pygen.types.Stocks(stocks_added + to_update)
    self.write(serialize_bin(stocks_resp))
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
    to_add = [s for s in tasks_resp.tasks if s.id == 0]
    to_update = [s for s in tasks_resp.tasks if s.id != 0]
    tasks_added = CachedStorage.add_tasks(to_add)
    CachedStorage.update_tasks(to_update)
    tasks_resp = pygen.types.Tasks(tasks_added + to_update)
    self.write(serialize_bin(tasks_resp))
    self.finish()

  async def delete(self) -> None:
    tasks_resp = deserialize_bin(self.request.body, pygen.types.Tasks([]))
    CachedStorage.delete_tasks(tasks_resp.tasks)
    self.finish()

  def options(self):
    pass
