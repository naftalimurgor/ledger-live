import { ContextResponse } from "../models/ContextResponse";
import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";

export type ContextLoader = {
  load: (transaction: Transaction, options: LoaderOptions) => Promise<ContextResponse[]>;
};
