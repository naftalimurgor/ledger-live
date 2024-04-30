import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ContextLoader } from "./ContextLoader";

export class ExternalPluginLoader implements ContextLoader {
  constructor() {}

  async load(_transaction: Transaction, _options: LoaderOptions) {
    // TODO: implement the call to the CAL service when implemented
    return Promise.resolve([]);
  }
}
