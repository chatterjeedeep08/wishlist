const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]{2,}/i;

export interface FieldErrors {
  [field: string]: string | undefined;
}

export function validateSignup(fields: {
  name: string;
  email: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const name = fields.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (name.length > 40) errors.name = 'Name must be at most 40 characters.';

  errors.email = validateEmail(fields.email);
  errors.password = validatePassword(fields.password);
  return errors;
}

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Email is required.';
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address.';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (password.length > 128) return 'Password is too long.';
  return undefined;
}

export function validateWish(fields: {
  title: string;
  type: string | null;
  link?: string | null;
  price?: string | null;
}): FieldErrors {
  const errors: FieldErrors = {};
  const title = fields.title.trim();
  if (!title) errors.title = 'Give your wish a title.';
  else if (title.length < 2) errors.title = 'Title must be at least 2 characters.';
  else if (title.length > 100) errors.title = 'Title must be at most 100 characters.';

  if (!fields.type) errors.type = 'Pick a category.';

  const link = fields.link?.trim();
  if (link && !URL_RE.test(link)) {
    errors.link = 'Links must start with http:// or https://';
  }

  const price = fields.price?.trim();
  if (price && price.length > 30) errors.price = 'Price is too long.';

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
