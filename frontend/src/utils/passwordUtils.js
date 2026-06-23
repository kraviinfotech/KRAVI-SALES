const commonPasswords = new Set([
  'password',
  '12345678',
  '123456789',
  'password123',
  'admin123',
  'qwerty',
  'letmein',
  'welcome',
  'iloveyou',
  '1234567',
  '123456',
  'abc123',
  '111111',
  '123123',
  '1q2w3e4r',
  'passw0rd'
]);

const passwordPolicyRegex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*$/;

export const validatePassword = (password) => {
  const errors = [];
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
    return { valid: false, errors };
  }

  if (!passwordPolicyRegex.test(password)) {
    errors.push('Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.');
  }

  if (commonPasswords.has(password.toLowerCase())) {
    errors.push('That password is too common. Please choose a stronger password.');
  }

  return { valid: errors.length === 0, errors };
};

export const getPasswordStrength = (password) => {
  if (!password) return 'Weak';
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^\w\s]/.test(password)) score += 1;

  if (score <= 2) return 'Weak';
  if (score === 3) return 'Medium';
  if (score === 4) return 'Strong';
  return 'Very Strong';
};

export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'Weak':
      return 'bg-red-500';
    case 'Medium':
      return 'bg-orange-500';
    case 'Strong':
      return 'bg-emerald-500';
    case 'Very Strong':
      return 'bg-green-600';
    default:
      return 'bg-slate-300';
  }
};
