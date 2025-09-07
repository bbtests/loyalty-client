export interface Permission {
  id: string;
  name: string;
  created_at: string;
}
export default interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  created_at: string;
}
