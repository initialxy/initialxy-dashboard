from copy import copy
from datetime import (datetime, time)
from math import isnan
from typing import Any, List, Optional, Tuple

import pygen
import yfinance as yf
from pandas import DataFrame
from pytz import timezone

from utils.config import get_config

CONFIG = get_config()

MIN_UPDATE_DELAY = 275
MIN_REFETCH_DELAY = 30

class Finance:
  @classmethod
  def __get_market_price(cls, info: Optional[Any]) -> Optional[float]:
    if info is None:
      return None

    return float(info["lastPrice"])

  @classmethod
  def __get_pre_day_close(cls, info: Optional[Any]) -> Optional[float]:
    if info is None:
      return None

    return float(info["regularMarketPreviousClose"])

  @classmethod
  def __get_price_history(
    cls,
    history: Optional[DataFrame],
  ) -> List[pygen.types.StockDataPoint]:
    if history is None:
      return []
    
    return [
      pygen.types.StockDataPoint(
        round(r["High"], 2),
        round(r["Low"], 2),
        round(r["Open"], 2),
        round(r["Close"], 2),
      )
      for _, r in history.iterrows()
      if not isnan(r["Open"])
    ]

  @classmethod
  def get_stocks_data(
    cls,
    stocks: pygen.types.Stocks,
  ) -> pygen.types.Stocks:
    if len(stocks.stocks) == 0:
      return copy(stocks)

    symbols = " ".join([s.symbol for s in stocks.stocks])

    tickers = yf.Tickers(symbols)
    history = yf.download(
      tickers=symbols,
      threads=False,
      period="1d",
      interval="5m",
      group_by="ticker",
    )
    symbol_to_info = {
      s.symbol: tickers.tickers[s.symbol].fast_info
      for s in stocks.stocks
      if s.symbol in tickers.tickers
    }

    extracted_stocks = [
      pygen.types.Stock(
        s.id,
        s.ord,
        s.symbol,
        cls.__get_market_price(symbol_to_info.get(s.symbol)),
        cls.__get_pre_day_close(symbol_to_info.get(s.symbol)),
        cls.__get_price_history(history.get(s.symbol)),
      )
      for s in stocks.stocks
    ]

    return pygen.types.Stocks(extracted_stocks)

class CachedFinance:
  """
  Don't hit Yahoo Finance too frequently
  """
  __stocks: Optional[pygen.types.Stocks] = None
  __last_fetch_time: Optional[float] = None

  @classmethod
  def get_market_today_open_close_ts(cls) -> Tuple[int, int]:
    tz = timezone(CONFIG.market_time_zone)
    now = datetime.now(tz)
    open_dt = tz.localize(datetime.combine(
      now.date(),
      time.fromisoformat(CONFIG.market_open_time),
    ))
    close_dt = tz.localize(datetime.combine(
      now.date(),
      time.fromisoformat(CONFIG.market_close_time),
    ))
    return int(open_dt.timestamp()), int(close_dt.timestamp())

  @classmethod
  def get_num_points_in_day(cls) -> int:
    open_ts, close_ts = cls.get_market_today_open_close_ts()
    return (close_ts - open_ts) // 300 + 1

  @classmethod
  def is_market_open(cls) -> bool:
    open_ts, close_ts = cls.get_market_today_open_close_ts()
    now = datetime.now(timezone(CONFIG.market_time_zone))
    now_ts = now.timestamp()

    return (
      open_ts <= now_ts <= (close_ts + 300) and # 5 mins leeway to allow last poll
      now.strftime("%w") not in {"0", "6"} # Not a weekend
    )

  @classmethod
  def __create_results_with_cache(
    cls,
    stocks: pygen.types.Stocks,
  ) -> pygen.types.Stocks:
    if not cls.__stocks:
      return copy(stocks)

    lookup = {s.symbol: s for s in cls.__stocks.stocks}
    return pygen.types.Stocks([
      pygen.types.Stock(
        s.id,
        s.ord,
        s.symbol,
        lookup[s.symbol].curMarketPrice if s.symbol in lookup else None,
        lookup[s.symbol].preDayClose if s.symbol in lookup else None,
        lookup[s.symbol].dataPoints if s.symbol in lookup else None,
      )
      for s in stocks.stocks
    ])

  @classmethod
  def get_stocks_info(
    cls,
    stocks: pygen.types.Stocks,
  ) -> pygen.types.Stocks:
    symbols = [s.symbol for s in stocks.stocks]
    symbols_in_cache = (
      [s.symbol for s in cls.__stocks.stocks]
      if cls.__stocks else []
    )
    now_ts = datetime.now().timestamp()
    is_market_open = cls.is_market_open()

    if (
      not cls.__last_fetch_time or
      not cls.__stocks or
      (
        set(symbols) - set(symbols_in_cache) and
        cls.__last_fetch_time + MIN_REFETCH_DELAY < now_ts
      ) or
      (is_market_open and cls.__last_fetch_time + MIN_UPDATE_DELAY < now_ts)
    ):
      res = Finance.get_stocks_data(stocks)
      cls.__stocks = res
      cls.__last_fetch_time = datetime.now().timestamp()
      return res

    if symbols != symbols_in_cache:
      # There are changes to order or not allowed to refetch yet. Just pull data
      # over from cache.
      cls.__stocks = cls.__create_results_with_cache(stocks)
      return cls.__stocks

    return cls.__stocks
