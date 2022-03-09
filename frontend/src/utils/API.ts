import { Buffer } from "buffer";
import { FrontEndConfig } from "../jsgen/FrontEndConfig";
import { Stocks } from "../jsgen/Stocks";
import { Tasks } from "../jsgen/Tasks";
import { getConfigEndpoint, getStocksEndpoint, getTasksEndpoint } from "./URL";
import { TFramedTransport, TBinaryProtocol, TProtocol } from "thrift";
import Memoize from "./Memoize";

function deserializeThrift<T>(
  data: Buffer,
  thriftClass: { read(input: TProtocol): T },
): T {
  const trans = new TFramedTransport(data);
  const protocal = new TBinaryProtocol(trans);
  return thriftClass.read(protocal);
}

// In a class, because TypeScript doesn't let you use decorator on functions,
// but static functions in class is ok.
export default class API {
  @Memoize(1)
  static async genConfig(): Promise<FrontEndConfig> {
    const resp = await fetch(getConfigEndpoint());
    const respArrayBuffer = await resp.arrayBuffer();
    return deserializeThrift(Buffer.from(respArrayBuffer), FrontEndConfig);
  }

  static async genStocks(): Promise<Stocks> {
    const resp = await fetch(getStocksEndpoint());
    const respArrayBuffer = await resp.arrayBuffer();
    return deserializeThrift(Buffer.from(respArrayBuffer), Stocks);
  }

  static async genTasks(): Promise<Tasks> {
    const resp = await fetch(getTasksEndpoint());
    const respArrayBuffer = await resp.arrayBuffer();
    return deserializeThrift(Buffer.from(respArrayBuffer), Tasks);
  }
}