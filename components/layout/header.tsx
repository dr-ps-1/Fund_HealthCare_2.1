"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ClipboardList,
  MessageSquare,
  Search,
} from "lucide-react"
import { ClinicianAvatar } from "@/components/profile/clinician-photo-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { resetDemoMode } from "@/lib/demo"
import { dismissOverlaysBeforeNavigate } from "@/lib/route-overlay"
import {
  getClinicianNotifications,
  getClinicianNotificationUnreadCount,
  type ClinicianNotification,
  type ClinicianNotificationCategory,
} from "@/lib/clinician-notifications"
import {
  loadReadNotificationIds,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/clinician-notification-read"
import { useClinicianData } from "@/components/providers/clinician-data-provider"
import { useClinicianMessages } from "@/components/providers/clinician-messages-provider"
import { useClinicianNotificationPreferences } from "@/lib/clinician-notification-preferences"
import { cn } from "@/lib/utils"
import { ClinicianMessagesTrigger } from "@/components/layout/clinician-messages-trigger"
import { useIsMobile } from "@/hooks/use-mobile"

function NotificationIcon({
  category,
}: {
  category: ClinicianNotificationCategory
}) {
  switch (category) {
    case "urgent":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
    case "inbox":
      return <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
    case "message":
      return <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
    case "system":
      return <BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />
  }
}

function categoryLabel(category: ClinicianNotificationCategory): string {
  switch (category) {
    case "urgent":
      return "Urgent"
    case "inbox":
      return "Inbox"
    case "message":
      return "Message"
    case "system":
      return "System"
  }
}

export function Header() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { clinician, alerts, inbox, patients } = useClinicianData()
  const { messages, readPatientIds, source: messagesSource } = useClinicianMessages()
  const { preferences: notificationPreferences } =
    useClinicianNotificationPreferences()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<ClinicianNotification[]>([])
  const [messageReadVersion, setMessageReadVersion] = useState(0)

  useEffect(() => {
    const onRead = () => setMessageReadVersion((v) => v + 1)
    window.addEventListener("clinician-messages-read", onRead)
    return () => window.removeEventListener("clinician-messages-read", onRead)
  }, [])

  useEffect(() => {
    void messageReadVersion
    const readIds = loadReadNotificationIds()
    const items = getClinicianNotifications({
      alerts,
      inbox,
      messages,
      patients,
      readPatientIds:
        messagesSource === "supabase" ? readPatientIds : undefined,
      preferences: notificationPreferences,
    }).map((item) => ({
      ...item,
      read: item.read || readIds.has(item.id),
    }))
    setNotifications(items)
  }, [
    alerts,
    inbox,
    messages,
    patients,
    readPatientIds,
    messagesSource,
    messageReadVersion,
    notificationPreferences,
  ])

  const unreadCount = useMemo(
    () => getClinicianNotificationUnreadCount(notifications),
    [notifications]
  )

  function handleSignOut() {
    resetDemoMode()
    dismissOverlaysBeforeNavigate(() => router.push("/login"))
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      dismissOverlaysBeforeNavigate(() =>
        router.push(`/patients?search=${encodeURIComponent(q)}`)
      )
    }
  }

  function markAsRead(id: string) {
    markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  function openNotification(notification: ClinicianNotification) {
    markAsRead(notification.id)
    dismissOverlaysBeforeNavigate(() => router.push(notification.href))
  }

  function markAllRead() {
    markAllNotificationsRead(notifications.map((n) => n.id))
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6",
        isMobile ? "left-0" : "left-64"
      )}
    >
      <form className="relative w-full max-w-md" onSubmit={handleSearchSubmit}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search patients, alerts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "cursor-pointer flex flex-col items-start gap-1 p-3",
                    !notification.read && "bg-muted/80"
                  )}
                  onSelect={() => openNotification(notification)}
                >
                  <div className="flex w-full items-start gap-2">
                    <NotificationIcon category={notification.category} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {notification.title}
                        </span>
                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {categoryLabel(notification.category)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-center">
              <Link href="/alerts" className="w-full text-sm font-medium text-primary">
                View all alerts & inbox
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ClinicianMessagesTrigger />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <ClinicianAvatar
                name={clinician.name}
                photo={clinician.photo}
                className="h-8 w-8"
              />
              <span className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium leading-none">
                  {clinician.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {clinician.specialization}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
