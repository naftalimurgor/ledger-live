import { Observable } from "rxjs";
import { log } from "@ledgerhq/logs";
import { DeployUtil } from "casper-js-sdk";
import CasperApp from "@zondax/ledger-casper";
import { AccountBridge } from "@ledgerhq/types-live";
import { encodeOperationId } from "@ledgerhq/coin-framework/operation";
import { casperGetCLPublicKey, getAddress } from "./bridge/bridgeHelpers/addresses";
import { createNewDeploy } from "./bridge/bridgeHelpers/txn";
import { withDevice } from "../../hw/deviceAccess";
import { CasperOperation, Transaction } from "./types";
import { getPath, isError } from "./msc-utils";

export const signOperation: AccountBridge<Transaction>["signOperation"] = ({
  account,
  deviceId,
  transaction,
}) =>
  withDevice(deviceId)(
    transport =>
      new Observable(o => {
        async function main() {
          // log("debug", "[signOperation] start fn");

          const { recipient, amount } = transaction;
          const { id: accountId } = account;
          const { address, derivationPath } = getAddress(account);

          const casper = new CasperApp(transport);

          const fee = transaction.fees;

          const deploy = createNewDeploy(
            address,
            recipient,
            transaction.amount,
            transaction.fees,
            transaction.transferId,
          );
          // Serialize tx
          const deployBytes = DeployUtil.deployToBytes(deploy);

          log("debug", `[signOperation] serialized deploy: [${deployBytes.toString()}]`);

          o.next({
            type: "device-signature-requested",
          });

          // Sign by device
          const result = await casper.sign(getPath(derivationPath), Buffer.from(deployBytes));
          isError(result);

          o.next({
            type: "device-signature-granted",
          });

          // signature verification
          const deployHash = deploy.hash.toString();
          const signature = result.signatureRS;

          // sign deploy object
          const signedDeploy = DeployUtil.setSignature(
            deploy,
            signature,
            casperGetCLPublicKey(address),
          );

          const operation: CasperOperation = {
            id: encodeOperationId(accountId, deployHash, "OUT"),
            hash: deployHash,
            type: "OUT",
            senders: [address],
            recipients: [recipient],
            accountId,
            value: amount.plus(fee),
            fee,
            blockHash: null,
            blockHeight: null,
            date: new Date(),
            extra: {
              transferId: transaction.transferId,
            },
          };

          o.next({
            type: "signed",
            signedOperation: {
              operation,
              signature: JSON.stringify(DeployUtil.deployToJson(signedDeploy)),
            },
          });
        }

        main().then(
          () => o.complete(),
          e => o.error(e),
        );
      }),
  );
