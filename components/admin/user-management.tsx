"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { useGetUsersQuery } from "@/store/users"

export function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery({ page: currentPage })

  const loading = usersLoading

  // Extract users from API response
  const users = (usersResponse as any)?.data?.items || []
  const pagination = (usersResponse as any)?.meta?.pagination || {}

  // Filter users based on search term (client-side filtering for now)
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) {
      return users
    }

    return users.filter(
      (user: any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to first page when searching
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

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
  }, [searchTerm])

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage customer accounts and loyalty data</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-input border-border"
          />
          <Button type="submit" variant="outline" size="icon" className="border-border bg-transparent">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground">
              All Users ({pagination.total || filteredUsers.length})
            </CardTitle>
            {pagination.total && (
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from || 1} to {pagination.to || filteredUsers.length} of {pagination.total} users
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-card-foreground">User</TableHead>
                  <TableHead className="text-card-foreground">Points</TableHead>
                  <TableHead className="text-card-foreground">Achievements</TableHead>
                  <TableHead className="text-card-foreground">Current Badge</TableHead>
                  <TableHead className="text-card-foreground">Member Since</TableHead>
                  <TableHead className="text-card-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {(user as any).loyalty_points?.points?.toLocaleString() || '0'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(user as any).loyalty_points?.total_earned?.toLocaleString() || '0'} earned
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border text-foreground">
                        {(user as any).achievements?.length || 0} unlocked
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground">
                        {(user as any).badges?.length ? (user as any).badges[0]?.name || 'No Badge' : 'No Badge'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
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
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.last_page}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pagination.current_page <= 1}
                  className="border-border bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="border-border bg-transparent"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

