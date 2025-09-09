"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, Award, Star, Trophy } from "lucide-react"
import type { User as UserType } from "@/types/user"

interface ViewUserModalProps {
  user: UserType | null
  isOpen: boolean
  onClose: () => void
}

export function ViewUserModal({ user, isOpen, onClose }: ViewUserModalProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0"
        onPointerDownOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-5 h-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    Full Name
                  </div>
                  <p className="font-medium break-words">{user.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <p className="font-medium break-words">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Created
                  </div>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Updated
                  </div>
                  <p className="font-medium">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  Roles
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role.id} variant="outline" className="border-border">
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No roles assigned</span>
                  )}
                </div>
              </div>

              {user.email_verified_at && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email Verified
                  </div>
                  <p className="font-medium">
                    {new Date(user.email_verified_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loyalty Points */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5" />
                Loyalty Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {user.loyalty_points?.points?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Available Points</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {user.loyalty_points?.total_earned?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Earned</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">
                    {user.loyalty_points?.total_redeemed?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements {user.achievements && user.achievements.length > 0 && `(${user.achievements.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.achievements && user.achievements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{achievement.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No achievements yet</p>
              )}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Badges {user.badges && user.badges.length > 0 && `(${user.badges.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.badges && user.badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.badges.map((badge) => (
                    <div key={badge.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="font-medium text-sm sm:text-base">{badge.name}</p>
                          <Badge variant="outline" className="text-xs w-fit">
                            Tier {badge.tier}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          {badge.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned: {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No badges earned yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
