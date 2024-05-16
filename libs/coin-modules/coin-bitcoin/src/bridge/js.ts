import { AccountBridge } from "@ledgerhq/types-live";
import {
  makeAccountBridgeReceive,
  makeScanAccounts,
  makeSync,
} from "@ledgerhq/coin-framework/bridge/jsHelpers";
import getAddressWrapper from "@ledgerhq/coin-framework/bridge/getAddressWrapper";
import { StartSpan, makeGetAccountShape, postSync } from "../synchronisation";
import { updateTransaction } from "../updateTransaction";
import { createTransaction } from "../createTransaction";
import { prepareTransaction } from "../prepareTransaction";
import { getTransactionStatus } from "../getTransactionStatus";
import { estimateMaxSpendable } from "../estimateMaxSpendable";
import { buildSignOperation } from "../signOperation";
import broadcast from "../broadcast";
import { calculateFees } from "./../cache";
import { perCoinLogic } from "../logic";
import { assignFromAccountRaw, assignToAccountRaw } from "../serialization";
import resolver from "../hw-getAddress";
import { SignerContext } from "../signer";
import { CoinConfig, setCoinConfig } from "../config";
import { BitcoinAccount, Transaction, TransactionStatus } from "../types";

function buildCurrencyBridge(signerContext: SignerContext, perfLogger: PerfLogger) {
  const getAddress = resolver(signerContext);
  const scanAccounts = makeScanAccounts<BitcoinAccount>({
    getAccountShape: makeGetAccountShape(signerContext, perfLogger.startSpan),
    getAddressFn: getAddressWrapper(getAddress),
  });

  return {
    scanAccounts,
    preload: () => Promise.resolve({}),
    hydrate: () => {},
  };
}

function buildAccountBridge(signerContext: SignerContext, perfLogger: PerfLogger) {
  const sync = makeSync<Transaction, TransactionStatus, BitcoinAccount>({
    getAccountShape: makeGetAccountShape(signerContext, perfLogger.startSpan),
    postSync,
  });

  const getAddress = resolver(signerContext);
  const injectGetAddressParams = (account: BitcoinAccount): any => {
    const perCoin = perCoinLogic[account.currency.id];

    if (perCoin && perCoin.injectGetAddressParams) {
      return perCoin.injectGetAddressParams(account);
    }
  };
  const receive = makeAccountBridgeReceive<BitcoinAccount>(getAddressWrapper(getAddress), {
    injectGetAddressParams,
  });
  const wrappedBroadcast: AccountBridge<
    Transaction,
    TransactionStatus,
    BitcoinAccount
  >["broadcast"] = async ({ account, signedOperation }) => {
    calculateFees.reset();
    return broadcast({
      account,
      signedOperation,
    });
  };

  return {
    estimateMaxSpendable,
    createTransaction,
    prepareTransaction,
    updateTransaction,
    getTransactionStatus,
    receive,
    sync,
    signOperation: buildSignOperation(signerContext),
    broadcast: wrappedBroadcast,
    assignFromAccountRaw,
    assignToAccountRaw,
  };
}

export type PerfLogger = {
  startSpan: StartSpan;
};

export function createBridges(
  signerContext: SignerContext,
  perfLogger: PerfLogger,
  coinConfig: CoinConfig,
) {
  setCoinConfig(coinConfig);

  return {
    currencyBridge: buildCurrencyBridge(signerContext, perfLogger),
    accountBridge: buildAccountBridge(signerContext, perfLogger),
  };
}
