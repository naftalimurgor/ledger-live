import axios from "axios";
import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { TokenLoader } from "./TokenLoader";

describe("TokenLoader", () => {
  let loader: TokenLoader;

  beforeEach(() => {
    jest.restoreAllMocks();
    loader = new TokenLoader();
  });

  describe("load function", () => {
    it("should return an empty array if no dest", async () => {
      const options = {} as LoaderOptions;
      const transaction = { to: undefined, data: "0x01" } as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return an empty array if undefined data", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: undefined,
      } as unknown as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return an empty array if empty data", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x",
      } as unknown as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return an empty array if selector not supported", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x095ea7b20000000000000",
      } as unknown as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return a correct response", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x095ea7b30000000000",
        chainId: 1,
      } as unknown as Transaction;
      const mockRequest = jest.fn(() => Promise.resolve({ data: [{ live_signature: "payload" }] }));
      jest.spyOn(axios, "request").mockImplementationOnce(mockRequest);

      const result = await loader.load(transaction, options);

      expect(result).toEqual([{ type: "provideERC20TokenInformation", payload: "payload" }]);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { chain_id: transaction.chainId, search: transaction.to },
        }),
      );
    });
  });
});
