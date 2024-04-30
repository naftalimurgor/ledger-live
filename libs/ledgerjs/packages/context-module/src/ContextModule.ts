import { ContextResponse } from "./models/ContextResponse";
import { LoaderOptions } from "./models/LoaderOptions";
import { Transaction } from "./models/Transaction";

export interface ContextModule {
  getContexts(transaction: Transaction, options: LoaderOptions): Promise<ContextResponse[]>;
}
