import type { AccountBridge, CurrencyBridge } from "@ledgerhq/types-live";
import type { Transaction } from "../types";
import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import { defaultUpdateTransaction } from "@ledgerhq/coin-framework/bridge/jsHelpers";
import { sync, scanAccounts } from "../synchronisation";
import { assignFromAccountRaw, assignToAccountRaw } from "../serialization";
import { prepareTransaction } from "../prepareTransaction";
import getTransactionStatus from "../getTransactionStatus";
import estimateMaxSpendable from "../estimateMaxSpendable";
import { createTransaction } from "../createTransaction";
import signOperation from "../signOperation";
import broadcast from "../broadcast";

const currencyBridge: CurrencyBridge = {
  preload: async () => Promise.resolve({}),
  hydrate: () => {},
  scanAccounts,
};

const receive = makeAccountBridgeReceive();
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
  assignFromAccountRaw,
  assignToAccountRaw,
};
export default {
  currencyBridge,
  accountBridge,
};
