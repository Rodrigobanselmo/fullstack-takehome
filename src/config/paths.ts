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
    contractor: {
      getHref: () => "/dashboard/contractor",
      jobs: {
        view: {
          getHref: (id: string) => `/dashboard/contractor/jobs/${id}/view`,
        },
        add: {
          getHref: () => "/dashboard/contractor/jobs/add",
        },
        edit: {
          getHref: (id: string) => `/dashboard/contractor/jobs/${id}/edit`,
        },
        subtasks: {
          add: {
            getHref: (jobId: string) =>
              `/dashboard/contractor/jobs/${jobId}/subtasks/add`,
          },
          edit: {
            getHref: (jobId: string, subtaskId: string) =>
              `/dashboard/contractor/jobs/${jobId}/subtasks/${subtaskId}/edit`,
          },
        },
      },
    },
    homeowner: {
      getHref: () => "/dashboard/homeowner",
      view: {
        getHref: (id: string) => `/dashboard/homeowner/projects/${id}/view`,
      },
    },
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
      edit: {
        getHref: (id: string) => `/dashboard/recipes/${id}/edit`,
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
  },
} as const;
