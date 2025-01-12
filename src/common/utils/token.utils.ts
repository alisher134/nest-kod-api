export const parseExpiresIn = (expiresIn: string): number => {
  const matches = expiresIn.match(/^(\d+)([mhd])$/);
  if (!matches) return 3600;

  const [_, value, unit] = matches;
  const multipliers = {
    m: 60,
    h: 3600,
    d: 86400,
  };

  return parseInt(value) * multipliers[unit];
};
