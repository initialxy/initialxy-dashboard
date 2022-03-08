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
            pri INTEGER NOT NULL,
            symbol TEXT NOT NULL PRIMARY KEY
          )
        """)
        cursor.execute("""
          CREATE TABLE tasks (
            pri INTEGER NOT NULL,
            desc TEXT NOT NULL,
            ts INTEGER
          )
        """)
        cursor.execute("CREATE INDEX task_sort ON tasks (pri, ts)")
        cursor.execute("CREATE INDEX stock_sort ON stocks (pri, symbol)")

  def __execute(self, query: str) -> List[Any]:
    if not self.conn:
      raise TypeError("Use with statement with this class")
    cursor = self.conn.cursor()
    return cursor.execute(query).fetchall()

  def getStocks(self) -> List[pygen.types.Stock]:
    res = self.__execute("SELECT symbol FROM stocks ORDER BY pri, symbol")
    return [pygen.types.Stock(pri, symbol) for pri, symbol in res]

  def getTasks(self) -> List[pygen.types.Task]:
    res = self.__execute(
      "SELECT rowid, pri, desc, ts FROM tasks ORDER BY pri, ts NULLS LAST",
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
