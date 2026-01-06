import { useState } from 'react';

export function useShoppingSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleAll = (allItemIds: string[]) => {
    if (selectedIds.size === allItemIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allItemIds));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const removeFromSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  return {
    selectedIds,
    handleToggleSelect,
    handleToggleAll,
    clearSelection,
    removeFromSelection,
  };
}
