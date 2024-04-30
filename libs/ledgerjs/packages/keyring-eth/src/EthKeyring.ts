import { Transaction } from "ethers";
import Transport from "@ledgerhq/hw-transport";
import AppBinding from "@ledgerhq/hw-app-eth";
import { ForwardDomainOptions } from "@ledgerhq/context-module/lib/models/LoaderOptions";
import { EIP712Message } from "../../types-live/lib";

type SignTransactionArgs = {
  derivationPath: string;
  transaction: Transaction;
  options?: { forwardDomainOptions?: ForwardDomainOptions }; // TODO: TBD
};

type SignMessageArgs = {
  derivationPath: string;
  message: string | EIP712Message; // EIP-712/EIP-191
  options: {
    type: "EIP-191" | "EIP-712";
    context: any; // TODO: TBD
  };
};

type GetAddressArgs = {
  derivationPath: string;
  options: object; //TBD needVerify
};

export interface EthKeyring {
  signTransaction(args: SignTransactionArgs): Promise<EcdsaSignature>;
  signMessage(args: SignMessageArgs): Promise<EcdsaSignature>;
  getAddress(args: GetAddressArgs): Promise<{ address: string; options: string }>;
}

export type EcdsaSignature = { r: `0x${string}`; s: `0x${string}`; v: number };

export class DefaultEthKeyring implements EthKeyring {
  private _appBinding: AppBinding;

  constructor(transport: Transport) {
    this._appBinding = new AppBinding(transport);
  }

  public async signTransaction({
    derivationPath: _derivationPath,
    transaction: _transaction,
    options: _options,
  }: SignTransactionArgs) {
    return Promise.resolve({ r: "0x", s: "0x", v: 0 } as EcdsaSignature);
  }

  public async signMessage({
    derivationPath: _derivationPath,
    message: _message,
    options: _options,
  }: SignMessageArgs) {
    return Promise.resolve({ r: "0x", s: "0x", v: 0 } as EcdsaSignature);
  }

  public async getAddress({ derivationPath: _derivationPath, options: _options }: GetAddressArgs) {
    return Promise.resolve({ address: "", options: "" });
  }
}
