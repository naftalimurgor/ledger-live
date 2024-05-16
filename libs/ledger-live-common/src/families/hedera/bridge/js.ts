import type { AccountBridge, CurrencyBridge } from "@ledgerhq/types-live";
import type { Transaction } from "../types";
import { getTransactionStatus } from "../getTransactionStatus";
import { estimateMaxSpendable } from "../estimateMaxSpendable";
import { signOperation } from "../signOperation";
import { broadcast } from "../broadcast";
import { scanAccounts, sync } from "../synchronisation";
import { receive } from "../receive";
import { prepareTransaction } from "../prepareTransaction";
import { createTransaction } from "../createTransaction";
import { defaultUpdateTransaction } from "@ledgerhq/coin-framework/bridge/jsHelpers";

const currencyBridge: CurrencyBridge = {
  preload: () => Promise.resolve({}),
  hydrate: () => {},
  scanAccounts,
};

const accountBridge: AccountBridge<Transaction> = {
  estimateMaxSpendable,
  createTransaction,
  updateTransaction: defaultUpdateTransaction,
  getTransactionStatus,
  prepareTransaction,
  sync,
  receive,
  signOperation,
  broadcast,
};

export default {
  currencyBridge,
  accountBridge,
};
