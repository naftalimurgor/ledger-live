/**
 * This exports all the logic related to the Wallet store.
 * The Wallet store is a store that contains the user data related to accounts.
 * It essentially is the whole user's wallet.
 */
import { Account, AccountLike, AccountRaw, AccountUserData } from "@ledgerhq/types-live";
import { getDefaultAccountName, getDefaultAccountNameForCurrencyIndex } from "./accountName";
import { AddAccountsAction } from "./addAccounts";
import { getCryptoCurrencyById } from "@ledgerhq/cryptoassets/currencies";

export type WalletState = {
  // user's customized name for each account id
  accountNames: Map<string, string>;

  // a set of all the account ids that are starred (NB: token accounts can also be starred)
  starredAccountIds: Set<string>;
};

export const initialState: WalletState = {
  accountNames: new Map(),
  starredAccountIds: new Set(),
};

export enum WalletHandlerType {
  INIT_ACCOUNTS = "INIT_ACCOUNTS",
  SET_ACCOUNT_NAME = "SET_ACCOUNT_NAME",
  SET_ACCOUNT_STARRED = "SET_ACCOUNT_STARRED",
  BULK_SET_ACCOUNT_NAMES = "BULK_SET_ACCOUNT_NAMES",
  ADD_ACCOUNTS = "ADD_ACCOUNTS",
}

export type HandlersPayloads = {
  INIT_ACCOUNTS: { accounts: Account[]; accountsUserData: AccountUserData[] };
  SET_ACCOUNT_NAME: { accountId: string; name: string };
  BULK_SET_ACCOUNT_NAMES: { accountNames: Map<string, string> };
  SET_ACCOUNT_STARRED: { accountId: string; starred: boolean };
  ADD_ACCOUNTS: AddAccountsAction["payload"];
};

type Handlers<State, Types, PreciseKey = true> = {
  [Key in keyof Types]: (
    state: State,
    body: { payload: Types[PreciseKey extends true ? Key : keyof Types] },
  ) => State;
};

export type WalletHandlers<PreciseKey = true> = Handlers<WalletState, HandlersPayloads, PreciseKey>;

export const handlers: WalletHandlers = {
  INIT_ACCOUNTS: (_, { payload: { accountsUserData } }): WalletState => {
    const accountNames = new Map();
    const starredAccountIds = new Set<string>();
    accountsUserData.forEach(accountUserData => {
      accountNames.set(accountUserData.id, accountUserData.name);
      for (const starredId of accountUserData.starredIds) {
        starredAccountIds.add(starredId);
      }
    });
    return { accountNames, starredAccountIds };
  },
  SET_ACCOUNT_NAME: (state, { payload: { accountId, name } }) => {
    const accountNames = new Map(state.accountNames);
    accountNames.set(accountId, name);
    return { ...state, accountNames };
  },
  BULK_SET_ACCOUNT_NAMES: (state, { payload: { accountNames } }) => {
    // merge the new account names with the existing ones
    const newAccountNames = new Map(state.accountNames);
    for (const [accountId, name] of accountNames) {
      newAccountNames.set(accountId, name);
    }
    return { ...state, accountNames: newAccountNames };
  },
  SET_ACCOUNT_STARRED: (state, { payload: { accountId, starred: value } }) => {
    const starredAccountIds = new Set(state.starredAccountIds);
    if (value) {
      starredAccountIds.add(accountId);
    } else {
      starredAccountIds.delete(accountId);
    }
    return { ...state, starredAccountIds };
  },
  ADD_ACCOUNTS: (state, { payload: { allAccounts, editedNames } }) => {
    const accountNames = new Map(state.accountNames);
    for (const account of allAccounts) {
      const name =
        editedNames.get(account.id) ||
        accountNames.get(account.id) ||
        getDefaultAccountName(account);
      accountNames.set(account.id, name);
    }
    return { ...state, accountNames };
  },
};

// actions

export const setAccountName = (accountId: string, name: string) => ({
  type: "SET_ACCOUNT_NAME",
  payload: { accountId, name },
});

export const setAccountNames = (accountNames: Map<string, string>) => ({
  type: "BULK_SET_ACCOUNT_NAMES",
  payload: { accountNames },
});

export const setAccountStarred = (accountId: string, starred: boolean) => ({
  type: "SET_ACCOUNT_STARRED",
  payload: { accountId, starred },
});

export const initAccounts = (accounts: Account[], accountsUserData: AccountUserData[]) => ({
  type: "INIT_ACCOUNTS",
  payload: { accounts, accountsUserData },
});

// Local Selectors

export const accountNameSelector = (
  state: WalletState,
  { accountId }: { accountId: string },
): string | undefined => state.accountNames.get(accountId);

export const accountNameWithDefaultSelector = (state: WalletState, account: AccountLike): string =>
  state.accountNames.get(account.id) || getDefaultAccountName(account);

export const isStarredAccountSelector = (
  state: WalletState,
  { accountId }: { accountId: string },
): boolean => state.starredAccountIds.has(accountId);

/**
 * Recreate an AccountUserData from the store.
 * it is used to transport all data related to a main account.
 * but the data isn't used internally for performance reason.
 */
export const accountUserDataExportSelector = (
  state: WalletState,
  { account }: { account: Account },
): AccountUserData => {
  const id = account.id;
  const name = state.accountNames.get(id) || getDefaultAccountName(account);
  const starredIds = [];
  if (state.starredAccountIds.has(id)) {
    starredIds.push(id);
  }
  for (const t of account.subAccounts || []) {
    if (state.starredAccountIds.has(t.id)) {
      starredIds.push(t.id);
    }
  }
  return { id, name, starredIds };
};

export const accountRawToAccountUserData = (raw: AccountRaw): AccountUserData => {
  const { id } = raw;
  const name =
    raw.name ||
    getDefaultAccountNameForCurrencyIndex({
      currency: getCryptoCurrencyById(raw.currencyId),
      index: raw.index,
    });
  const starredIds = [];
  if (raw.starred) {
    starredIds.push(raw.id);
  }
  for (const t of raw.subAccounts || []) {
    if (t.starred) {
      starredIds.push(t.id);
    }
  }
  return { id, name, starredIds };
};
