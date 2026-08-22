"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Edit2,
  Save,
  X,
  LogOut,
  Building2,
  ExternalLink,
  Activity,
  Users,
  Bell,
} from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  ClinicianAvatar,
  ClinicianPhotoEditor,
} from "@/components/profile/clinician-photo-editor"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useClinicianMessages } from "@/components/providers/clinician-messages-provider"
import { isSupabaseMessagingEnabled } from "@/lib/config/public-env"
import { updateClinicianProfile } from "@/lib/clinician-data-api"
import { doctorProfile as initialProfile } from "@/lib/mock-data"
import { getAttributionPeriodLabel } from "@/lib/panel-analytics"
import { computePanelRosterStats } from "@/lib/panel-roster"
import { resetDemoMode } from "@/lib/demo"
import {
  CLINICIAN_PRACTICE,
  formatClinicianOrganization,
} from "@/lib/clinician-practice"
import { useClinicianNotificationPreferences } from "@/lib/clinician-notification-preferences"
import { toast } from "@/hooks/use-toast"
import type { DoctorProfile } from "@/lib/types"

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfilePageContent />
    </AppShell>
  )
}

function ProfilePageContent() {
  const router = useRouter()
  const {
    clinician: loadedProfile,
    patients,
    alerts,
    refresh,
    updateClinician,
    source,
  } = useClinicianData()
  const { unreadCount: messagesAwaitingReply } = useClinicianMessages()
  const { preferences, updatePreferences } = useClinicianNotificationPreferences()
  const [profile, setProfile] = useState<DoctorProfile>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<DoctorProfile>(profile)
  const [saving, setSaving] = useState(false)
  const useSupabase = isSupabaseMessagingEnabled()

  const panelStats = useMemo(() => computePanelRosterStats(patients), [patients])
  const activeAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === "active").length,
    [alerts]
  )
  const attributionPeriod = getAttributionPeriodLabel()

  useEffect(() => {
    setProfile(loadedProfile)
    setEditedProfile(loadedProfile)
  }, [loadedProfile])

  const persistProfile = async (next: DoctorProfile) => {
    let updated = next
    if (useSupabase) {
      updated = await updateClinicianProfile(next)
      await refresh()
    }
    setProfile(updated)
    setEditedProfile(updated)
    updateClinician(updated)
    return updated
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await persistProfile(editedProfile)
      setIsEditing(false)
    } catch (err) {
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = async (photo: string) => {
    const next = { ...(isEditing ? editedProfile : profile), photo }
    setEditedProfile(next)
    if (isEditing) return
    setSaving(true)
    try {
      await persistProfile(next)
    } catch (err) {
      toast({
        title: "Could not save photo",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  function handleSignOut() {
    resetDemoMode()
    router.push("/login")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account"
        description="Clinician profile and attributed panel context"
      >
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            {isEditing ? (
              <ClinicianPhotoEditor
                name={editedProfile.name}
                photo={editedProfile.photo}
                disabled={saving}
                onPhotoChange={(photo) =>
                  setEditedProfile({ ...editedProfile, photo })
                }
              />
            ) : (
              <>
                <ClinicianAvatar
                  name={profile.name}
                  photo={profile.photo}
                  className="h-32 w-32"
                />
                <ClinicianPhotoEditor
                  name={profile.name}
                  photo={profile.photo}
                  disabled={saving}
                  showAvatar={false}
                  onPhotoChange={(photo) => void handlePhotoChange(photo)}
                />
              </>
            )}
            <h2 className="mt-4 text-center text-xl font-semibold text-foreground">
              {isEditing ? editedProfile.name : profile.name}
            </h2>
            <p className="text-muted-foreground">
              {isEditing ? editedProfile.specialization : profile.specialization}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              NPI {isEditing ? editedProfile.npi : profile.npi}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Professional information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={() => void handleSave()} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <User className="h-4 w-4" />
                    Full name
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
                  <Label
                    htmlFor="specialization"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
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
                  <Label htmlFor="npi" className="flex items-center gap-2 text-muted-foreground">
                    <Stethoscope className="h-4 w-4" />
                    NPI
                  </Label>
                  <p className="font-medium text-foreground">{profile.npi}</p>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Credentialing identifier — contact admin to update.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    Email
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

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    Phone
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notification preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Control which items appear in the header bell. Saved for this
                session.
              </p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="pref-urgent">Urgent panel flags</Label>
                  <p className="text-xs text-muted-foreground">
                    High-severity alerts not already on home
                  </p>
                </div>
                <Switch
                  id="pref-urgent"
                  checked={preferences.urgentAlerts}
                  onCheckedChange={(checked) =>
                    updatePreferences({ urgentAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="pref-inbox">Inbox tasks</Label>
                  <p className="text-xs text-muted-foreground">
                    Workqueue items beyond today&apos;s preview
                  </p>
                </div>
                <Switch
                  id="pref-inbox"
                  checked={preferences.inboxTasks}
                  onCheckedChange={(checked) =>
                    updatePreferences({ inboxTasks: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="pref-messages">Patient messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Threads awaiting your reply
                  </p>
                </div>
                <Switch
                  id="pref-messages"
                  checked={preferences.patientMessages}
                  onCheckedChange={(checked) =>
                    updatePreferences({ patientMessages: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="pref-system">System updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Population and quality reporting notices
                  </p>
                </div>
                <Switch
                  id="pref-system"
                  checked={preferences.systemUpdates}
                  onCheckedChange={(checked) =>
                    updatePreferences({ systemUpdates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Practice & panel
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/patients">
                    <Users className="mr-1.5 h-3.5 w-3.5" />
                    View panel
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/analytics">
                    <Activity className="mr-1.5 h-3.5 w-3.5" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Organization</p>
                <p className="font-medium text-foreground">
                  {formatClinicianOrganization()}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Attributed panel</p>
                  <p className="font-medium text-foreground">
                    {panelStats.total} members
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {panelStats.urgent} urgent · {panelStats.attention} attention ·{" "}
                    {panelStats.rpmConnected} RPM
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Open work</p>
                  <p className="font-medium text-foreground">
                    {activeAlerts} clinical alerts · {messagesAwaitingReply} messages
                    awaiting reply
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Quality reporting</p>
                <p className="font-medium text-foreground">
                  {attributionPeriod} attribution period · enabled
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">EHR context</p>
                <p className="font-medium text-foreground">
                  Ambulatory · {CLINICIAN_PRACTICE.ehr} integration
                  {source === "mock" ? " (demo)" : ""}
                </p>
              </div>
              <Link
                href="/doctor"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Open today&apos;s briefing
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
