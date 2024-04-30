import { DefaultContextModule } from "./DefaultContextModule";
import { LoaderOptions } from "./models/LoaderOptions";
import { Transaction } from "./models/Transaction";

const contextLoaderStubBuilder = () => {
  return { load: jest.fn() };
};

describe("DefaultContextModule", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should call all fetch method from metadata fetcher", async () => {
    const loader = contextLoaderStubBuilder();
    const contextModule = new DefaultContextModule({ loaders: [loader, loader] });

    await contextModule.getContexts({} as Transaction, {} as LoaderOptions);

    expect(loader.load).toHaveBeenCalledTimes(2);
  });

  it("should return an array of context response", async () => {
    const loader = contextLoaderStubBuilder();
    const responses = [
      [{ type: "provideERC20Info", payload: "payload1" }],
      [
        { type: "provideERC20Info", payload: "payload2" },
        { type: "setPlugin", payload: "payload3" },
      ],
    ];
    jest
      .spyOn(loader, "load")
      .mockResolvedValueOnce(responses[0])
      .mockResolvedValueOnce(responses[1]);
    const contextModule = new DefaultContextModule({ loaders: [loader, loader] });

    const res = await contextModule.getContexts({} as Transaction, {} as LoaderOptions);

    expect(loader.load).toHaveBeenCalledTimes(2);
    expect(res).toEqual(responses.flat());
  });
});
