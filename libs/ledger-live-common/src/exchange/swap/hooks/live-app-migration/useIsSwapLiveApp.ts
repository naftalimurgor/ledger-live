import { CryptoOrTokenCurrency } from "@ledgerhq/types-cryptoassets";
import { useCallback, useState } from "react";
import { useFeature } from "../../../../featureFlags";
import { useIsCurrencySupported } from "./useIsCurrencySupported";

type Props = {
  currencyFrom?: CryptoOrTokenCurrency;
};

// used to enable the Swap Live App globally
export const useSwapLiveConfig = () => {
  const demoZero = useFeature("ptxSwapLiveAppDemoZero");
  const demoOne = useFeature("ptxSwapLiveAppDemoOne");

  if (demoZero?.enabled === demoOne?.enabled) return null;

  return demoZero?.enabled && !demoOne?.enabled ? demoZero : demoOne?.enabled ? demoOne : null;
};

export function useIsSwapLiveApp({ currencyFrom }: Props) {
  const ptxSwapLiveApp = useSwapLiveConfig();
  const [crashed, setHasCrashed] = useState(false);

  const onLiveAppCrashed = useCallback(() => setHasCrashed(true), []);

  const isEnabled = !!ptxSwapLiveApp?.enabled;
  const { families, currencies } = ptxSwapLiveApp?.params ?? {};

  const isCurrencySupported = useIsCurrencySupported({
    params: {
      families,
      currencies,
    },
    currencyFrom,
    defaultValue: !!isEnabled,
  });

  const liveAppAvailable = Boolean(isEnabled && isCurrencySupported && !crashed);

  return {
    enabled: liveAppAvailable,
    onLiveAppCrashed,
  };
}
