import { useState } from 'react';
import type { RecipeIngredient } from '../../lib/types';

interface ServingScaleModalProps {
  recipeServings: number | undefined;
  ingredients: RecipeIngredient[];
  onConfirm: (scaledIngredients: RecipeIngredient[]) => void;
  onCancel: () => void;
}

export default function ServingScaleModal({
  recipeServings,
  ingredients,
  onConfirm,
  onCancel,
}: ServingScaleModalProps) {
  const [desiredServings, setDesiredServings] = useState<number>(recipeServings || 1);

  const handleConfirm = () => {
    if (desiredServings <= 0) {
      alert('Bitte gib eine Anzahl von Portionen größer als 0 ein');
      return;
    }

    // Calculate scaling factor
    const baseServings = recipeServings || 1;
    const scaleFactor = desiredServings / baseServings;

    // Scale all ingredients
    const scaledIngredients = ingredients.map((ing) => ({
      ...ing,
      quantity: (parseFloat(ing.quantity) * scaleFactor).toString(),
    }));

    onConfirm(scaledIngredients);
  };

  const baseServings = recipeServings || 1;
  const scaleFactor = desiredServings / baseServings;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Portionen anpassen</h3>
          <p className="text-sm text-gray-600 mt-2">
            Rezept serviert ursprünglich {baseServings} {baseServings === 1 ? 'Person' : 'Personen'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Für wie viele Personen möchtest du kochen?
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={desiredServings}
              onChange={(e) => setDesiredServings(parseFloat(e.target.value) || 1)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              autoFocus
            />
          </div>

          {scaleFactor !== 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Multiplikator: {scaleFactor.toFixed(2)}x</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Alle Mengen werden mit diesem Faktor multipliziert
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded border">
            <h4 className="font-medium text-sm mb-2 text-gray-700">Angepasste Mengen:</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {ingredients.map((ing) => {
                const scaledQty = (parseFloat(ing.quantity) * scaleFactor).toFixed(2);
                return (
                  <div key={ing.id} className="text-xs text-gray-600 flex justify-between">
                    <span>{ing.name}</span>
                    <span className="font-medium">
                      {scaledQty} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}
