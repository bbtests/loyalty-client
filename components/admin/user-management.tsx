"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { useGetUsersQuery } from "@/store/users"
import { ViewUserModal } from "./view-user-modal"
import { CreateUserModal } from "./create-user-modal"
import { EditUserModal } from "./edit-user-modal"
import { DeleteUserModal } from "./delete-user-modal"
import type { User } from "@/types/user"

export function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: usersResponse, isLoading: usersLoading, refetch } = useGetUsersQuery({ page: currentPage })

  const loading = usersLoading

  // Extract users from API response
  const pagination = (usersResponse as any)?.meta?.pagination || {}

  // Filter users based on search term (client-side filtering for now)
  const filteredUsers = React.useMemo(() => {
    const users = (usersResponse as any)?.data?.items || []

    if (!searchTerm) {
      return users
    }

    return users.filter(
      (user: any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [usersResponse, searchTerm])


  const handlePreviousPage = () => {
    if (pagination.current_page > 1) {
      setCurrentPage(pagination.current_page - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.current_page < pagination.last_page) {
      setCurrentPage(pagination.current_page + 1)
    }
  }

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm, currentPage])

  // Modal handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setViewModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setDeleteModalOpen(true)
  }

  const handleCreateUser = () => {
    setCreateModalOpen(true)
  }

  const handleModalClose = () => {
    setViewModalOpen(false)
    setCreateModalOpen(false)
    setEditModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedUser(null)
  }

  const handleSuccess = () => {
    refetch() // Refresh the user list
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Manage customer accounts and loyalty data</p>
        </div>
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full bg-input border-border pl-10"
            />
          </div>
          <Button onClick={handleCreateUser} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-card-foreground text-lg sm:text-xl">
              All Users ({pagination.total || filteredUsers.length})
            </CardTitle>
            {pagination.total && (
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {pagination.from || 1} to {pagination.to || filteredUsers.length} of {pagination.total} users
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-card-foreground min-w-[200px]">User</TableHead>
                  <TableHead className="text-card-foreground min-w-[120px]">Points</TableHead>
                  <TableHead className="text-card-foreground min-w-[120px]">Achievements</TableHead>
                  <TableHead className="text-card-foreground min-w-[120px]">Current Badge</TableHead>
                  <TableHead className="text-card-foreground min-w-[120px]">Member Since</TableHead>
                  <TableHead className="text-card-foreground min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell className="min-w-[200px]">
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base break-words">{user.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">
                          {(user as any).loyalty_points?.points?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {(user as any).loyalty_points?.total_earned?.toLocaleString() || '0'} earned
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge variant="outline" className="border-border text-foreground text-xs">
                        {(user as any).achievements?.length || 0} unlocked
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        {(user as any).badges?.length ? (user as any).badges[0]?.name || 'No Badge' : 'No Badge'}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <p className="text-xs sm:text-sm text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80 p-1 sm:p-2"
                          onClick={() => handleViewUser(user)}
                          title="View user details"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-secondary hover:text-secondary/80 p-1 sm:p-2"
                          onClick={() => handleEditUser(user)}
                          title="Edit user"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80 p-1 sm:p-2"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete user"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination.last_page && pagination.last_page > 1 && (
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mt-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Page {pagination.current_page} of {pagination.last_page}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pagination.current_page <= 1}
                  className="border-border bg-transparent text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="border-border bg-transparent text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ViewUserModal
        user={selectedUser}
        isOpen={viewModalOpen}
        onClose={handleModalClose}
      />

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <EditUserModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />

      <DeleteUserModal
        user={selectedUser}
        isOpen={deleteModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

