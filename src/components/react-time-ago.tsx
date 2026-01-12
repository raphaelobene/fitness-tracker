"use client";

import JavascriptTimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useMemo } from "react";
import TimeAgo from "react-time-ago";

import { formatDate } from "@/lib/utils";

let localeRegistered = false;

if (typeof window !== "undefined" && !localeRegistered) {
  JavascriptTimeAgo.addLocale(en);
  localeRegistered = true;
}

type TimeStyle =
  | "twitter"
  | "twitter-now"
  | "twitter-first-minute"
  | "round"
  | "round-minute";

interface ReactTimeAgoProps {
  className?: string;
  date: Date | string | number;
  locale?: string;
  forceFullFormat?: boolean;

  timeStyle?: TimeStyle;
}

export default function ReactTimeAgo({
  className,
  date,
  locale = "en-US",
  forceFullFormat = false,
  timeStyle = "twitter",
}: ReactTimeAgoProps) {
  const dateObj = useMemo(() => new Date(date), [date]);
  const isoDateString = useMemo(() => dateObj.toISOString(), [dateObj]);
  const formattedDate = useMemo(() => formatDate(dateObj), [dateObj]);

  if (forceFullFormat) {
    return (
      <time className={className} dateTime={isoDateString}>
        {formattedDate}
      </time>
    );
  }

  return (
    <TimeAgo
      className={className}
      date={dateObj}
      timeStyle={timeStyle}
      tooltip={false}
      locale={locale}
    />
  );
}
