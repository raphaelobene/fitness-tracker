import { clsx, type ClassValue } from "clsx";
import { intervalToDuration } from "date-fns";
import numeral from "numeral";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  const nameParts = name.split(" ");
  const initials = nameParts.map((part) => part.charAt(0).toUpperCase());
  return initials.join("");
}

export function createSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const startOfGiven = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffInDays =
    (startOfToday.getTime() - startOfGiven.getTime()) / (1000 * 60 * 60 * 24);

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "2-digit",
  });
}

export function durationTime(seconds: number): string {
  const duration = intervalToDuration({
    start: 0,
    end: seconds * 1000,
  });

  if (duration.hours && duration.hours > 0) {
    const value =
      duration.hours +
      (duration.minutes ?? 0) / 60 +
      (duration.seconds ?? 0) / 3600;
    return `${numeral(value).format("0[.]0")}hr`;
  }
  if (duration.minutes && duration.minutes > 0) {
    const value = duration.minutes + (duration.seconds ?? 0) / 60;
    return `${numeral(value).format("0[.]0")}min`;
  }
  return `${numeral(seconds).format("0[.]0")}sec`;

  // return formatDuration(duration, {
  //   format: ["hours", "minutes", "seconds"],
  //   zero: false,
  //   delimiter: "",
  // })
  //   .replace("hours", "hr")
  //   .replace("hour", "hr")
  //   .replace("minutes", "min")
  //   .replace("minute", "min")
  //   .replace("seconds", "sec")
  //   .replace("second", "sec");
}

type PluralizerOptions = {
  plural?: string;
  wrapper?: (count: string) => ReactNode;
  format?: (n: number) => string;
  showCount?: boolean;
  zeroForm?: string;
};

export function pluralize(
  count: number,
  singular: string,
  options?: PluralizerOptions
) {
  const { plural, wrapper, showCount = true, zeroForm, format } = options || {};

  if (count === 0 && zeroForm) {
    return zeroForm;
  }

  const formatCount = format ? format(count) : count.toString();

  const word = count === 1 ? singular : plural || defaultPluralize(singular);

  if (!showCount) {
    return word;
  }

  if (wrapper) {
    return [wrapper(formatCount), " ", word]; // jsx
  }

  return `${formatCount} ${word}`;
}

function defaultPluralize(singular: string) {
  if (
    singular.endsWith("y") &&
    !["a", "e", "i", "o", "u"].includes(singular[singular.length - 2])
  ) {
    return singular.slice(0, -1) + "ies";
  }

  if (
    singular.endsWith("s") ||
    singular.endsWith("x") ||
    singular.endsWith("z") ||
    singular.endsWith("ch") ||
    singular.endsWith("sh")
  ) {
    return singular + "es";
  }

  if (singular.endsWith("f")) return singular.slice(0, -1) + "ves";
  if (singular.endsWith("fe")) return singular.slice(0, -2) + "ves";

  return singular + "s";
}
