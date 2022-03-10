import time
from typing import List, Optional

import pygen
import yfinance as yf
from pandas import DataFrame

MIN_REFRESH_DELAY = 275

class Finance:
  @classmethod
  def __get_market_price(cls, symbol: str, info: yf.Tickers) -> Optional[float]:
    if symbol not in info.tickers:
      return None

    return float(info.tickers[symbol].info["regularMarketPrice"])

  @classmethod
  def __get_pre_day_close(
    cls,
    symbol: str,
    info: yf.Tickers,
  ) -> Optional[float]:
    if symbol not in info.tickers:
      return None

    return float(info.tickers[symbol].info["regularMarketPreviousClose"])

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

    extracted_stocks = [
      pygen.types.Stock(
        s.ord,
        s.symbol,
        cls.__get_market_price(s.symbol, info),
        cls.__get_pre_day_close(s.symbol, info),
        cls.__get_price_history(
          history if len(stocks.stocks) == 1 else history.get(s.symbol),
        ),
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
  def get_stocks_info(
    cls,
    stocks: pygen.types.Stocks,
  ) -> pygen.types.Stocks:
    symbols = {s.symbol for s in stocks.stocks}
    if (
      not cls.__last_fetch_time or
      cls.__last_fetch_time + MIN_REFRESH_DELAY < time.time() or
      not cls.__stocks or
      {s.symbol for s in cls.__stocks.stocks} != symbols
    ):
      res = Finance.get_stocks_data(stocks)
      cls.__stocks = res
      cls.__last_fetch_time = time.time()
      return res
    return cls.__stocks
