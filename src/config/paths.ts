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
  },
} as const;
