import Eth from "@ledgerhq/hw-app-eth";
import { BigNumber } from "bignumber.js";
import { ethers, providers } from "ethers";
import { killSpeculos, spawnSigner } from "@ledgerhq/coin-tester/docker";
import { encodeTokenAccountId } from "@ledgerhq/coin-framework/account/index";
import { executeScenario, Scenario, ScenarioTransaction } from "@ledgerhq/coin-tester/main";
import { getCryptoCurrencyById } from "@ledgerhq/cryptoassets/currencies";
import { buildAccountBridge, buildCurrencyBridge } from "../../bridge/js";
import { makeAccount } from "../fixtures/common.fixtures";
import { EvmNftTransaction, Transaction as EvmTransaction } from "../../types";
import resolver from "../../hw-getAddress";
import { setCoinConfig } from "../../config";
import {
  ethereum,
  ERC20Interface,
  USDC_ON_ETHEREUM,
  ERC721Interface,
  ERC1155Interface,
  USDC_ON_POLYGON,
  polygon,
} from "./helpers";
import { clearExplorerAppendix, getLogs, setBlock } from "./indexer";
import { killAnvil, spawnAnvil } from "./docker";

const scenarioSendTransaction: ScenarioTransaction<Partial<EvmTransaction>> = {
  name: "Send ethereum",
  amount: new BigNumber(100),
  recipient: "0x6bfD74C0996F269Bcece59191EFf667b3dFD73b9",
};

// use function createTransaction
const scenarioUSDCTransaction: ScenarioTransaction<Partial<EvmTransaction>> = {
  name: "Send USDC",
  amount: new BigNumber(100),
  recipient: "0x6bfD74C0996F269Bcece59191EFf667b3dFD73b9",
  subAccountId: encodeTokenAccountId(
    "js:2:ethereum:0x3313797c7B45F34c56Bdedc0179992A4d435AF25:",
    USDC_ON_ETHEREUM,
  ),
};

const scenarioERC721Transaction: ScenarioTransaction<Partial<EvmTransaction & EvmNftTransaction>> =
  {
    name: "Send NFT",
    recipient: "0x6bfD74C0996F269Bcece59191EFf667b3dFD73b9",
    mode: "erc721",
    nft: {
      tokenId: "3368",
      contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      quantity: new BigNumber(1),
      collectionName: "Bored Ape",
    },
  };

const scenarioERC1155Transaction: ScenarioTransaction<Partial<EvmTransaction & EvmNftTransaction>> =
  {
    name: "Send ERC1155",
    recipient: "0x6bfD74C0996F269Bcece59191EFf667b3dFD73b9",
    mode: "erc1155",
    nft: {
      tokenId: "951",
      collectionName: "Clone X",
      // EIP55 checksum of 0x348fc118bcc65a92dc033a951af153d14d945312
      contract: "0x348FC118bcC65a92dC033A951aF153d14D945312",
      quantity: new BigNumber(2),
    },
  };

const defaultNanoAppVersion = { firmware: "2.2.3" as const, version: "1.10.4" as const };
const scenarioEthereum: Scenario<EvmTransaction> = {
  name: "Ledger Live Basic ETH Transactions",
  setup: async () => {
    const [{ transport, onSignerConfirmation }] = await Promise.all([
      spawnSigner(
        "speculos",
        `/${defaultNanoAppVersion.firmware}/Ethereum/app_${defaultNanoAppVersion.version}.elf`,
      ),
      spawnAnvil("https://rpc.ankr.com/eth"),
    ]);

    const provider = new providers.StaticJsonRpcProvider("http://127.0.0.1:8545");
    const signerContext = (deviceId: string, fn: any): any => fn(new Eth(transport));

    setCoinConfig(() => ({
      info: {
        status: {
          type: "active",
        },
        gasTracker: {
          type: "ledger",
          explorerId: "eth",
        },
        node: {
          type: "external",
          uri: "http://127.0.0.1:8545",
        },
        explorer: {
          type: "ledger",
          explorerId: "eth",
        },
      },
    }));

    const currencyBridge = buildCurrencyBridge(signerContext);
    const accountBridge = buildAccountBridge(signerContext);
    const getAddress = resolver(signerContext);
    const { address } = await getAddress("", {
      path: "44'/60'/0'/0/0",
      currency: getCryptoCurrencyById("ethereum"),
      derivationMode: "",
    });

    const scenarioAccount = makeAccount(address, ethereum);

    await setBlock();

    // USDC
    const addressToImpersonateBinance = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"; // Binance
    await provider.send("anvil_impersonateAccount", [addressToImpersonateBinance]);
    const sendUSDC = {
      from: addressToImpersonateBinance,
      to: USDC_ON_ETHEREUM.contractAddress,
      data: ERC20Interface.encodeFunctionData("transfer", [
        address,
        ethers.utils.parseUnits("100", USDC_ON_ETHEREUM.units[0].magnitude),
      ]),
      value: ethers.BigNumber.from(0).toHexString(),
      gas: ethers.BigNumber.from(1_000_000).toHexString(),
      type: "0x0",
      gasPrice: (await provider.getGasPrice()).toHexString(),
      nonce: "0x" + (await provider.getTransactionCount(addressToImpersonateBinance)).toString(16),
      chainId: "0x" + (await provider.getNetwork()).chainId.toString(16),
    };

    const hash = await provider.send("eth_sendTransaction", [sendUSDC]);
    await provider.send("anvil_stopImpersonatingAccount", [addressToImpersonateBinance]);
    await provider.waitForTransaction(hash);

    // Bored Ape
    const addressToImpersonateBoredApe = "0x440Bcc7a1CF465EAFaBaE301D1D7739cbFe09dDA";
    await provider.send("anvil_impersonateAccount", [addressToImpersonateBoredApe]);
    const sendBoredApe = {
      from: addressToImpersonateBoredApe,
      to: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      data: ERC721Interface.encodeFunctionData("transferFrom", [
        addressToImpersonateBoredApe,
        address,
        "3368",
      ]),
      value: ethers.BigNumber.from(0).toHexString(),
      gas: ethers.BigNumber.from(1_000_000).toHexString(),
      type: "0x0",
      gasPrice: (await provider.getGasPrice()).toHexString(),
      nonce: "0x" + (await provider.getTransactionCount(addressToImpersonateBoredApe)).toString(16),
      chainId: "0x" + (await provider.getNetwork()).chainId.toString(16),
    };

    const boredApeTxHash = await provider.send("eth_sendTransaction", [sendBoredApe]);
    await provider.send("anvil_stopImpersonatingAccount", [addressToImpersonateBoredApe]);
    await provider.waitForTransaction(boredApeTxHash);

    // send CloneX
    const addressToImpersonateCloneX = "0xa3cd1123f4860C0cC512C775Ab6DB6A3E3d1B1Ee";
    await provider.send("anvil_impersonateAccount", [addressToImpersonateCloneX]);
    const sendCloneX = {
      from: addressToImpersonateCloneX,
      to: "0x348fc118bcc65a92dc033a951af153d14d945312",
      data: ERC1155Interface.encodeFunctionData("safeTransferFrom", [
        addressToImpersonateCloneX,
        address,
        "951",
        2,
        "0x",
      ]),
      value: ethers.BigNumber.from(0).toHexString(),
      gas: ethers.BigNumber.from(1_000_000).toHexString(),
      type: "0x0",
      gasPrice: (await provider.getGasPrice()).toHexString(),
      nonce: "0x" + (await provider.getTransactionCount(addressToImpersonateCloneX)).toString(16),
      chainId: "0x" + (await provider.getNetwork()).chainId.toString(16),
    };

    const cloneXTxHash = await provider.send("eth_sendTransaction", [sendCloneX]);
    await provider.send("anvil_stopImpersonatingAccount", [addressToImpersonateCloneX]);
    await provider.waitForTransaction(cloneXTxHash);

    await getLogs();

    return { currencyBridge, accountBridge, account: scenarioAccount, onSignerConfirmation };
  },
  transactions: [
    scenarioSendTransaction,
    scenarioUSDCTransaction,
    scenarioERC721Transaction,
    scenarioERC1155Transaction,
  ],
  teardown: async () => {
    await Promise.all([killSpeculos(), killAnvil()]);
    clearExplorerAppendix();
  },
};

const scenarioPolygon: Scenario<EvmTransaction> = {
  name: "Ledger Live Basic Polygon Transactions",
  setup: async () => {
    const [{ transport, onSignerConfirmation }] = await Promise.all([
      spawnSigner(
        "speculos",
        `/${defaultNanoAppVersion.firmware}/Ethereum/app_${defaultNanoAppVersion.version}.elf`,
      ),
      spawnAnvil("https://rpc.ankr.com/polygon"),
    ]);

    const provider = new providers.StaticJsonRpcProvider("http://127.0.0.1:8545");
    const signerContext = (deviceId: string, fn: any): any => fn(new Eth(transport));

    setCoinConfig(() => ({
      info: {
        status: {
          type: "active",
        },
        node: {
          type: "external",
          uri: "http://127.0.0.1:8545",
        },
        gasTracker: {
          type: "ledger",
          explorerId: "matic",
        },
        explorer: {
          type: "ledger",
          explorerId: "matic",
        },
      },
    }));

    const currencyBridge = buildCurrencyBridge(signerContext);
    const accountBridge = buildAccountBridge(signerContext);
    const getAddress = resolver(signerContext);
    const { address } = await getAddress("", {
      path: "44'/60'/0'/0/0",
      currency: getCryptoCurrencyById("polygon"),
      derivationMode: "",
    });

    const scenarioAccount = makeAccount(address, polygon);

    await setBlock();

    const addressToImpersonate = "0x45dDa9cb7c25131DF268515131f647d726f50608"; // Random owner of 8M USDC
    await provider.send("anvil_impersonateAccount", [addressToImpersonate]);

    const sendUSDC = {
      from: addressToImpersonate,
      to: USDC_ON_POLYGON.contractAddress,
      data: ERC20Interface.encodeFunctionData("transfer", [
        address,
        ethers.utils.parseUnits("100", USDC_ON_POLYGON.units[0].magnitude),
      ]),
      value: ethers.BigNumber.from(0).toHexString(),
      gas: ethers.BigNumber.from(1_000_000).toHexString(),
      type: "0x0",
      gasPrice: (await provider.getGasPrice()).toHexString(),
      nonce: "0x" + (await provider.getTransactionCount(addressToImpersonate)).toString(16),
      chainId: "0x" + (await provider.getNetwork()).chainId.toString(16),
    };

    const hash = await provider.send("eth_sendTransaction", [sendUSDC]);
    await provider.send("anvil_stopImpersonatingAccount", [addressToImpersonate]);

    await provider.waitForTransaction(hash);
    await getLogs();

    return { currencyBridge, accountBridge, account: scenarioAccount, onSignerConfirmation };
  },
  transactions: [
    {
      name: "Send 1 Matic",
      amount: new BigNumber(ethers.utils.parseEther("1").toString()),
      recipient: ethers.constants.AddressZero,
    },
    {
      name: "Send 10 Matic",
      amount: new BigNumber(ethers.utils.parseEther("10").toString()),
      recipient: ethers.constants.AddressZero,
    },
    {
      name: "Send 100 USDC",
      recipient: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503", // Random Receiver
      amount: new BigNumber(
        ethers.utils.parseUnits("100", USDC_ON_POLYGON.units[0].magnitude).toString(),
      ),
      subAccountId: encodeTokenAccountId(
        "js:2:polygon:0x2FBde3Ac8F867e5ED06e4C7060d0df00D87E2C35:",
        USDC_ON_POLYGON,
      ),
    },
  ],
  teardown: () => {
    clearExplorerAppendix();
  },
};

jest.setTimeout(600_000); // 10 Min
global.console = require("console");

afterAll(async () => {
  await Promise.all([killSpeculos(), killAnvil()]);
});

describe("EVM Deterministic Tester", () => {
  it("scenario Ethereum", async () => {
    try {
      await executeScenario(scenarioEthereum);
    } catch (e) {
      if (e != "done") {
        await Promise.all([killSpeculos(), killAnvil()]);
        throw e;
      }
    }
  });

  it("scenario polygon", async () => {
    try {
      await executeScenario(scenarioPolygon);
    } catch (e) {
      if (e != "done") {
        await Promise.all([killSpeculos(), killAnvil()]);
        throw e;
      }
    }
  });
});

["exit", "SIGINT", "SIGQUIT", "SIGTERM", "SIGUSR1", "SIGUSR2", "uncaughtException"].map(e =>
  process.on(e, async () => {
    await Promise.all([killSpeculos(), killAnvil()]);
  }),
);
