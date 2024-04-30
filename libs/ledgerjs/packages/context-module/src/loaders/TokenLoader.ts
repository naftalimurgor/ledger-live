import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ContextLoader } from "./ContextLoader";

export class CalMetadataFetcher implements ContextLoader {
  constructor() {}

  load(_transaction: Transaction, _options: LoaderOptions) {
    return Promise.resolve([]);
  }
}
