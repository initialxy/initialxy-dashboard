from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, List, Optional

DB_FILE = "data.db"


class Storage:
  db_file: str
  conn: Optional[sqlite3.Connection]

  def __init__(self) -> None:
    self.db_file = Path(__file__).parent.parent.joinpath(DB_FILE)
    self.conn = None
    if not self.db_file.is_file():
      with sqlite3.connect(self.db_file) as conn:
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE stocks (symbol TEXT)")

  def execute(self, query: str) -> List[Any]:
    if not self.conn:
      raise TypeError("Use with statement with this class")
    cursor = self.conn.cursor()
    return cursor.execute(query).fetchall()

  def __enter__(self) -> Storage:
    self.conn = sqlite3.connect(self.db_file)
    return self

  def __exit__(self, _type, _value, _trace) -> None:
    if self.conn:
      self.conn.close()
