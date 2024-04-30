import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ExternalPluginLoader } from "./ExternalPluginLoader";

describe("ExternalPluginLoader", () => {
  let loader: ExternalPluginLoader;
  const transaction = {} as Transaction;

  beforeEach(() => {
    jest.restoreAllMocks();
    loader = new ExternalPluginLoader();
  });

  describe("load function", () => {
    it("should return an empty array", async () => {
      const options = {} as LoaderOptions;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });
  });
});
