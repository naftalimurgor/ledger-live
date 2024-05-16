import type { AccountBridge, CurrencyBridge } from "@ledgerhq/types-live";
import { defaultUpdateTransaction } from "@ledgerhq/coin-framework/bridge/jsHelpers";
import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import estimateMaxSpendable from "../estimateMaxSpendable";
import getTransactionStatus from "../getTransactionStatus";
import { scanAccounts, sync } from "../synchronization";
import prepareTransaction from "../prepareTransaction";
import createTransaction from "../createTransaction";
import signOperation from "../signOperation";
import type { Transaction } from "../types";
import broadcast from "../broadcast";

const currencyBridge: CurrencyBridge = {
  preload: async () => {},
  hydrate: () => {},
  scanAccounts,
};

const receive = makeAccountBridgeReceive();
const accountBridge: AccountBridge<Transaction> = {
  createTransaction,
  updateTransaction: defaultUpdateTransaction,
  prepareTransaction,
  estimateMaxSpendable,
  getTransactionStatus,
  sync,
  receive,
  signOperation,
  broadcast,
};

export default {
  currencyBridge,
  accountBridge,
};
