import axios from "axios";
import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ContextLoader } from "./ContextLoader";

export class ForwardDomainLoader implements ContextLoader {
  constructor() {}

  async load(_transaction: Transaction, options: LoaderOptions) {
    const { domain, registry } = options.forwardDomainOptions || {};
    if (!domain || !registry) {
      throw new Error("no domain");
    }

    if (!this.isDomainValid(domain)) {
      return [
        {
          type: "error" as const,
          error: new Error("invalid domain"),
        },
      ];
    }

    const response = await axios.request<{ payload: string }>({
      method: "GET",
      url: `https://nft.api.live.ledger.com/v1/names/ens/forward/${options.forwardDomainOptions?.domain}?challenge=${options.challenge}`,
    });

    return [{ type: "provideDomainName" as const, payload: response.data.payload }];
  }

  // NOTE: duplicata of libs/domain-service/src/utils/index.ts
  private isDomainValid(domain: string) {
    const lengthIsValid = domain.length > 0 && Number(domain.length) < 30;
    const containsOnlyValidChars = new RegExp("^[a-zA-Z0-9\\-\\_\\.]+$").test(domain);

    return lengthIsValid && containsOnlyValidChars;
  }
}
