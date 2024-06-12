import BigNumber from "bignumber.js";
import { SwapWebManifestIDs, SwapWebProps, useSwapLiveAppManifestID } from "../Form/SwapWebView";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

type Props = {
  swapWebProps?: Partial<SwapWebProps["swapState"]>;
  native: {
    swapError?: Error;
    swapWarning?: Error;
    amountTo?: BigNumber;
  };
};

export type UseQuoteState = {
  amountTo: BigNumber | undefined;
  swapError: Error | undefined;
  swapWarning: Error | undefined;
};

export function useQuoteState({
  swapWebProps,
  native,
}: Props): [UseQuoteState, Dispatch<SetStateAction<UseQuoteState>>] {
  const swapLiveAppManifestID = useSwapLiveAppManifestID();
  const [state, setState] = useState<UseQuoteState>({
    amountTo: undefined,
    swapError: undefined,
    swapWarning: undefined,
  });

  const isDemoOneAndNotErrored = useMemo(
    () => swapLiveAppManifestID?.startsWith(SwapWebManifestIDs.Demo1) && !swapWebProps?.error,
    [swapLiveAppManifestID, swapWebProps?.error],
  );

  useEffect(() => {
    if (!isDemoOneAndNotErrored) {
      setState({
        amountTo: native.amountTo,
        swapError: native.swapError,
        swapWarning: native.swapWarning,
      });
    }
  }, [isDemoOneAndNotErrored, native]);

  return [state, setState];
}
