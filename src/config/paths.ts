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
        getHref: (id: string) => `/dashboard/recipes/${id}/view`,
      },
      add: {
        getHref: () => "/dashboard/recipes/add",
      },
    },
    ingredients: {
      getHref: () => "/dashboard/ingredients",
      view: {
        getHref: (id: string) => `/dashboard/ingredients/${id}/view`,
      },
      add: {
        getHref: () => "/dashboard/ingredients/add",
      },
      edit: {
        getHref: (id: string) => `/dashboard/ingredients/${id}/edit`,
      },
    },
    recipeGroups: {
      getHref: () => "/dashboard/recipe-groups",
      view: {
        getHref: (id: string) => `/dashboard/recipe-groups/${id}/view`,
      },
      add: {
        getHref: () => "/dashboard/recipe-groups/add",
      },
    },
  },
} as const;
