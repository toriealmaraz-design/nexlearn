const ADMIN_EMAIL_SEPARATOR = /[,;\s]+/;

export function isConfiguredAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const configuredEmails = (process.env.NEXLEARN_ADMIN_EMAILS ?? "")
    .split(ADMIN_EMAIL_SEPARATOR)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return configuredEmails.includes(normalizedEmail);
}
