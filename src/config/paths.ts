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
      },
    },
    homeowner: {
      getHref: () => "/dashboard/homeowner",
    },
  },
} as const;
