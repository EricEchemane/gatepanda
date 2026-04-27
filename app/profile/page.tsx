import { redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { SetupCallout } from "@/components/setup-callout"
import { SubmitButton } from "@/components/submit-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCurrentSession } from "@/lib/auth"
import { hasDatabase } from "@/lib/env"
import { formatProfession } from "@/lib/formatters"
import { updateProfileAction } from "@/lib/actions"
import { getProfileByUserId } from "@/lib/queries"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  const profile = await getProfileByUserId(session.user.id)

  return (
    <AppShell
      user={session.user}
      title="Clinician Profile"
      description="Keep your PRC details and professional profile current so event admins can verify attendees quickly at the door."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Edit attendee identity</CardTitle>
            <CardDescription>
              This information appears on your QR-backed attendee profile and
              helps event admins validate your check-in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasDatabase ? (
              <form action={updateProfileAction} className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full name</label>
                  <Input
                    defaultValue={profile?.name ?? session.user.name ?? ""}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    defaultValue={profile?.email ?? session.user.email ?? ""}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="prcNumber" className="text-sm font-medium">
                    PRC number
                  </label>
                  <Input
                    id="prcNumber"
                    name="prcNumber"
                    defaultValue={profile?.prcNumber ?? ""}
                    placeholder="PRC-1234567"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="profession" className="text-sm font-medium">
                    Profession
                  </label>
                  <Select
                    name="profession"
                    defaultValue={profile?.profession ?? "doctor"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="medtech">
                        Medical Technologist
                      </SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label
                      htmlFor="organization"
                      className="text-sm font-medium"
                    >
                      Organization
                    </label>
                    <Input
                      id="organization"
                      name="organization"
                      defaultValue={profile?.organization ?? ""}
                      placeholder="Hospital, society, or clinic"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      City
                    </label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={profile?.city ?? ""}
                      placeholder="Manila"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Mobile number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={profile?.phone ?? ""}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
                <SubmitButton
                  type="submit"
                  className="w-full sm:w-fit"
                  pendingText="Saving profile..."
                >
                  Save profile
                </SubmitButton>
              </form>
            ) : (
              <SetupCallout
                title="Database setup needed"
                description="Profile saving uses your Supabase PostgreSQL connection."
                items={[
                  "Add DATABASE_URL to your local environment.",
                  "Run a Drizzle migration or push the schema before saving profiles.",
                ]}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How your QR identity looks</CardTitle>
            <CardDescription>
              A complete profile makes the verification screen much faster
              during check-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-5">
              <div className="text-sm text-muted-foreground">
                Displayed name
              </div>
              <div className="mt-1 text-xl font-semibold">
                {profile?.name ?? session.user.name ?? "Your name"}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-5">
              <div className="text-sm text-muted-foreground">Profession</div>
              <div className="mt-1 text-xl font-semibold">
                {formatProfession(profile?.profession)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-5">
              <div className="text-sm text-muted-foreground">PRC number</div>
              <div className="mt-1 text-xl font-semibold">
                {profile?.prcNumber ?? "Add your PRC number"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
