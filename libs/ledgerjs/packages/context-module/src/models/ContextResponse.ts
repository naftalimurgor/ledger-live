export type ContextResponse =
  | {
      // TODO: improve typing with Eth class functions + filter
      type:
        | "provideERC20TokenInformation"
        | "provideNFTInformation"
        | "provideDomainName"
        | "setPlugin"
        | "setExternalPlugin";
      payload: string;
    }
  | {
      type: "error";
      error: Error;
    };
