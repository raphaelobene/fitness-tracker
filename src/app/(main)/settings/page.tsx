"use client";

import { LoadingSwap } from "@/components/loading-swap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateUser, useUserSession } from "@/hooks/use-session";
import { VISIBILITY, Visibility } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { Bell, Settings as SettingsIcon, Shield, User } from "lucide-react";
import { useEffect, useReducer } from "react";
import { toast } from "sonner";

type Units = "metric" | "imperial";
type WeekStart = "sunday" | "monday";

type State = {
  name: string;
  bio: string;
  units: Units;
  defaultVisibility: Visibility;
  weekStart: WeekStart;
};

type Action = {
  type: "SET_FIELD";
  field: keyof State;
  value: State[keyof State];
};

const initialState: State = {
  name: "",
  bio: "",
  units: "metric",
  defaultVisibility: "PRIVATE" as const,
  weekStart: "monday",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    default:
      return state;
  }
}

export default function SettingsPage() {
  const { data } = useUserSession();
  const { mutateAsync, isPending } = useUpdateUser();
  const [state, dispatch] = useReducer(reducer, initialState);

  const user = data?.user;
  // const preferences = data?.preferences;

  useEffect(() => {
    if (!user) return;

    dispatch({
      type: "SET_FIELD",
      field: "name",
      value: user.name ?? "",
    });
    dispatch({
      type: "SET_FIELD",
      field: "bio",
      value: user.bio ?? "",
    });
  }, [user]);

  if (!user) {
    return null;
  }

  const handleUpdateProfile = async () =>
    await mutateAsync({
      name: state.name.trim(),
      bio: state.bio.trim() || undefined,
    });

  const handleSavePreferences = () => {
    localStorage.setItem(
      "workout-preferences",
      JSON.stringify({
        units: state.units,
        defaultVisibility: state.defaultVisibility,
        weekStart: state.weekStart,
      })
    );

    toast.success("Preferences saved");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details and how others see you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" disabled>
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming soon
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user.username || ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={state.name}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "name",
                        value: e.target.value,
                      })
                    }
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={state.bio}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "bio",
                        value: e.target.value,
                      })
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {state.bio.length}/160 characters
                  </p>
                </div>
              </div>

              <Button onClick={handleUpdateProfile} disabled={isPending}>
                <LoadingSwap isLoading={isPending}>Save Changes</LoadingSwap>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Preferences</CardTitle>
              <CardDescription>
                Customize your workout experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Select
                    value={state.units}
                    onValueChange={(v) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "units",
                        value: v as Units,
                      })
                    }
                  >
                    <SelectTrigger id="units">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">
                        Imperial (lbs, in)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Default Workout Visibility</Label>
                  <Select
                    value={state.defaultVisibility}
                    onValueChange={(v) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "defaultVisibility",
                        value: v as Visibility,
                      })
                    }
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY.map((visibility) => (
                        <SelectItem key={visibility} value={visibility}>
                          {visibility.charAt(0) +
                            visibility.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekStart">Week Starts On</Label>
                  <Select
                    value={state.weekStart}
                    onValueChange={(v) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "weekStart",
                        value: v as WeekStart,
                      })
                    }
                  >
                    <SelectTrigger id="weekStart">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Notification settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Privacy settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
