from datetime import datetime
from typing import List, Optional, Any, Tuple

import pygen
import yfinance as yf
from pandas import DataFrame
from pytz import timezone

from utils.config import get_config

CONFIG = get_config()

MIN_REFRESH_DELAY = 275

class Finance:
  @classmethod
  def __get_market_price(cls, price: Optional[Any]) -> Optional[float]:
    if price is None:
      return None

    return float(price["regularMarketPrice"])

  @classmethod
  def __get_pre_day_close(cls, price: Optional[Any]) -> Optional[float]:
    if price is None:
      return None

    return float(price["regularMarketPreviousClose"])

  @classmethod
  def __get_price_history(
    cls,
    history: Optional[DataFrame],
  ) -> List[pygen.types.StockDataPoint]:
    if history is None:
      return []
    
    return [
      pygen.types.StockDataPoint(
        round(h.High, 2),
        round(h.Low, 2),
        round(h.Open, 2),
        round(h.Close, 2),
      )
      for h in history.itertuples()
    ]

  @classmethod
  def get_stocks_data(
    cls,
    stocks: pygen.types.Stocks,
  ) -> pygen.types.Stocks:
    if len(stocks.stocks) == 0:
      return stocks

    symbols = " ".join([s.symbol for s in stocks.stocks])

    info = yf.Tickers(symbols)
    history = yf.download(
      tickers=symbols,
      threads=False,
      period="1d",
      interval="5m",
      group_by="ticker",
    )
    symbol_to_price = {
      s.symbol: info.tickers[s.symbol].stats()["price"]
      for s in stocks.stocks
      if s.symbol in info.tickers
    }

    extracted_stocks = [
      pygen.types.Stock(
        s.ord,
        s.symbol,
        cls.__get_market_price(symbol_to_price.get(s.symbol)),
        cls.__get_pre_day_close(symbol_to_price.get(s.symbol)),
        cls.__get_price_history(
          history if len(stocks.stocks) == 1 else history.get(s.symbol),
        ),
      )
      for s in stocks.stocks
    ]

    return pygen.types.Stocks(extracted_stocks)

def get_market_today_open_close_ts() -> Tuple[int, int]:
  now = datetime.now(timezone(CONFIG.market_time_zone))
  date_str = now.strftime("%Y-%d-%m")
  format = "%Y-%d-%m %H-%M"
  open = datetime.strptime(date_str + " " + CONFIG.market_open_time, format)
  close = datetime.strptime(date_str + " " + CONFIG.market_close_time, format)
  return int(open.timestamp()), int(close.timestamp())

def get_num_points_in_day() -> int:
  open_ts, close_ts = get_market_today_open_close_ts()
  return (close_ts - open_ts) // 300 + 1

class CachedFinance:
  """
  Don't hit Yahoo Finance too frequently
  """
  __stocks: Optional[pygen.types.Stocks] = None
  __last_fetch_time: Optional[float] = None

  @classmethod
  def get_stocks_info(
    cls,
    stocks: pygen.types.Stocks,
  ) -> pygen.types.Stocks:
    symbols = {s.symbol for s in stocks.stocks}
    open_ts, close_ts = get_market_today_open_close_ts()
    now_ts = datetime.now().timestamp()
    is_market_open = open_ts <= now_ts <= (close_ts + 300)

    if (
      not cls.__last_fetch_time or
      not cls.__stocks or
      {s.symbol for s in cls.__stocks.stocks} != symbols or
      (cls.__last_fetch_time + MIN_REFRESH_DELAY < now_ts and is_market_open)
    ):
      res = Finance.get_stocks_data(stocks)
      cls.__stocks = res
      cls.__last_fetch_time = datetime.now().timestamp()
      return res
    return cls.__stocks
