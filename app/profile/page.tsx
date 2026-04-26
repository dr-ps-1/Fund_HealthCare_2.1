"use client"

import { useState } from "react"
import { User, Mail, Phone, Stethoscope, Edit2, Save, X } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { doctorProfile as initialProfile } from "@/lib/mock-data"
import type { DoctorProfile } from "@/lib/types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<DoctorProfile>(profile)

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-16 w-16" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                {profile.name}
              </h2>
              <p className="text-muted-foreground">{profile.specialization}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="font-medium text-foreground">{profile.name}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="specialization" className="flex items-center gap-2 text-muted-foreground">
                    <Stethoscope className="h-4 w-4" />
                    Specialization
                  </Label>
                  {isEditing ? (
                    <Input
                      id="specialization"
                      value={editedProfile.specialization}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          specialization: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="font-medium text-foreground">
                      {profile.specialization}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, email: e.target.value })
                      }
                    />
                  ) : (
                    <p className="font-medium text-foreground">{profile.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, phone: e.target.value })
                      }
                    />
                  ) : (
                    <p className="font-medium text-foreground">{profile.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
