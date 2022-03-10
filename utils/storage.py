from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, List, Optional

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

  def __execute(self, query: str) -> List[Any]:
    if not self.conn:
      raise TypeError("Use with statement with this class")
    cursor = self.conn.cursor()
    return cursor.execute(query).fetchall()

  def get_stocks(self) -> List[pygen.types.Stock]:
    res = self.__execute(
      "SELECT ord, symbol FROM stocks ORDER BY ord DESC, symbol DESC"
    )
    return [pygen.types.Stock(pri, symbol) for pri, symbol in res]

  def get_tasks(self) -> List[pygen.types.Task]:
    res = self.__execute(
      "SELECT rowid, ord, desc, ts FROM tasks ORDER BY ord DESC, ts NULLS LAST",
    )
    return [
      pygen.types.Task(rowid, pri, desc, ts)
      for rowid, pri, desc, ts in res
    ]

  def __enter__(self) -> Storage:
    self.conn = sqlite3.connect(self.db_file)
    return self

  def __exit__(self, _type, _value, _trace) -> None:
    if self.conn:
      self.conn.close()


class CachedStorage:
  """
  Avoid hitting SD card as much as possible to extend its life span
  """
  __stocks: Optional[list[pygen.types.Stock]] = None
  __tasks: Optional[list[pygen.types.Task]] = None

  @classmethod
  def get_stocks(cls) -> List[pygen.types.Stock]:
    if cls.__stocks:
      return cls.__stocks

    with Storage() as s:
      cls.__stocks = s.get_stocks()
      cls.__is_dirty = False
      return cls.__stocks

  @classmethod
  def get_tasks(cls) -> List[pygen.types.Task]:
    if cls.__tasks:
      return cls.__tasks

    with Storage() as s:
      cls.__tasks = s.get_tasks()
      cls.__is_dirty = False
      return cls.__tasks