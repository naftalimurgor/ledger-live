import { AccountBridge } from "@ledgerhq/types-live";
import { defaultUpdateTransaction } from "@ledgerhq/coin-framework/bridge/jsHelpers";
import { makeAccountBridgeReceive, makeSync } from "../../../bridge/jsHelpers";
import { estimateMaxSpendable } from "../estimateMaxSpendable";
import { getTransactionStatus } from "../getTransactionStatus";
import { prepareTransaction } from "../prepareTransaction";
import { getAccountShape } from "./bridgeHelpers/account";
import { createTransaction } from "../createTransaction";
import { signOperation } from "../signOperation";
import { Transaction } from "../types";
import { broadcast } from "../broadcast";

const sync = makeSync({ getAccountShape });

const receive = makeAccountBridgeReceive();

export const accountBridge: AccountBridge<Transaction> = {
  sync,
  updateTransaction: defaultUpdateTransaction,
  createTransaction,
  prepareTransaction,
  getTransactionStatus,
  estimateMaxSpendable,
  receive,
  signOperation,
  broadcast,
};
