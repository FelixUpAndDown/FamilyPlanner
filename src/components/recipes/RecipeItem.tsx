import type { Recipe } from '../../lib/types';

interface RecipeItemProps {
  recipe: Recipe;
  onClick: () => void;
  isMarkedForCooking: boolean;
}

export default function RecipeItem({ recipe, onClick, isMarkedForCooking }: RecipeItemProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
    >
      {isMarkedForCooking && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-10">
          Zu kochen
        </div>
      )}
      <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">🍽️</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-left line-clamp-2">{recipe.name}</h3>
        <p className="text-sm text-gray-500 text-left mt-1">
          {recipe.ingredients?.length || 0} Zutaten
        </p>
      </div>
    </button>
  );
}
