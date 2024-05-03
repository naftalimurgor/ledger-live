import test from "../../fixtures/common";
import { expect } from "@playwright/test";
import { Layout } from "../../models/Layout";
import { AccountsPage } from "../../models/AccountsPage";
import { AccountPage } from "../../models/AccountPage";
import { SendModal } from "../../models/SendModal";
import { Modal } from "../../models/Modal";
import { Account } from "../../enum/Account";
//import { Currency } from "../../enum/Currency";
//import { DeviceLabels } from "tests/enum/DeviceLabels";
import { Transaction } from "../../models/Transaction";
import {
  Device,
  specs,
  startSpeculos,
  stopSpeculos,
  pressRightUntil,
  pressBoth,
  //verifyAddress,
  //verifyAmount,
} from "../../utils/speculos";

test.use({ userdata: "speculos" });

let device: Device | undefined;

test.afterEach(async () => {
  await stopSpeculos(device);
});

const transactions = [
  new Transaction(Account.BTC_1, Account.BTC_2, "0.00001", "medium"),
  new Transaction(Account.ETH_1, Account.ETH_2, "0.00001", "medium"),
  new Transaction(Account.SOL_1, Account.SOL_2, "0.00001", "medium"),
  new Transaction(Account.DOT_1, Account.DOT_2, "0.00001", "medium"),
  new Transaction(Account.TRX_1, Account.TRX_2, "0.00001", "medium"),
];

test.describe.parallel("Send Reject @smoke", () => {
  for (const transaction of transactions) {
    test(`[${transaction.accountToDebit.accountName}] send Reject @smoke`, async ({ page }) => {
      const layout = new Layout(page);
      const accountsPage = new AccountsPage(page);
      const accountPage = new AccountPage(page);
      const sendModal = new SendModal(page);
      const modal = new Modal(page);
      device = await startSpeculos(
        test.name,
        specs[transaction.accountToDebit.currency.deviceLabel.replace(/ /g, "_")],
      );
      const receiveAddress = transaction.accountToCredit.address;

      await test.step(`Navigate to account`, async () => {
        await layout.goToAccounts();
        await accountsPage.navigateToAccountByName(transaction.accountToDebit.accountName);
      });

      await test.step(`send`, async () => {
        await accountPage.sendButton.click();
        await sendModal.fillRecipient(receiveAddress);
        await sendModal.continueButton.click();
        await modal.cryptoAmountField.fill(transaction.amount);
        await sendModal.countinueSendAmount();
        await expect(sendModal.verifyTotalDebit).toBeVisible();
        await expect(sendModal.checkAddress(receiveAddress)).toBeVisible();
        await expect(
          sendModal.checkAmount(transaction.accountToCredit.currency.uiLabel),
        ).toBeVisible();
        await sendModal.continueButton.click();
      });

      await test.step(`[${transaction.accountToDebit.accountName}] Reject send on device`, async () => {
        await expect(sendModal.checkDevice).toBeVisible();
        // DOT: address then amount
        // Others: Amount then Address
        /*const amountScreen = await pressRightUntil(
          transaction.accountToCredit.currency.sendPattern[0],
        );
        expect(verifyAmount(transaction.amount, amountScreen)).toBe(true);
        const addressScreen = await pressRightUntil(
          transaction.accountToCredit.currency.sendPattern[1],
        );
        expect(verifyAddress(receiveAddress, addressScreen)).toBe(true);*/
        await pressRightUntil(transaction.accountToDebit.currency.sendPattern[3]);
        await pressBoth();
        await expect(sendModal.retryButton).toBeVisible(); // TODO: Change method ?
      });
    });
  }
});
