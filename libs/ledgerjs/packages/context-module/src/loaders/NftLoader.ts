import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ContextLoader } from "./ContextLoader";

export class NftLoader implements ContextLoader {
  constructor() {}

  load(_transaction: Transaction, _options: LoaderOptions) {
    // TODO: implementation
    return Promise.resolve([]);
  }
}
