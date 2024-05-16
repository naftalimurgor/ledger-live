import { getAbandonSeedAddress } from "@ledgerhq/cryptoassets";
import type { AccountBridge } from "@ledgerhq/types-live";
import { getMainAccount } from "../../account";
import createTransaction from "./createTransaction";
import getTransactionStatus from "./getTransactionStatus";
import prepareTransaction from "./prepareTransaction";
import type { CosmosAccount, Transaction } from "./types";

const estimateMaxSpendable: AccountBridge<Transaction>["estimateMaxSpendable"] = async ({
  account,
  parentAccount,
  transaction,
}) => {
  const mainAccount = getMainAccount(account, parentAccount) as CosmosAccount;

  const t = await prepareTransaction(mainAccount, {
    ...createTransaction(account),
    ...transaction,
    recipient: transaction?.recipient || getAbandonSeedAddress(mainAccount.currency.id),
    useAllAmount: true,
  });

  const s = await getTransactionStatus(mainAccount, t);
  return s.amount;
};

export default estimateMaxSpendable;
