"use client";

import ErrorCard from "@/components/error-card";
import { Icons } from "@/components/icons";
import { Nav } from "@/components/nav";
import { ScrollContent, ScrollWrapper } from "@/components/scroll-wrapper";
import {
  SectionActions,
  SectionHeader,
  SectionHeaderHeading,
} from "@/components/section-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMonthlyProgress,
  useProgressOverview,
  useWeeklyActivity,
} from "@/hooks/use-progress";
import { useUserWorkouts } from "@/hooks/use-workouts";
import { useSession } from "@/lib/auth/auth-client";
import { cn, formatDate, pluralize } from "@/lib/utils";
import { addDays, format, startOfMonth, startOfWeek } from "date-fns";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();
  const { data: workouts, isLoading: workoutsLoading } = useUserWorkouts();
  const { data: overview, isLoading: overviewLoading } = useProgressOverview();
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyProgress();
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyActivity();

  if (!session) return;

  const recentWorkouts = workouts?.slice(0, 3) || [];

  if (workoutsLoading || overviewLoading || monthlyLoading || weeklyLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-20 w-full rounded-3xl" />
      </div>
    );
  }

  // Calculate weekly goal progress (assuming 6 workouts per week)
  const weeklyGoal = 6;
  const weeklyProgress = Math.min(
    (overview?.thisWeekLogs || 0) / weeklyGoal,
    1
  );

  // Get days of current week
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const currentMonthStart = startOfMonth(now);

  // Create a set of dates with workouts
  const workoutDates = new Set(
    weekly
      ?.filter((d) => d.count > 0)
      .map((d) => {
        const date = new Date(d.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }) || []
  );

  return (
    <div className="space-y-4">
      {/* Weekly Goal Card */}
      <div className="bg-linear-to-br from-secondary-foreground/60 to-secondary-foreground rounded-b-3xl p-4 -mx-safe-or-4 pt-safe-offset-4 space-y-10 overflow-hidden">
        <Nav user={session.user} />

        <div className="flex items-center justify-between text-muted">
          <div className="flex items-center gap-4">
            <div className="relative size-12">
              <Icons.progressRing
                progress={weeklyProgress}
                className="size-12 -rotate-90"
              />
              <div className="absolute inset-0 flex items-center justify-center font-semibold">
                {overview?.thisWeekLogs}/{weeklyGoal}
              </div>
            </div>
            <div>
              <div className="text-[0.625rem] opacity-50 font-semibold uppercase tracking-wider">
                Weekly Goal
              </div>
              <button className="font-medium text-[0.9375rem] hover:opacity-80 transition-opacity">
                Tap to edit
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[0.625rem] opacity-50 font-semibold uppercase tracking-wider">
              Best Streak
            </div>
            <div className="font-medium text-[0.9375rem] hover:opacity-80 transition-opacity">
              {overview?.bestStreak || 0} weeks
            </div>
          </div>
        </div>
      </div>

      {/* This Week Calendar */}
      <div className="bg-muted flex gap-3 flex-col rounded-xl border p-3">
        <div className="flex items-center text-xs font-semibold justify-between">
          <div className="uppercase tracking-wider text-muted-foreground">
            This Week
          </div>
          <span className="tracking-tight text-secondary-foreground">
            {overview?.thisWeekLogs || 0} of {weeklyGoal}
          </span>
        </div>

        <div className="grid auto-fit-2xl gap-2">
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === now.toDateString();
            const hasWorkout = workoutDates.has(day.getTime());

            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  {format(day, "EEEEE")}
                </div>
                <div
                  className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
                    isToday &&
                      hasWorkout &&
                      "bg-primary text-primary-foreground",
                    isToday &&
                      !hasWorkout &&
                      "bg-secondary-foreground/50 text-secondary ring-2 ring-accent",
                    !isToday && hasWorkout && "bg-amber-600/20 text-amber-400",
                    !isToday &&
                      !hasWorkout &&
                      "bg-secondary-foreground/70 text-secondary"
                  )}
                >
                  {hasWorkout ? <Icons.check /> : format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Link
        href="/workouts/new"
        className={cn(
          buttonVariants({ variant: "gradient", size: "lg" }),
          "w-full font-serif"
        )}
      >
        <Icons.plus />
        Start New Workout
      </Link>

      {/* Recent Workouts */}
      <div className="space-y-1">
        <SectionHeader className="items-center justify-between">
          <SectionHeaderHeading
            as="h2"
            className="text-xs uppercase text-muted-foreground tracking-wide"
          >
            Recent Workouts
          </SectionHeaderHeading>
          <SectionActions>
            <Link
              data-slot="button"
              href="/workouts"
              className={cn(
                buttonVariants({ variant: "link", size: "xs" }),
                "h-auto p-0 rounded-none hover:no-underline gap-1 has-[>svg]:px-0"
              )}
            >
              See All <Icons.arrowRight />
            </Link>
          </SectionActions>
        </SectionHeader>

        <ScrollWrapper>
          {recentWorkouts.length === 0 ? (
            <ErrorCard
              title="No workouts yet"
              description="Lose weight, get fit, build muscle. Unlock your best."
              actionButton={
                <Link
                  href="/workouts/new"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "sm" })
                  )}
                >
                  Start your transformation
                  <Icons.arrowRight />
                </Link>
              }
            />
          ) : (
            <>
              {recentWorkouts.map((workout) => (
                <ScrollContent key={workout.id}>
                  <Link
                    href={`/workouts/${workout.id}`}
                    className="bg-muted flex gap-3 w-42 flex-col rounded-xl border p-3 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-8 shrink-0 [&_svg]:shrink-0"
                  >
                    <Icons.trendingDown />

                    <div className="space-y-0.5">
                      <div className="leading-tight font-serif font-medium line-clamp-1">
                        {workout.name}
                      </div>
                      <div className="text-xs font-medium text-accent-foreground/30">
                        {formatDate(workout.createdAt)}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center flex-wrap text-xs text-muted-foreground">
                      {workout.exercises.map((ex, i) => (
                        <div
                          key={`category-${ex.name}`}
                          className="inline-flex items-center"
                        >
                          <span className="text-nowrap">{ex.name}</span>
                          {i < workout.exercises.length - 1 && (
                            <Icons.dot className="size-4 -mx-0.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </Link>
                </ScrollContent>
              ))}
            </>
          )}
        </ScrollWrapper>
      </div>

      {/* Monthly Progress */}
      <div className="space-y-1">
        <SectionHeader className="items-center justify-between">
          <SectionHeaderHeading
            as="h2"
            className="text-lg font-medium font-serif"
          >
            Monthly Progress
          </SectionHeaderHeading>
          <SectionActions>
            <Link
              data-slot="button"
              href="/progress"
              className={cn(
                buttonVariants({ variant: "link", size: "xs" }),
                "h-auto p-0 rounded-none hover:no-underline gap-1 has-[>svg]:px-0"
              )}
            >
              See All <Icons.arrowRight />
            </Link>
          </SectionActions>
        </SectionHeader>

        <ScrollWrapper>
          {!monthly || monthly.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800 rounded-3xl">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No activity yet</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {monthly.map((month) => {
                const date = new Date(month.year, month.month - 1);
                const isCurrentMonth =
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

                const goalWorkouts = 20;
                const progressPercentage = Math.min(
                  (month.totalWorkouts / goalWorkouts) * 100,
                  100
                );

                const monthStart = startOfMonth(date);

                const isCurrentOrPast = monthStart <= currentMonthStart;

                // Get weather icon based on month
                // const getMonthIcon = () => {
                //   if (month.totalWorkouts === 0)
                //     return (
                //       <svg
                //         className="w-8 h-8 text-gray-600"
                //         fill="currentColor"
                //         viewBox="0 0 20 20"
                //       >
                //         <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                //       </svg>
                //     );
                //   if (month.totalWorkouts >= goalWorkouts)
                //     return (
                //       <svg
                //         className="w-8 h-8 text-yellow-500"
                //         fill="currentColor"
                //         viewBox="0 0 20 20"
                //       >
                //         <path
                //           fillRule="evenodd"
                //           d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                //           clipRule="evenodd"
                //         />
                //       </svg>
                //     );
                //   return (
                //     <svg
                //       className="w-8 h-8 text-blue-500"
                //       fill="currentColor"
                //       viewBox="0 0 20 20"
                //     >
                //       <path
                //         fillRule="evenodd"
                //         d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"
                //         clipRule="evenodd"
                //       />
                //     </svg>
                //   );
                // };

                return (
                  <ScrollContent key={`${month.year}-${month.month}`}>
                    <div
                      className={cn(
                        "bg-muted flex gap-3.5 w-34 flex-col rounded-xl border p-3 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-10 shrink-0 [&_svg]:shrink-0",
                        {
                          "ring-3 ring-primary/70 border-transparent":
                            isCurrentMonth,
                        },
                        { "opacity-60": !isCurrentOrPast }
                      )}
                    >
                      {/* {getMonthIcon()} */}

                      <div className="font-serif font-[460]">
                        {format(date, "MMMM")}
                      </div>

                      <Progress value={progressPercentage} />
                      <p
                        className={cn(
                          "font-medium text-xs text-accent-foreground/30",
                          {
                            "text-muted-foreground": month.totalWorkouts > 0,
                          }
                        )}
                      >
                        {month.totalWorkouts > 0 ? (
                          <>
                            {pluralize(month.totalWorkouts, "workout", {
                              wrapper: (n) => (
                                <span
                                  key={n}
                                  className="text-primary/70 font-semibold text-sm/none"
                                >
                                  {n}
                                </span>
                              ),
                            })}
                          </>
                        ) : (
                          "Coming up"
                        )}
                      </p>
                    </div>
                  </ScrollContent>
                );
              })}
            </>
          )}
        </ScrollWrapper>
      </div>
    </div>
  );
}
