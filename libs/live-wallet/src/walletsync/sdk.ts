import { Trustchain, TrustchainSDK } from "@ledgerhq/trustchain/types";
import { Data, schema } from "./datatypes/accounts";
import api, { JWT } from "./api";
import Base64 from "base64-js";

export class WalletSyncSDK {
  sdk: TrustchainSDK;
  getCurrentVersion: () => number | undefined;
  saveNewUpdate: (data: Data | null, version: number) => Promise<void>;

  constructor({
    sdk,
    getCurrentVersion,
    saveNewUpdate,
  }: {
    sdk: TrustchainSDK;
    /**
     * returns the current version of the data, if available.
     */
    getCurrentVersion: () => number | undefined;
    /**
     * apply the data over the accounts and we also save the version.
     */
    saveNewUpdate: (data: Data | null, version: number) => Promise<void>;
  }) {
    this.sdk = sdk;
    this.getCurrentVersion = getCurrentVersion;
    this.saveNewUpdate = saveNewUpdate;
  }

  async push(jwt: JWT, trustchain: Trustchain, data: Data): Promise<void> {
    const validated = schema.parse(data);
    const encrypted = await this.sdk.encryptUserData(trustchain, validated);
    const base64 = Base64.fromByteArray(encrypted);
    const version = (this.getCurrentVersion() || 0) + 1;
    const response = await api.uploadData(jwt, "accounts", version, base64);
    switch (response.status) {
      case "updated": {
        await this.saveNewUpdate(null, response.version);
        break;
      }
      case "out-of-sync": {
        // WHAT TO DO? maybe we ignore because in this case we just wait for a pull?
        console.warn("out-of-sync", response);
      }
    }
  }

  async pull(jwt: JWT, trustchain: Trustchain): Promise<void> {
    const response = await api.fetchDataStatus(jwt, "accounts", this.getCurrentVersion());
    switch (response.status) {
      case "no-data": {
        // no data, nothing to do
        break;
      }
      case "up-to-date": {
        // already up to date
        break;
      }
      case "out-of-sync": {
        const decrypted = await this.sdk
          .decryptUserData(trustchain, Base64.toByteArray(response.payload))
          .catch(e => {
            // TODO if we fail to decrypt, it may mean we need to restore trustchain. and if it still fails and on specific error, we will have to eject. figure out how to integrate this in the pull lifecycle.
            throw e;
          });
        const validated = schema.parse(decrypted);
        const version = response.version;
        await this.saveNewUpdate(validated, version);
        break;
      }
    }
  }
}
