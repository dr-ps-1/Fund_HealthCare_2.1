"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { PatientMessageAvatar } from "@/components/messages/patient-message-avatar"
import { useClinicianMessages } from "@/components/providers/clinician-messages-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { MessageThread } from "@/lib/clinician-messages"
import { dismissOverlaysBeforeNavigate } from "@/lib/route-overlay"
import { cn } from "@/lib/utils"

export function ClinicianMessagesTrigger() {
  const router = useRouter()
  const { threads, unreadCount, markThreadRead, markAllThreadsRead } =
    useClinicianMessages()

  const needingReply = threads.filter((t) => t.needsReply && !t.read)

  function openThread(thread: MessageThread) {
    void markThreadRead(thread.patientId)
    dismissOverlaysBeforeNavigate(() => router.push(thread.href))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Messages</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Patient messages</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => void markAllThreadsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <p className="px-3 pb-2 text-xs text-muted-foreground">
          Secure threads from your attributed panel
        </p>
        <DropdownMenuSeparator />
        {needingReply.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No messages awaiting reply
          </p>
        ) : (
          needingReply.map((thread) => (
            <DropdownMenuItem
              key={thread.patientId}
              className={cn(
                "cursor-pointer flex items-start gap-3 p-3",
                !thread.read && "bg-muted/80"
              )}
              onSelect={() => openThread(thread)}
            >
              <PatientMessageAvatar
                name={thread.patientName}
                photo={thread.patientPhoto}
                className="h-9 w-9"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {thread.patientName}
                  </span>
                  {thread.rpm && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      RPM
                    </Badge>
                  )}
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {thread.lastTime}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {thread.keyMetric}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {thread.lastMessage}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
        {threads.filter((t) => t.read || !t.needsReply).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Recent · replied
            </p>
            {threads
              .filter((t) => t.read || !t.needsReply)
              .slice(0, 2)
              .map((thread) => (
                <DropdownMenuItem
                  key={`recent-${thread.patientId}`}
                  className="cursor-pointer p-3"
                  onSelect={() => openThread(thread)}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm text-foreground">{thread.patientName}</span>
                    <span className="text-xs text-muted-foreground">{thread.lastTime}</span>
                  </div>
                </DropdownMenuItem>
              ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link
            href={needingReply[0]?.href ?? threads[0]?.href ?? "/messages"}
            className="w-full text-center text-sm font-medium text-primary"
          >
            Open message center
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
