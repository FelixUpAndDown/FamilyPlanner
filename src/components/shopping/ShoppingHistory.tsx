import type { ShoppingPurchase } from '../../lib/types';

interface ShoppingHistoryProps {
  purchases: ShoppingPurchase[];
  users: { id: string; name: string }[];
  onClose: () => void;
}

export default function ShoppingHistory({ purchases, users, onClose }: ShoppingHistoryProps) {
  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name ?? 'Unbekannt';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">Einkaufshistorie</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {purchases.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Noch keine Einkäufe</div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">{getUserName(purchase.purchased_by_id)}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(purchase.purchased_at)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{purchase.items.length} Artikel</div>
                  </div>
                  <ul className="space-y-1">
                    {purchase.items.map((item) => (
                      <li key={item.id} className="text-sm flex justify-between">
                        <span>{item.name}</span>
                        <span className="text-gray-500">
                          {item.quantity} {item.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
