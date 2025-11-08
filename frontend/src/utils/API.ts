import { Buffer } from "buffer";
import { FrontEndConfig } from "../jsgen/FrontEndConfig";
import { getConfigEndpoint, getStocksEndpoint, getTasksEndpoint } from "./URL";
import { nullthrows } from "./Misc";
import { onlyx } from "./Misc";
import { Stock } from "../jsgen/Stock";
import { Stocks } from "../jsgen/Stocks";
import { Task } from "../jsgen/Task";
import { Tasks } from "../jsgen/Tasks";
import { TFramedTransport, TBinaryProtocol } from "thrift";
import Memoize from "./Memoize";
import type { TProtocol } from "thrift"

function deserializeThrift<T>(
  data: Buffer,
  thriftClass: { read(input: TProtocol): T },
): T {
  const trans = new TFramedTransport(data);
  const protocal = new TBinaryProtocol(trans);
  return thriftClass.read(protocal);
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  buffer.forEach((value, index) => {
    view[index] = value;
  });
  return arrayBuffer;
}

async function genSerializeThrift(
  thriftObj: { write(output: TProtocol): void },
): Promise<ArrayBuffer> {
  return new Promise((resolve, _) => {
    const trans = new TFramedTransport(
      undefined,
      // There are 4 bytes of header that need to be trimmed.
      (msg?: Buffer, _seqid?: number) =>
        resolve(toArrayBuffer(nullthrows(msg).subarray(4))),
    );
    const protocal = new TBinaryProtocol(trans);
    thriftObj.write(protocal);
    trans.flush();
  });
}

async function sendThriftObjToAPI(
  thriftObj: { write(output: TProtocol): void },
  endpoint: string,
  method: string,
): Promise<Response> {
  const buffer = await genSerializeThrift(thriftObj);
  return await fetch(
    endpoint,
    {
      method: method,
      body: buffer,
      mode: "cors",
      headers: { "Content-Type": "application/octet-stream" },
    },
  );
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

  // We only allow inserting one row at a time to avoid sync issues as much as
  // possible.
  static async genAddStock(stock: Stock): Promise<Stock> {
    if (stock.id !== 0) {
      throw new Error("When creating new, id needs to be set to 0");
    }

    const resp = await sendThriftObjToAPI(
      new Stocks({ stocks: [stock] }),
      getStocksEndpoint(),
      "POST",
    );
    const respArrayBuffer = await resp.arrayBuffer();
    return onlyx(
      deserializeThrift(Buffer.from(respArrayBuffer), Stocks).stocks,
    );
  }

  static async genUpdateStocks(stocks: Stocks): Promise<void> {
    await sendThriftObjToAPI(stocks, getStocksEndpoint(), "POST");
  }

  static async genDeleteStocks(stocks: Stocks): Promise<void> {
    await sendThriftObjToAPI(stocks, getStocksEndpoint(), "DELETE");
  }

  static async genTasks(): Promise<Tasks> {
    const resp = await fetch(getTasksEndpoint());
    const respArrayBuffer = await resp.arrayBuffer();
    return deserializeThrift(Buffer.from(respArrayBuffer), Tasks);
  }

  static async genAddTask(task: Task): Promise<Task> {
    if (task.id !== 0) {
      throw new Error("When creating new, id needs to be set to 0");
    }

    const resp = await sendThriftObjToAPI(
      new Tasks({ tasks: [task] }),
      getTasksEndpoint(),
      "POST",
    );
    const respArrayBuffer = await resp.arrayBuffer();
    return onlyx(deserializeThrift(Buffer.from(respArrayBuffer), Tasks).tasks);
  }

  static async genUpdateTasks(tasks: Tasks): Promise<void> {
    await sendThriftObjToAPI(tasks, getTasksEndpoint(), "POST");
  }

  static async genDeleteTasks(tasks: Tasks): Promise<void> {
    await sendThriftObjToAPI(tasks, getTasksEndpoint(), "DELETE");
  }
}