"use client"

import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useCreateUserMutation } from "@/store/users"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface CreateUserFormData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: string
}

// Mock roles - in a real app, these would come from an API
const availableRoles = [
  { id: "1", name: "customer", permissions: [], created_at: new Date().toISOString() },
  { id: "2", name: "admin", permissions: [], created_at: new Date().toISOString() },
  { id: "3", name: "super admin", permissions: [], created_at: new Date().toISOString() },
]

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  role: Yup.string()
    .required("Role is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  password_confirmation: Yup.string()
    .required("Password confirmation is required")
    .oneOf([Yup.ref('password')], "Passwords must match"),
})

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [createUser, { isLoading }] = useCreateUserMutation()
  const { toast } = useToast()

  const initialValues: CreateUserFormData = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  }

  const onSubmit = async (values: CreateUserFormData, { resetForm }: any) => {
    try {
      // Prepare the user data
      const selectedRole = availableRoles.find(role => role.id === values.role)
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        roles: selectedRole ? [selectedRole] : [], // API expects role objects
      }

      await createUser(userData).unwrap()

      toast({
        title: "Success",
        description: "User created successfully",
      })

      resetForm()
      onClose()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New User
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
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
                <Label htmlFor="role">Role</Label>
                <Field name="role">
                  {({ field }: any) => (
                    <Select
                      onValueChange={(value: string) => setFieldValue("role", value)}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={errors.role && touched.role ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="role" component="p" className="text-sm text-destructive" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Field name="password">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      disabled={isLoading}
                      className={errors.password && touched.password ? "border-destructive" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Field name="password_confirmation">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="password_confirmation"
                      type="password"
                      placeholder="Confirm password"
                      disabled={isLoading}
                      className={errors.password_confirmation && touched.password_confirmation ? "border-destructive" : ""}
                    />
                  )}
                </Field>
                <ErrorMessage name="password_confirmation" component="p" className="text-sm text-destructive" />
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
                  Create User
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
