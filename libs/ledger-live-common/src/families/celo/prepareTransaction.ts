import { CeloAccount, Transaction } from "./types";
import getFeesForTransaction from "./getFeesForTransaction";
import { isValidAddress } from "@celo/utils/lib/address";
import BigNumber from "bignumber.js";
import { AccountBridge } from "@ledgerhq/types-live";

const sameFees = (a, b) => (!a || !b ? a === b : a.eq(b));

const prepareTransaction: AccountBridge<Transaction>["prepareTransaction"] = async (
  account: CeloAccount,
  transaction,
) => {
  if (transaction.recipient && !isValidAddress(transaction.recipient)) return transaction;

  if (["send", "vote"].includes(transaction.mode) && !transaction.recipient) return transaction;

  if (
    transaction.mode === "vote" &&
    !transaction.useAllAmount &&
    new BigNumber(transaction.amount).lte(0)
  )
    return transaction;

  const fees = await getFeesForTransaction({ account, transaction });

  if (!sameFees(transaction.fees, fees)) {
    return { ...transaction, fees };
  }

  return transaction;
};

export default prepareTransaction;
