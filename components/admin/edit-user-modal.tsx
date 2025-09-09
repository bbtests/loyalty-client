"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUpdateUserMutation } from "@/store/users";
import { useGetRolesQuery } from "@/store/roles";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2 } from "lucide-react";
import type { User as UserType } from "@/types/user";

interface EditUserModalProps {
  user: UserType | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface EditUserFormData {
  name: string
  email: string
  password?: string
  role_id: string
}


// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .nullable(),
  role_id: Yup.string()
    .required("Role is required"),
})

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const { toast } = useToast()
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery()
  
  // Filter out super admin role
  const availableRoles = (rolesData as any)?.data?.items?.filter((role: any) => role.name !== 'super admin') || []

  const getInitialValues = (): EditUserFormData => {
    if (!user) {
      return {
        name: "",
        email: "",
        password: "",
        role_id: "",
      }
    }

    return {
      name: user.name || "",
      email: user.email || "",
      password: "",
      role_id: user.roles?.[0]?.id || "",
    }
  }

  const onSubmit = async (values: EditUserFormData, { resetForm }: any) => {
    if (!user) return

    try {
      // Prepare the update data
      const updateData: any = {
        name: values.name,
        email: values.email,
        role_id: values.role_id,
      }

      // Only include password if it's provided
      if (values.password && values.password.length > 0) {
        updateData.password = values.password
      }

      await updateUser({ id: user.id, ...updateData }).unwrap()

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      resetForm()
      onClose()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit User
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, touched }: any) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Field name="name">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder="Enter full name"
                      disabled={isLoading}
                      className={errors.name && touched.name ? "border-destructive" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage name="name" component="p" className="text-sm text-destructive" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Field name="email">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      disabled={isLoading}
                      className={errors.email && touched.email ? "border-destructive" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage name="email" component="p" className="text-sm text-destructive" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_id">Role</Label>
                <Field name="role_id">
                  {({ field }: any) => (
                    <Select
                      onValueChange={(value: string) => setFieldValue("role_id", value)}
                      value={field.value}
                      disabled={isLoading || rolesLoading}
                    >
                      <SelectTrigger className={errors.role_id && touched.role_id ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role: any) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="role_id" component="p" className="text-sm text-destructive" />
              </div>


              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Leave password fields empty to keep current password
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password (Optional)</Label>
                <Field name="password">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      disabled={isLoading}
                      className={errors.password && touched.password ? "border-destructive" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
              </div>


              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update User
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
