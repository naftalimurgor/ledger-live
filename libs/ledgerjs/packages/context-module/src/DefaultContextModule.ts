import { ContextModule } from "./ContextModule";
import { ContextLoader } from "./loaders/ContextLoader";
import { ContextResponse } from "./models/ContextResponse";
import { LoaderOptions } from "./models/LoaderOptions";
import { Transaction } from "./models/Transaction";

type DefaultContextModuleConstructorArgs = {
  loaders: ContextLoader[];
};

export class DefaultContextModule implements ContextModule {
  private _loaders: ContextLoader[];

  constructor({ loaders: loaders }: DefaultContextModuleConstructorArgs) {
    this._loaders = loaders;
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
