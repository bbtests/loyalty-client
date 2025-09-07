import type { User } from "../types/user";
import { createEntity } from "./entityFactory";

export const users = createEntity<User>({
  reducerPath: "usersApi",
  entityEndpoint: "users",
});

export const {
  useGetAllQuery: useGetUsersQuery,
  useGetByIdQuery: useGetUserQuery,
  useCreateMutation: useCreateUserMutation,
  useUpdateMutation: useUpdateUserMutation,
  useDeleteMutation: useDeleteUserMutation,
} = users;
