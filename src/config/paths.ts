export const paths = {
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
      user: {
        getHref: (id: string) => `/dashboard/chat/user/${id}`,
      },
    },
  },
} as const;
