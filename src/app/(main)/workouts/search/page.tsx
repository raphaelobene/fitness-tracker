"use client";

import { useDebounce } from "@/hooks/usehooks";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import HeaderActions from "@/components/header-actions";
import { Icons } from "@/components/icons";
import {
  SectionHeader,
  SectionHeaderDescription,
  SectionHeaderHeading,
} from "@/components/section-header";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { SearchResults } from "@/components/workout/search-results";
import { useQueryString } from "@/hooks/use-query-string";
import { useFeedWorkouts, useUserWorkouts } from "@/hooks/use-workouts";
import { VISIBILITY } from "@/lib/constants";

// Extracted search input component
const SearchInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <InputGroup className="flex-1">
    <InputGroupInput
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search workouts..."
      value={value}
    />
    <InputGroupAddon>
      <Icons.search />
    </InputGroupAddon>
  </InputGroup>
);

// Memoized filter component
const FilterSection = () => {
  const { getQueryParam, setQueryParam } = useQueryString();

  const visibility = useMemo(
    () => (getQueryParam("visibility") ?? "all") as string,
    [getQueryParam]
  );

  const sortBy = useMemo(
    () => (getQueryParam("sort") ?? "recent") as string,
    [getQueryParam]
  );

  const handleVisibilityChange = useCallback(
    (value: string) =>
      setQueryParam("visibility", value === "all" || !value ? null : value),
    [setQueryParam]
  );

  const handleSortChange = useCallback(
    (value: string) =>
      setQueryParam("sort", value === "recent" || !value ? null : value),
    [setQueryParam]
  );

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Icons.slider /> Filter
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto max-w-md w-full">
          <DrawerHeader>
            <DrawerTitle>Filter</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-2 pb-safe-offset-4 gap-3">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={handleVisibilityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workouts</SelectItem>
                  {VISIBILITY.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v.charAt(0) + v.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default function SearchWorkoutsPage() {
  const { getQueryParam, setQueryParams, currentParams } = useQueryString();

  const { data: myWorkouts, isLoading: myLoading } = useUserWorkouts();
  const { data: feedWorkouts, isLoading: feedLoading } = useFeedWorkouts();

  const isLoading = myLoading || feedLoading;

  // Get initial search value from URL
  const initialSearch = useMemo(
    () => getQueryParam("q") ?? "",
    [getQueryParam]
  );

  // State for local search input
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search → URL
  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      setQueryParams({
        q: debouncedSearch || null,
      });
    }
  }, [debouncedSearch, setQueryParams, initialSearch]);

  // Combine + dedupe workouts - memoized
  const workouts = useMemo(() => {
    if (!myWorkouts && !feedWorkouts) return [];
    const all = [...(myWorkouts || []), ...(feedWorkouts || [])];
    return Array.from(new Map(all.map((w) => [w.id, w])).values());
  }, [myWorkouts, feedWorkouts]);

  const hasFilters = useMemo(() => {
    const hasSearch = searchInput.trim().length > 0;

    const hasVisibility =
      currentParams.visibility && currentParams.visibility !== "all";

    const hasSort = currentParams.sort && currentParams.sort !== "recent";

    return hasSearch || hasVisibility || hasSort;
  }, [searchInput, currentParams.visibility, currentParams.sort]);

  // Clear filters handler
  const clearFilters = useCallback(() => {
    setSearchInput("");
    setQueryParams({
      q: null,
      visibility: null,
      sort: null,
    });
  }, [setQueryParams]);

  const asString = (value: unknown, fallback: string) =>
    typeof value === "string" ? value : fallback;

  return (
    <>
      <HeaderActions title="Search Workouts" />
      <div className="space-y-6">
        <SectionHeader className="flex-col gap-5">
          <div className="flex flex-col w-full gap-1">
            <SectionHeaderHeading className="text-3xl">
              Search Workouts
            </SectionHeaderHeading>
            <SectionHeaderDescription>
              Find workouts by name, description, or exercises
            </SectionHeaderDescription>
          </div>
          <div className="flex items-center w-full gap-3">
            <SearchInput value={searchInput} onChange={setSearchInput} />
            <FilterSection />
          </div>
        </SectionHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          <SearchResults
            workouts={workouts}
            searchQuery={searchInput}
            visibility={asString(currentParams.visibility, "all")}
            sortBy={asString(currentParams.sort, "recent")}
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
          />
        )}
      </div>
    </>
  );
}
