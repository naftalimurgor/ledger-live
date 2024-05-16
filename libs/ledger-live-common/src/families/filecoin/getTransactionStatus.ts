import {
  AmountRequired,
  FeeNotLoaded,
  InvalidAddress,
  NotEnoughBalance,
  RecipientRequired,
} from "@ledgerhq/errors";
import { AccountBridge } from "@ledgerhq/types-live";
import { Transaction, TransactionStatus } from "./types";
import { validateAddress } from "./bridge/utils/addresses";
import { getAddress } from "./bridge/utils/utils";
import { calculateEstimatedFees } from "./utils";

export const getTransactionStatus: AccountBridge<Transaction>["getTransactionStatus"] = async (
  a,
  t,
) => {
  // log("debug", "[getTransactionStatus] start fn");

  const errors: TransactionStatus["errors"] = {};
  const warnings: TransactionStatus["warnings"] = {};

  const { balance } = a;
  const { address } = getAddress(a);
  const { recipient, useAllAmount, gasPremium, gasFeeCap, gasLimit } = t;
  let { amount } = t;

  const invalidAddressErr = new InvalidAddress(undefined, {
    currencyName: a.currency.name,
  });
  if (!recipient) errors.recipient = new RecipientRequired();
  else if (!validateAddress(recipient).isValid) errors.recipient = invalidAddressErr;
  else if (!validateAddress(address).isValid) errors.sender = invalidAddressErr;

  if (gasFeeCap.eq(0) || gasPremium.eq(0) || gasLimit.eq(0)) errors.gas = new FeeNotLoaded();

  // This is the worst case scenario (the tx won't cost more than this value)
  const estimatedFees = calculateEstimatedFees(gasFeeCap, gasLimit);

  let totalSpent;
  if (useAllAmount) {
    totalSpent = a.spendableBalance;
    amount = totalSpent.minus(estimatedFees);
    if (amount.lte(0) || totalSpent.gt(balance)) {
      errors.amount = new NotEnoughBalance();
    }
  } else {
    totalSpent = amount.plus(estimatedFees);
    if (amount.eq(0)) {
      errors.amount = new AmountRequired();
    } else if (totalSpent.gt(a.spendableBalance)) errors.amount = new NotEnoughBalance();
  }

  // log("debug", "[getTransactionStatus] finish fn");

  return {
    errors,
    warnings,
    estimatedFees,
    amount,
    totalSpent,
  };
};
