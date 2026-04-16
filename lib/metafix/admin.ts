const ADMIN_EMAIL = "aandreskss@gmail.com";

export function isAdminEmail(email: string | undefined): boolean {
  return email === ADMIN_EMAIL;
}
