export const paths = {
  login: {
    getHref: () => "/login",
  },
  dashboard: {
    contractor: {
      getHref: () => "/dashboard/contractor",
      jobs: {
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
    },
  },
} as const;
