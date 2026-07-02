import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Spark-plan friendly image handling: instead of Firebase Storage (which
 * requires the Blaze plan on new projects), user photos are resized and
 * compressed on-device, then stored inline in the wish document as a
 * base64 data URI.
 *
 * A 600px JPEG at 50% quality is typically 40–80 KB — well under
 * Firestore's 1 MB document limit and cheap to sync.
 */
const MAX_WIDTH = 600;
const JPEG_QUALITY = 0.5;
// Leave generous headroom under Firestore's 1 MiB document limit.
const MAX_BASE64_LENGTH = 700_000;

export async function prepareWishImage(localUri: string): Promise<string> {
  let quality = JPEG_QUALITY;
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await manipulateAsync(
      localUri,
      [{ resize: { width: MAX_WIDTH } }],
      { compress: quality, format: SaveFormat.JPEG, base64: true }
    );
    if (result.base64 && result.base64.length <= MAX_BASE64_LENGTH) {
      return `data:image/jpeg;base64,${result.base64}`;
    }
    quality = quality / 2;
  }
  throw new Error('This photo is too large — try a smaller image.');
}
