import React, { useCallback } from "react";
import { JWT, MemberCredentials, Trustchain } from "@ledgerhq/trustchain/types";
import { Actionable } from "./Actionable";
import { useSDK } from "../context";
import { runWithDevice } from "../device";

export function AppGetOrCreateTrustchain({
  deviceJWT,
  memberCredentials,
  trustchain,
  setTrustchain,
  setDeviceJWT,
}: {
  deviceJWT: JWT | null;
  memberCredentials: MemberCredentials | null;
  trustchain: Trustchain | null;
  setTrustchain: (trustchain: Trustchain | null) => void;
  setDeviceJWT: (deviceJWT: JWT | null) => void;
}) {
  const sdk = useSDK();

  const action = useCallback(
    (deviceJWT: JWT, memberCredentials: MemberCredentials) =>
      runWithDevice(transport =>
        sdk
          .getOrCreateTrustchain(transport, deviceJWT, memberCredentials)
          .then(({ jwt, trustchain }) => {
            setDeviceJWT(jwt);
            return trustchain;
          }),
      ),
    [sdk, setDeviceJWT],
  );

  const valueDisplay = useCallback((trustchain: Trustchain) => trustchain.rootId, []);

  return (
    <Actionable
      buttonTitle="sdk.getOrCreateTrustchain"
      inputs={deviceJWT && memberCredentials ? [deviceJWT, memberCredentials] : null}
      action={action}
      valueDisplay={valueDisplay}
      value={trustchain}
      setValue={setTrustchain}
      buttonProps={{
        "data-tooltip-id": "tooltip",
        "data-tooltip-content":
          "creates a new Trustchain or fetches an existing one. (device required)",
      }}
    />
  );
}
