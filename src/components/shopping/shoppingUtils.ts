import type { ShoppingItem } from '../../lib/types';

export function sortShoppingItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    // Items with deal_date and/or store come first
    const aHasDeal = a.deal_date || a.store;
    const bHasDeal = b.deal_date || b.store;

    if (aHasDeal && !bHasDeal) return -1;
    if (!aHasDeal && bHasDeal) return 1;

    // Both have deals: sort by date, then by store
    if (aHasDeal && bHasDeal) {
      // Sort by date first
      if (a.deal_date && b.deal_date) {
        const dateCompare = a.deal_date.localeCompare(b.deal_date);
        if (dateCompare !== 0) return dateCompare;
      } else if (a.deal_date && !b.deal_date) {
        return -1;
      } else if (!a.deal_date && b.deal_date) {
        return 1;
      }

      // Then by store
      if (a.store && b.store) {
        const storeCompare = a.store.localeCompare(b.store);
        if (storeCompare !== 0) return storeCompare;
      }
    }

    // Finally, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
}
