import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Uploads a local image (from expo-image-picker) to Firebase Storage
 * and returns its public download URL.
 */
export async function uploadWishImage(
  coupleId: string,
  localUri: string
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const filename = `wishes/${coupleId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.jpg`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}
