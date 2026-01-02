/**
 * Common constants used across the application
 */

export const QUANTITY_UNITS = [
  'Stk',
  'kg',
  'g',
  'L',
  'ml',
  'Packung',
  'Bund',
  'EL',
  'TL',
  'Prise',
  'Dose',
  'Glas',
] as const;

export type QuantityUnit = (typeof QUANTITY_UNITS)[number];
