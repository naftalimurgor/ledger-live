import { CeloAccount, Transaction } from "./types";
import { getMainAccount } from "../../account";
import getTransactionStatus from "./getTransactionStatus";
import prepareTransaction from "./prepareTransaction";
import createTransaction from "./createTransaction";
import type { AccountBridge } from "@ledgerhq/types-live";

const estimateMaxSpendable: AccountBridge<Transaction>["estimateMaxSpendable"] = async ({
  account,
  parentAccount,
  transaction,
}) => {
  const mainAccount = getMainAccount(account, parentAccount) as CeloAccount;
  const t = await prepareTransaction(mainAccount, {
    ...createTransaction(account),
    ...transaction,
    useAllAmount: true,
  });
  const s = await getTransactionStatus(mainAccount, t);
  return s.amount;
};

export default estimateMaxSpendable;
