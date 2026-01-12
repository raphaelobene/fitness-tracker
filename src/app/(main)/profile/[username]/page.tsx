"use client";

import AvatarWrapper from "@/components/avatar-wrapper";
import { FollowButton } from "@/components/social/follow-button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutCard } from "@/components/workout/workout-card";
import { useUserLogs } from "@/hooks/use-logs";
import { useUserProfile } from "@/hooks/use-social";
import { useUserWorkouts } from "@/hooks/use-workouts";
import { useSession } from "@/lib/auth/auth-client";
import { formatDistanceToNow } from "date-fns";
import { use } from "react";

export default function ProfilePage({ params }: SearchParamProps) {
  const { username } = use(params);
  const { data: session } = useSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(username);
  const { data: workouts, isLoading: workoutsLoading } = useUserWorkouts(
    profile?.id
  );
  const { data: logs, isLoading: logsLoading } = useUserLogs(profile?.id);

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
      </div>
    );
  }

  const isOwnProfile = session?.user.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <AvatarWrapper user={profile} className="size-24" />

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile.name || profile.username}
                  </h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
                {!isOwnProfile && (
                  <FollowButton
                    userId={profile.id}
                    initialFollowing={profile.isFollowing || false}
                  />
                )}
              </div>

              {profile.bio && (
                <p className="mt-3 text-gray-700">{profile.bio}</p>
              )}

              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <span className="font-semibold">
                    {profile._count.workouts}
                  </span>{" "}
                  <span className="text-gray-500">workouts</span>
                </div>
                <div>
                  <span className="font-semibold">
                    {profile._count.followers}
                  </span>{" "}
                  <span className="text-gray-500">followers</span>
                </div>
                <div>
                  <span className="font-semibold">
                    {profile._count.following}
                  </span>{" "}
                  <span className="text-gray-500">following</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="logs">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="space-y-4 mt-6">
          {workoutsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !workouts || workouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No workouts yet</p>
            </div>
          ) : (
            workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-6">
          {logsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No activity yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {log.workout.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(log.date), {
                          addSuffix: true,
                        })}
                      </p>
                      {log.duration && (
                        <p className="text-sm text-gray-600 mt-1">
                          Duration: {Math.floor(log.duration / 60)} minutes
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
