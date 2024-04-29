import axios from "axios";
import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ContextLoader } from "./ContextLoader";
import { ContextResponse } from "../models/ContextResponse";

enum ERC721_SUPPORTED_SELECTOR {
  Approve = "0x095ea7b3",
  SetApprovalForAll = "0xa22cb465",
  TransferFrom = "0x23b872dd",
  SafeTransferFrom = "0x42842e0e",
  SafeTransferFromWithData = "0xb88d4fde",
}

enum ERC1155_SUPPORTED_SELECTOR {
  SetApprovalForAll = "0xa22cb465",
  SafeTransferFrom = "0xf242432a",
  SafeBatchTransferFrom = "0x2eb2c2d6",
}

const SUPPORTED_SELECTORS: `0x${string}`[] = [
  ...Object.values(ERC721_SUPPORTED_SELECTOR),
  ...Object.values(ERC1155_SUPPORTED_SELECTOR),
];

export class NftLoader implements ContextLoader {
  constructor() {}

  async load(transaction: Transaction, _options: LoaderOptions) {
    const responses: ContextResponse[] = [];

    if (!transaction.to || !transaction.data || transaction.data === "0x") {
      return [];
    }

    const selector = transaction.data.slice(0, 10) as `0x${string}`;

    if (!this.isSelectorSupported(selector)) {
      return [];
    }

    // EXAMPLE:
    // https://nft.api.live.ledger.com/v1/ethereum/1/contracts/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D/plugin-selector/0x095ea7b3
    const pluginResponse = await axios.request<{ payload: string }>({
      method: "GET",
      url: `https://nft.api.live.ledger.com/v1/ethereum/${transaction.chainId}/contracts/${transaction.to}/plugin-selector/${selector}`,
    });

    if (!pluginResponse || !pluginResponse.data.payload) {
      return [{ type: "error" as const, error: new Error("unexpected empty response") }];
    }

    responses.push({ type: "setPlugin", payload: pluginResponse.data.payload });

    const nftInfoResponse = await axios.request<{ payload: string }>({
      method: "GET",
      url: `https://nft.api.live.ledger.com/v1/ethereum/${transaction.chainId}/contracts/${transaction.to}`,
    });

    if (!nftInfoResponse || !nftInfoResponse.data.payload) {
      return [{ type: "error" as const, error: new Error("no nft metadata") }];
    }

    responses.push({ type: "provideNFTInformation", payload: nftInfoResponse.data.payload });

    return responses;
  }

  private isSelectorSupported(selector: `0x${string}`) {
    return Object.values(SUPPORTED_SELECTORS).includes(selector);
  }
}
