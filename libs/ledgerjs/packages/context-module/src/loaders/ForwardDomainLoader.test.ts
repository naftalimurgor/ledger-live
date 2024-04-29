import axios from "axios";
import { LoaderOptions } from "../models/LoaderOptions";
import { Transaction } from "../models/Transaction";
import { ForwardDomainLoader } from "./ForwardDomainLoader";

describe("ForwardDomainLoader", () => {
  let loader: ForwardDomainLoader;
  const transaction = {} as Transaction;

  beforeEach(() => {
    jest.restoreAllMocks();
    loader = new ForwardDomainLoader();
  });

  describe("load function", () => {
    it("should throw an error when no domain", async () => {
      const options = {} as LoaderOptions;

      const promise = () => loader.load(transaction, options);

      expect(promise()).rejects.toThrow(new Error("no domain"));
    });

    it("should throw an error when no registry", async () => {
      const options = { forwardDomainOptions: { domain: "domain.eth" } } as LoaderOptions;

      const promise = () => loader.load(transaction, options);

      expect(promise()).rejects.toThrow(new Error("no domain"));
    });

    // TODO: complete all the edge case here
    it("should return an error when domain is not valid", async () => {
      const options = {
        forwardDomainOptions: {
          domain: "hello👋",
          registry: "ens",
        },
      } as LoaderOptions;

      const promise = () => loader.load(transaction, options);

      expect(promise()).resolves.toEqual([
        {
          type: "error" as const,
          error: new Error("invalid domain"),
        },
      ]);
    });

    it("should return a payload", async () => {
      const options = {
        forwardDomainOptions: {
          domain: "hello.eth",
          registry: "ens",
        },
      } as LoaderOptions;
      jest.spyOn(axios, "request").mockResolvedValue({ data: { payload: "payload" } });

      const promise = () => loader.load(transaction, options);

      expect(promise()).resolves.toEqual([
        {
          type: "provideDomainName" as const,
          payload: "payload",
        },
      ]);
    });
  });
});
