import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// Comprehensive list of disposable/temporary/burner email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'dispostable.com',
  'getairmail.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'generator.email',
  'nada.ltd',
  'inboxkitten.com',
  'maildrop.cc',
  'crazymailing.com',
  'mohmal.com',
  'mytemp.email',
  'tempinbox.com',
  'burnermail.io',
  'dropmail.me',
  'fakemailgenerator.com',
  'minuteinbox.com',
  'emailondeck.com',
  'tempr.email',
  'discard.email',
  'spambox.us',
  'anonymbox.com'
]);

/**
 * Validates that an email is authentic, not a disposable burner address,
 * and belongs to a domain with active mail exchange (MX) DNS records.
 */
export async function validateAuthenticEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Please provide a valid email address.' };
  }

  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email format.' };
  }

  const [localPart, domain] = parts;

  // Basic sanity checks
  if (localPart.length < 1 || localPart.length > 64) {
    return { valid: false, reason: 'Invalid email username length.' };
  }

  if (domain.length < 4 || !domain.includes('.')) {
    return { valid: false, reason: 'Invalid email domain.' };
  }

  // 1. Check against disposable domain blocklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: 'Disposable and temporary email addresses are not allowed. Please use your permanent email address.',
    };
  }

  // 2. Check for subdomains of disposable domains
  for (const disposable of DISPOSABLE_DOMAINS) {
    if (domain.endsWith('.' + disposable)) {
      return {
        valid: false,
        reason: 'Temporary email providers are blocked. Please use a verified personal or business email.',
      };
    }
  }

  // 3. Check DNS MX records to verify domain actually exists and accepts emails
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'protonmail.com'];
  if (!commonDomains.includes(domain)) {
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return {
          valid: false,
          reason: `The domain "@${domain}" does not have valid mail servers (MX records) to receive email.`,
        };
      }
    } catch (err: any) {
      return {
        valid: false,
        reason: `The domain "@${domain}" is invalid or cannot receive emails. Please check your email address.`,
      };
    }
  }

  return { valid: true };
}
