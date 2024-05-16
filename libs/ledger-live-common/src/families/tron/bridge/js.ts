import type { CurrencyBridge, AccountBridge } from "@ledgerhq/types-live";
import { defaultUpdateTransaction } from "@ledgerhq/coin-framework/bridge/jsHelpers";
import { makeSync, makeScanAccounts } from "../../../bridge/jsHelpers";
import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import { getAccountShape, postSync } from "../synchronization";
import { getTransactionStatus } from "../getTransactionStatus";
import { estimateMaxSpendable } from "../estimateMaxSpendable";
import { createTransaction } from "../createTransaction";
import { prepareTransaction } from "../prepareTransaction";
import { signOperation } from "../signOperation";
import { hydrate, preload } from "../preload";
import type { Transaction, TransactionStatus, TronAccount } from "../types";
import { broadcast } from "../broadcast";
import {
  assignFromAccountRaw,
  assignToAccountRaw,
  fromOperationExtraRaw,
  toOperationExtraRaw,
} from "../serialization";

const scanAccounts = makeScanAccounts<TronAccount>({ getAccountShape });
const currencyBridge: CurrencyBridge = {
  preload,
  hydrate,
  scanAccounts,
};

const receive = makeAccountBridgeReceive();
const sync = makeSync<Transaction, TransactionStatus, TronAccount>({ getAccountShape, postSync });
const accountBridge: AccountBridge<Transaction, TransactionStatus, TronAccount> = {
  createTransaction,
  updateTransaction: defaultUpdateTransaction,
  prepareTransaction,
  getTransactionStatus,
  estimateMaxSpendable,
  sync,
  receive,
  signOperation,
  broadcast,
  assignFromAccountRaw,
  assignToAccountRaw,
  fromOperationExtraRaw,
  toOperationExtraRaw,
};

export default {
  currencyBridge,
  accountBridge,
};
