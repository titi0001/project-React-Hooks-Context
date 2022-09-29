import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import copy from 'clipboard-copy';
import RecipesContext from '../Context';
import RecipeDetailsCard from '../Components/RecipeDetailsCard';
import RecommendedRecipes from '../Components/RecommendedRecipes';
import { ReactComponent as ShareIcon } from '../images/shareIcon.svg';
import { ReactComponent as WhiteHeartIcon } from '../images/whiteHeartIcon.svg';
import { ReactComponent as BlackHeartIcon } from '../images/blackHeartIcon.svg';
import '../styles/recipeCard.css';
import { fetchDrinkById, fetchMealById } from '../Services';
import { setOneMeasureDrink } from '../helpers';

export default function RecipeDetails({ match: { params: { id } } }) {
  const [food, setFood] = useState([]);
  const [drink, setDrink] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    setFavoriteToStorage,
    favoriteRecipes,
    setFavoriteRecipes,
    copiedLink,
    setCopiedLink,
    history: { push, location: { pathname } },
  } = useContext(RecipesContext);

  useEffect(() => {
    const getData = async () => {
      if (pathname.includes('meals')) {
        const mealData = await fetchMealById(id);
        setFood(mealData);
        setLoading(false);
      } if (pathname.includes('drinks')) {
        const drinkData = await fetchDrinkById(id);
        setDrink(drinkData);
        setLoading(false);
      }
    };
    getData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecipe = () => {
    if (pathname.includes('meals')) push(`/meals/${id}/in-progress`);
    if (pathname.includes('drinks')) push(`/drinks/${id}/in-progress`);
  };

  const getIngredients = () => {
    const ingredientsAndMeasures = [];
    if (pathname.includes('meals')) {
      const ingredients = Object.entries(food[0])
        .filter((it) => it[0].includes('Ingredient') && it[1] !== null && it[1] !== '');

      const measures = Object.entries(food[0])
        .filter((it) => it[0].includes('Measure') && it[1] !== null && it[1] !== '');

      ingredients.forEach((ingredient, idx) => {
        ingredientsAndMeasures.push([...ingredient, measures[idx][1]]);
      });

      return ingredientsAndMeasures;
    }
    if (pathname.includes('drinks')) {
      const ingredients = Object.entries(drink[0])
        .filter((it) => it[0].includes('Ingredient') && it[1] !== null && it[1] !== '');

      const measures = Object.entries(drink[0])
        .filter((it) => it[0].includes('Measure') && it[1] !== null && it[1] !== '');

      if (measures.length === 1) {
        ingredientsAndMeasures.push(...setOneMeasureDrink(ingredients, measures));
      } else {
        ingredients.forEach((ingredient, idx) => {
          ingredientsAndMeasures.push([...ingredient, measures[idx][1]]);
        });
      }

      return ingredientsAndMeasures;
    }
  };

  const shareRecipe = () => {
    copy(`http://localhost:3000${pathname}`);
    setCopiedLink(true);
  };

  const checkFavorite = () => favoriteRecipes.some((recipe) => recipe.id === id);
  const removeFavorite = () => {
    const filteredRecipes = favoriteRecipes.filter((recipe) => recipe.id !== id);
    setFavoriteRecipes(filteredRecipes);
  };

  const addOrRemoveFavorite = () => {
    if (pathname.includes('meals')) {
      if (checkFavorite()) removeFavorite();
      else setFavoriteToStorage(id, food[0]);
    }
    if (pathname.includes('drinks')) {
      if (checkFavorite()) removeFavorite();
      else setFavoriteToStorage(id, drink[0]);
    }
  };

  return (
    <section>
      <h1>Recipe Details</h1>
      {!loading && (
        <section>
          {pathname.includes('meals') && (
            <RecipeDetailsCard
              func={ getIngredients }
              recipe={ food[0] }
              pathname={ pathname }
              thumb="strMealThumb"
              name="strMeal"
              category="strCategory"
              instructions="strInstructions"
              video="strYoutube"
            />
          )}
          {pathname.includes('drinks') && (
            <RecipeDetailsCard
              func={ getIngredients }
              recipe={ drink[0] }
              pathname={ pathname }
              thumb="strDrinkThumb"
              name="strDrink"
              category="strCategory"
              instructions="strInstructions"
              alcoholic="strAlcoholic"
            />
          )}
        </section>
      )}
      <button
        type="button"
        className="start-recipe-btn "
        data-testid="start-recipe-btn"
        onClick={ () => startRecipe() }
      >
        Start Recipe
      </button>
      <button
        type="button"
        onClick={ () => addOrRemoveFavorite() }
        data-testid="favorite-btn"
        src={ `../images/${checkFavorite() ? 'blackHeartIcon' : 'whiteHeartIcon'}` }
      >
        {checkFavorite() ? <BlackHeartIcon /> : <WhiteHeartIcon />}
      </button>
      <button
        type="button"
        onClick={ () => shareRecipe() }
        data-testid="share-btn"
      >
        <ShareIcon />
      </button>
      {copiedLink && (<p>Link copied!</p>) }
      <section>
        <RecommendedRecipes />
      </section>
    </section>
  );
}

RecipeDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};
