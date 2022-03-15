from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, List, Optional, Iterable

import re
import pygen

DB_FILE = "data.db"


class Storage:
  db_file: Path
  conn: Optional[sqlite3.Connection]

  def __init__(self) -> None:
    self.db_file = Path(__file__).parent.parent.joinpath(DB_FILE)
    self.conn = None
    if not self.db_file.is_file():
      with sqlite3.connect(self.db_file) as conn:
        cursor = conn.cursor()
        cursor.execute("""
          CREATE TABLE stocks (
            ord INTEGER NOT NULL,
            symbol TEXT NOT NULL PRIMARY KEY
          )
        """)
        cursor.execute("""
          CREATE TABLE tasks (
            ord INTEGER NOT NULL,
            desc TEXT NOT NULL,
            ts INTEGER
          )
        """)
        cursor.execute("CREATE INDEX task_sort ON tasks (ord DESC, ts)")
        cursor.execute(
          "CREATE INDEX stock_sort ON stocks (ord DESC, symbol)"
        )

  def __execute(self, query: str, params: Iterable[Any] = []) -> List[Any]:
    if not self.conn:
      raise TypeError("Use with statement with this class")
    cursor = self.conn.cursor()
    return cursor.execute(query, params).fetchall()

  def __get_max_rowid(self, table: str) -> int:
    if not re.match(r"^[a-zA-Z_]+$", table):
      raise NameError("Invalid table %s" % table)

    res = self.__execute("SELECT MAX(rowid) AS max_rowid FROM %s" % table)
    if not res:
      return -1
    return int(res[0][0])

  def get_stocks(self) -> List[pygen.types.Stock]:
    res = self.__execute(
      "SELECT rowid, ord, symbol FROM stocks ORDER BY ord DESC, symbol DESC",
    )
    return [pygen.types.Stock(rowid, ord, symbol) for rowid, ord, symbol in res]

  def add_stocks(
    self,
    stocks: List[pygen.types.Stock],
  ) -> List[pygen.types.Stock]:
    max_rowid = self.__get_max_rowid("stocks")
    for stock in stocks:
      self.__execute(
        "INSERT INTO stocks(ord, symbol) VALUES(?, ?)",
        [stock.ord, stock.symbol],
      )

    res = self.__execute(
      """
        SELECT
          rowid,
          ord,
          symbol
        FROM stocks
        WHERE rowid > ?
        ORDER BY ord DESC, symbol DESC
      """,
      [max_rowid]
    )
    return [pygen.types.Stock(rowid, ord, symbol) for rowid, ord, symbol in res]

  def update_stocks(self, stocks: List[pygen.types.Stock]) -> None:
    for stock in stocks:
      self.__execute(
        "UPDATE stocks set ord = ?, symbol = ? WHERE rowid = ?",
        (stock.ord, stock.symbol, stock.id),
      )

  def delete_stocks(self, stocks: List[pygen.types.Stock]) -> None:
    for stock in stocks:
      self.__execute("DELETE FROM stocks WHERE rowid = ?", [stock.id])

  def get_tasks(self) -> List[pygen.types.Task]:
    res = self.__execute(
      "SELECT rowid, ord, desc, ts FROM tasks ORDER BY ord DESC, ts",
    )
    return [
      pygen.types.Task(rowid, ord, desc, ts)
      for rowid, ord, desc, ts in res
    ]

  def add_tasks(
    self,
    tasks: List[pygen.types.Task],
  ) -> List[pygen.types.Task]:
    max_rowid = self.__get_max_rowid("tasks")
    for task in tasks:
      self.__execute(
        "INSERT INTO tasks(ord, desc, ts) VALUES(?, ?, ?)",
        [
          task.ord,
          task.desc,
          int(task.timestamp) if task.timestamp is not None else None,
        ],
      )

    res = self.__execute(
      """
        SELECT
          rowid,
          ord,
          desc,
          ts
        FROM tasks
        WHERE rowid > ?
        ORDER BY ord DESC, ts
      """,
      [max_rowid]
    )
    return [
      pygen.types.Task(rowid, ord, desc, ts)
      for rowid, ord, desc, ts in res
    ]

  def update_tasks(self, tasks: List[pygen.types.Task]) -> None:
    for task in tasks:
      self.__execute(
        "UPDATE tasks set ord = ?, desc = ?, ts = ? WHERE rowid = ?",
        (task.ord, task.desc, task.timestamp, task.id),
      )

  def delete_tasks(self, tasks: List[pygen.types.Task]) -> None:
    for task in tasks:
      self.__execute("DELETE FROM tasks WHERE rowid = ?", [task.id])

  def __enter__(self) -> Storage:
    self.conn = sqlite3.connect(self.db_file)
    return self

  def __exit__(self, _type, _value, _trace) -> None:
    if self.conn:
      self.conn.commit()
      self.conn.close()


class CachedStorage:
  """
  Avoid hitting SD card as much as possible to extend its life span
  """
  __stocks: Optional[List[pygen.types.Stock]] = None
  __tasks: Optional[List[pygen.types.Task]] = None

  @classmethod
  def get_stocks(cls) -> List[pygen.types.Stock]:
    if cls.__stocks:
      return cls.__stocks

    with Storage() as s:
      cls.__stocks = s.get_stocks()
      return cls.__stocks

  @classmethod
  def add_stocks(
    cls,
    stocks: List[pygen.types.Stock],
  ) -> List[pygen.types.Stock]:
    with Storage() as s:
      stocks = s.add_stocks(stocks)

    cls.__stocks = None
    return stocks

  @classmethod
  def update_stocks(cls, stocks: List[pygen.types.Stock]) -> None:
    with Storage() as s:
      s.update_stocks(stocks)

    cls.__stocks = None

  @classmethod
  def delete_stocks(cls, stocks: List[pygen.types.Stock]) -> None:
    with Storage() as s:
      s.delete_stocks(stocks)

    cls.__stocks = None

  @classmethod
  def get_tasks(cls) -> List[pygen.types.Task]:
    if cls.__tasks:
      return cls.__tasks

    with Storage() as s:
      cls.__tasks = s.get_tasks()
      return cls.__tasks

  @classmethod
  def add_tasks(
    cls,
    tasks: List[pygen.types.Task],
  ) -> List[pygen.types.Task]:
    with Storage() as s:
      tasks = s.add_tasks(tasks)

    cls.__tasks = None
    return tasks

  @classmethod
  def update_tasks(cls, tasks: List[pygen.types.Task]) -> None:
    with Storage() as s:
      s.update_tasks(tasks)

    cls.__tasks = None

  @classmethod
  def delete_tasks(cls, tasks: List[pygen.types.Task]) -> None:
    with Storage() as s:
      s.delete_tasks(tasks)

    cls.__tasks = None
