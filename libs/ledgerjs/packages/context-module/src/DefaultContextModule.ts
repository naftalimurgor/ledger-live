import { ContextModule } from "./ContextModule";
import { ContextLoader } from "./loaders/ContextLoader";
import { ForwardDomainLoader } from "./loaders/ForwardDomainLoader";
import { NftLoader } from "./loaders/NftLoader";
import { TokenLoader } from "./loaders/TokenLoader";
import { ContextResponse } from "./models/ContextResponse";
import { LoaderOptions } from "./models/LoaderOptions";
import { Transaction } from "./models/Transaction";

type DefaultContextModuleConstructorArgs = {
  loaders: ContextLoader[];
};

export class DefaultContextModule implements ContextModule {
  private _loaders: ContextLoader[];

  constructor(args?: DefaultContextModuleConstructorArgs) {
    this._loaders = args?.loaders ?? [
      new ForwardDomainLoader(),
      new NftLoader(),
      new TokenLoader(),
    ];
  }

  public async getContexts(
    transaction: Transaction,
    options: LoaderOptions,
  ): Promise<ContextResponse[]> {
    const promises = this._loaders.map(fetcher => fetcher.load(transaction, options));
    const responses = (await Promise.all(promises)).flat();

    return responses;
  }
}
