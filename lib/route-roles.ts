export interface RouteRole {
  pattern: RegExp;
  href: string;
  roles: string[];
  title: string;
  icon?: any;
}

export const routeRoles: RouteRole[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    pattern: /^\/dashboard$/,
    roles: ["everybody"],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    pattern: /^\/dashboard\/users(\/.*)?$/,
    roles: ["super-admin"],
  },
];
