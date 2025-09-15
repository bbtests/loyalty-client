"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteUserMutation } from "@/store/users"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Loader2 } from "lucide-react"
import type { User as UserType } from "@/types/user"

interface DeleteUserModalProps {
  user: UserType | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DeleteUserModal({ user, isOpen, onClose, onSuccess }: DeleteUserModalProps) {
  const [deleteUser, { isLoading }] = useDeleteUserMutation()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!user) return

    try {
      await deleteUser(user.id).unwrap()

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      onClose()
      onSuccess?.()
    } catch (error: any) {
    }
  }

  if (!user) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              Email: {user.email}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

