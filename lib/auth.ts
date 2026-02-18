const ADMIN_COOKIE = 'groupstay_admin';

export function getAdminCookieName() {
  return ADMIN_COOKIE;
}

export function isAdminCredentialValid(username: string, password: string) {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD &&
    Boolean(username) &&
    Boolean(password)
  );
}
