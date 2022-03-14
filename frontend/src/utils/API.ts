import { Buffer } from "buffer";
import { FrontEndConfig } from "../jsgen/FrontEndConfig";
import { getConfigEndpoint, getStocksEndpoint, getTasksEndpoint } from "./URL";
import { nullthrows } from "./Misc";
import { Stocks } from "../jsgen/Stocks";
import { Task } from "../jsgen/Task";
import { Tasks } from "../jsgen/Tasks";
import { TFramedTransport, TBinaryProtocol, TProtocol } from "thrift";
import Memoize from "./Memoize";

const COMMON_WRITE_REQUEST_OPTIONS: RequestInit = {
  mode: "cors",
  headers: { "Content-Type": "application/octet-stream" },
};

function deserializeThrift<T>(
  data: Buffer,
  thriftClass: { read(input: TProtocol): T },
): T {
  const trans = new TFramedTransport(data);
  const protocal = new TBinaryProtocol(trans);
  return thriftClass.read(protocal);
}

async function genSerializeThrift(
  thriftClass: { write(output: TProtocol): void },
): Promise<Buffer> {
  return new Promise((resolve, _) => {
    const trans = new TFramedTransport(
      undefined,
      // There are 4 bytes of header that need to be trimmed.
      (msg?: Buffer, _seqid?: number) => resolve(nullthrows(msg).slice(4)),
    );
    const protocal = new TBinaryProtocol(trans);
    thriftClass.write(protocal);
    trans.flush();
  });
}

// In a class, because TypeScript doesn't let you use decorator on functions,
// but static functions in class is ok.
export default class API {
  @Memoize(1)
  static async genConfig(): Promise<FrontEndConfig> {
    const resp = await fetch(getConfigEndpoint());
    const respArrayBuffer = await resp.arrayBuffer();
    const res = deserializeThrift(Buffer.from(respArrayBuffer), FrontEndConfig);
    return res;
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

  static async genAddTask(task: Task): Promise<void> {
    const buffer = await genSerializeThrift(task);
    await fetch(
      getTasksEndpoint(),
      {
        method: "POST",
        body: buffer,
        ...COMMON_WRITE_REQUEST_OPTIONS,
      },
    );
  }
}