"use client";

import { Bell, Settings as SettingsIcon, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useReducer } from "react";
import { toast } from "sonner";

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

import { updateProfile } from "@/lib/actions/settings.actions";
import { useSession } from "@/lib/auth/auth-client";
import { Visibility } from "@/lib/constants";

type Units = "metric" | "imperial";
type WeekStart = "sunday" | "monday";

type State = {
  isLoading: boolean;
  name: string;
  bio: string;
  units: Units;
  defaultVisibility: Visibility;
  weekStart: WeekStart;
};

type Action =
  | { type: "INIT_FROM_SESSION"; payload: { name: string; bio: string } }
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_BIO"; payload: string }
  | { type: "SET_UNITS"; payload: Units }
  | { type: "SET_VISIBILITY"; payload: Visibility }
  | { type: "SET_WEEK_START"; payload: WeekStart }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: State = {
  isLoading: false,
  name: "",
  bio: "",
  units: "metric",
  defaultVisibility: Visibility.PRIVATE,
  weekStart: "monday",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT_FROM_SESSION":
      return {
        ...state,
        name: action.payload.name,
        bio: action.payload.bio,
      };

    case "SET_NAME":
      return { ...state, name: action.payload };

    case "SET_BIO":
      return { ...state, bio: action.payload };

    case "SET_UNITS":
      return { ...state, units: action.payload };

    case "SET_VISIBILITY":
      return { ...state, defaultVisibility: action.payload };

    case "SET_WEEK_START":
      return { ...state, weekStart: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!session?.user) return;

    dispatch({
      type: "INIT_FROM_SESSION",
      payload: {
        name: session.user.name ?? "",
        bio: session.user.bio ?? "",
      },
    });
  }, [session]);

  if (!session) {
    return null;
  }

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ??
    session.user.username?.[0]?.toUpperCase() ??
    "U";

  const handleUpdateProfile = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const result = await updateProfile({
        name: state.name.trim(),
        bio: state.bio.trim() || undefined,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

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

        {/* Profile */}
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
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback className="text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={state.name}
                    onChange={(e) =>
                      dispatch({ type: "SET_NAME", payload: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={state.bio}
                    onChange={(e) =>
                      dispatch({ type: "SET_BIO", payload: e.target.value })
                    }
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {state.bio.length}/160 characters
                  </p>
                </div>
              </div>

              <Button onClick={handleUpdateProfile} disabled={state.isLoading}>
                {state.isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <Select
                value={state.units}
                onValueChange={(v) =>
                  dispatch({ type: "SET_UNITS", payload: v as Units })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={state.defaultVisibility}
                onValueChange={(v) =>
                  dispatch({
                    type: "SET_VISIBILITY",
                    payload: v as Visibility,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Visibility.PRIVATE}>Private</SelectItem>
                  <SelectItem value={Visibility.FOLLOWERS}>
                    Followers Only
                  </SelectItem>
                  <SelectItem value={Visibility.PUBLIC}>Public</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={state.weekStart}
                onValueChange={(v) =>
                  dispatch({ type: "SET_WEEK_START", payload: v as WeekStart })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
