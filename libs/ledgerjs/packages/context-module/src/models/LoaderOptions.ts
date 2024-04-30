export type LoaderOptions = {
  challenge: string;
  forwardDomainOptions?: ForwardDomainOptions;
};

export type ForwardDomainOptions = { domain: string; registry: "ens" };
