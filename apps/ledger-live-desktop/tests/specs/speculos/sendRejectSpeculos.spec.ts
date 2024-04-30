import test from "../../fixtures/common";
import { expect } from "@playwright/test";
import { Layout } from "../../models/Layout";
import { AccountsPage } from "../../models/AccountsPage";
import { AccountPage } from "../../models/AccountPage";
import { SendModal } from "../../models/SendModal";
import { Modal } from "../../models/Modal";
import { Currency } from "../../enum/Currency";
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

const currencies: Currency[] = [Currency.];

test.describe.parallel("Send Reject @smoke", () => {
  for (const currency of currencies) {
    test(`[${currency.uiName}] send Reject @smoke`, async ({ page }) => {
      const layout = new Layout(page);
      const accountsPage = new AccountsPage(page);
      const accountPage = new AccountPage(page);
      const sendModal = new SendModal(page);
      const modal = new Modal(page);
      device = await startSpeculos(test.name, specs[currency.uiName.replace(/ /g, "_")]);

      await test.step(`Navigate to account`, async () => {
        await layout.goToAccounts();
        await accountsPage.navigateToAccountByName(`${currency.uiName} 1`);
      });

      await test.step(`send`, async () => {
        await accountPage.sendButton.click();
        const address = currency.address2;
        await sendModal.fillRecipient(address);
        await sendModal.continueButton.click();
        await modal.cryptoAmountField.fill("0.00001");
        await sendModal.countinueSendAmount();
        await expect(sendModal.verifyTotalDebit).toBeVisible();
        await expect(sendModal.checkAddress(currency.address2)).toBeVisible();
        await expect(sendModal.checkAmount(currency.deviceName)).toBeVisible();
        await sendModal.continueButton.click();
      });

      await test.step(`[${currency.uiName}] Validate message on device`, async () => {
        await expect(sendModal.checkDevice).toBeVisible();
        //const amountScreen = await pressRightUntil(currency.sendPattern[0]);
        //expect(verifyAmount("0.00001", amountScreen)).toBe(true);
        //const addressScreen = await pressRightUntil(currency.sendPattern[1]);
        //expect(verifyAddress(currency.address2, addressScreen)).toBe(true);
        await pressRightUntil(currency.sendPattern[3]);
        await pressBoth();
        await expect(sendModal.checkTransactionDenied).toBeVisible();
      });
    });
  }
});
