import { WishDraft } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type PartnerStackParamList = {
  PartnerSetup: undefined;
  InvitePartner: undefined;
  JoinPartner: undefined;
};

export type TabsParamList = {
  Home: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  AddWish: undefined;
  LinkProcessing: { url: string; sharedTitle?: string; fromShare?: boolean };
  ManualWish: { prefill?: Partial<WishDraft> } | undefined;
  WishDetail: { wishId: string };
  CompletedWishes: undefined;
  Subscription: undefined;
};
