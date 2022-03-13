from thriftpy2.protocol import TBinaryProtocolFactory
from thriftpy2.utils import serialize, deserialize
from typing import TypeVar, cast

T = TypeVar('T')

def serialize_bin(thrift_obj: object) -> bytes:
  return bytes(serialize(
    thrift_obj,
    proto_factory=TBinaryProtocolFactory(),
  ))

def deserialize_bin(data: bytes, thrift_obj: T) -> T:
  return cast(T, deserialize(
    thrift_obj,
    data,
    proto_factory=TBinaryProtocolFactory(),
  ))