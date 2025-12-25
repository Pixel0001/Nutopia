// Super Admin Configuration
// Adaugă email-urile super adminilor aici
// Aceștia vor primi automat rolul de "admin" la înregistrare/autentificare

export const SUPER_ADMINS = [
  "racustefan34@gmail.com",
  "anaciumac559@gmail.com",
  "golbik1999@gmail.com",
];

// Verifică dacă un email este super admin
export function isSuperAdmin(email) {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase());
}
