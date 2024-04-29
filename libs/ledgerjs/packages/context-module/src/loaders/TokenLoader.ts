import axios from "axios";
import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ContextLoader } from "./ContextLoader";

export enum ERC20_SUPPORTED_SELECTORS {
  Approve = "0x095ea7b3",
  Transfer = "0xa9059cbb",
}

const SUPPORTED_SELECTORS: `0x${string}`[] = Object.values(ERC20_SUPPORTED_SELECTORS);

export class TokenLoader implements ContextLoader {
  constructor() {}

  async load(transaction: Transaction, _options: LoaderOptions) {
    if (!transaction.to || !transaction.data || transaction.data === "0x") {
      return [];
    }

    const selector = transaction.data.slice(0, 10) as `0x${string}`;

    if (!this.isSelectorSupported(selector)) {
      return [];
    }

    const response = await axios.request<[{ live_signature: string }]>({
      method: "GET",
      url: `https://crypto-assets-service.api.ledger.com/v1/tokens`,
      params: { search: transaction.to, chain_id: transaction.chainId },
    });

    return [
      {
        type: "provideERC20TokenInformation" as const,
        payload: response.data.at(0)!.live_signature,
      },
    ];
  }

  private isSelectorSupported(selector: `0x${string}`) {
    return Object.values(SUPPORTED_SELECTORS).includes(selector);
  }
}
