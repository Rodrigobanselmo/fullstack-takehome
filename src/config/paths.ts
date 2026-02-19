export const paths = {
  api: {
    chat: {
      stream: {
        getHref: (conversationId: string) =>
          `/api/chat/stream/${conversationId}`,
      },
    },
  },
  login: {
    getHref: () => "/login",
  },
  dashboard: {
    getHref: () => "/dashboard",
    chat: {
      getHref: () => "/dashboard/chat",
      conversation: {
        getHref: (conversationId: string) =>
          `/dashboard/chat/${conversationId}`,
      },
    },
    recipes: {
      getHref: () => "/dashboard/recipes",
      view: {
        getHref: (recipeId: string) => `/dashboard/recipes/${recipeId}/view`,
      },
      add: {
        getHref: () => "/dashboard/recipes/add",
      },
      edit: {
        getHref: (recipeId: string) => `/dashboard/recipes/${recipeId}/edit`,
      },
    },
    ingredients: {
      getHref: () => "/dashboard/ingredients",
      view: {
        getHref: (ingredientId: string) =>
          `/dashboard/ingredients/${ingredientId}/view`,
      },
      add: {
        getHref: () => "/dashboard/ingredients/add",
      },
      edit: {
        getHref: (ingredientId: string) =>
          `/dashboard/ingredients/${ingredientId}/edit`,
      },
    },
    recipeGroups: {
      getHref: () => "/dashboard/recipe-groups",
      view: {
        getHref: (recipeGroupId: string) =>
          `/dashboard/recipe-groups/${recipeGroupId}/view`,
      },
      add: {
        getHref: () => "/dashboard/recipe-groups/add",
      },
    },
  },
} as const;
