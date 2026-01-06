import { useState, useEffect } from 'react';
import type { Recipe } from '../../lib/types';
import { getRecipes, getActiveCookings, deleteRecipe, markRecipeAsCooked } from '../../lib/recipes';

export function useRecipes(familyId: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markedRecipeIds, setMarkedRecipeIds] = useState<Set<string>>(new Set());

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipes(familyId);
      setRecipes(data);

      const cookings = await getActiveCookings(familyId);
      const markedIds = new Set(cookings.map((c) => c.recipe_id));
      setMarkedRecipeIds(markedIds);
    } catch (err: any) {
      setError(err?.message || String(err));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [familyId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Rezept wirklich löschen?')) return;

    try {
      await deleteRecipe(id);
      await fetchRecipes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkCooked = async (recipeId: string, currentProfileId: string) => {
    try {
      await markRecipeAsCooked(recipeId, familyId, currentProfileId);
      await fetchRecipes();
      return recipes.find((r) => r.id === recipeId);
    } catch (err: any) {
      alert(err.message || 'Fehler beim Markieren des Rezepts');
      return null;
    }
  };

  return {
    recipes,
    loading,
    error,
    markedRecipeIds,
    fetchRecipes,
    handleDelete,
    handleMarkCooked,
  };
}
