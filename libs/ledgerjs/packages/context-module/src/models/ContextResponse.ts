export type ContextResponse =
  | {
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
