import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
} from 'firebase/auth';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types';
import { breakPair } from './coupleService';

export async function signUp(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    partnerId: null,
    coupleId: null,
    trialStart: serverTimestamp(),
    subscriptionStatus: 'trial',
    pushToken: null,
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

export async function logIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

async function reauthenticate(currentPassword: string): Promise<User> {
  const user = auth.currentUser;
  if (!user?.email) throw new Error('Not signed in.');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const user = await reauthenticate(currentPassword);
  await updatePassword(user, newPassword);
}

/**
 * Permanently deletes the account: unpairs from the partner first (so
 * they land back on partner setup cleanly), removes the user document,
 * then deletes the Firebase Auth user. Requires the current password
 * because Firebase demands a recent login for destructive actions.
 */
export async function deleteAccount(profile: UserProfile, currentPassword: string) {
  const user = await reauthenticate(currentPassword);
  if (profile.coupleId) {
    await breakPair(profile);
  }
  await deleteDoc(doc(db, 'users', user.uid));
  await deleteUser(user);
}

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/email-already-in-use':
      return 'An account already exists with that email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
