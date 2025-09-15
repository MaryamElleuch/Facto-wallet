import * as crypto from 'crypto';
// Fonction qui calcule un SHA-256 et renvoie en hexadécimal
export function sha256Hex(str: string): string {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}
// Fonction pour comparer deux hash en sécurité (protège contre timing attack)
// timingsafeEquale est la fonction de comparaison
export function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
