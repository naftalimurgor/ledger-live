import type { Transaction } from "../types";
import { SignerContext, scanAccounts, sync } from "../synchronisation";
import estimateMaxSpendable from "../estimateMaxSpendable";
import { prepareTransaction } from "../prepareTransaction";
import { createTransaction } from "../createTransaction";
import getTransactionStatus from "../getTransactionStatus";
import signOperation from "../signOperation";
import broadcast from "../broadcast";
import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import { defaultUpdateTransaction } from "@ledgerhq/coin-framework/bridge/jsHelpers";
import type { AccountBridge, CurrencyBridge } from "@ledgerhq/types-live";
import { assignToAccountRaw, assignFromAccountRaw } from "../serialization";
import Ada, { ExtendedPublicKey } from "@cardano-foundation/ledgerjs-hw-app-cardano";
import { withDevice } from "../../../hw/deviceAccess";
import { firstValueFrom, from } from "rxjs";

const receive = makeAccountBridgeReceive();

const signerContext: SignerContext = (
  deviceId: string,
  fn: (signer) => Promise<ExtendedPublicKey>,
): Promise<ExtendedPublicKey> => {
  return firstValueFrom(withDevice(deviceId)(transport => from(fn(new Ada(transport)))));
};

const accountBridge: AccountBridge<Transaction> = {
  estimateMaxSpendable,
  createTransaction,
  updateTransaction: defaultUpdateTransaction,
  getTransactionStatus,
  prepareTransaction,
  sync: sync(signerContext),
  receive,
  assignToAccountRaw,
  assignFromAccountRaw,
  signOperation,
  broadcast,
};

const currencyBridge: CurrencyBridge = {
  scanAccounts: scanAccounts(signerContext),
  preload: async () => ({}),
  hydrate: () => {},
};

export default { currencyBridge, accountBridge };
