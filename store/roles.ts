import type Role from "../types/role";
import { createEntity } from "./entityFactory";

export const roles = createEntity<Role>({
  reducerPath: "rolesApi",
  entityEndpoint: "roles",
});

export const {
  useGetAllQuery: useGetRolesQuery,
  useGetByIdQuery: useGetRoleQuery,
  useCreateMutation: useCreateRoleMutation,
  useUpdateMutation: useUpdateRoleMutation,
  useDeleteMutation: useDeleteRoleMutation,
} = roles;
