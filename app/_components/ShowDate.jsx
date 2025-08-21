"use client";
import { differenceInCalendarDays, format } from "date-fns";

export function ShowDate({ dateString }) {
  const dateObj = new Date(dateString);

  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();

  const today = new Date();
  const isToday = today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  let date = `${day} ${dateObj.toLocaleString("default", {
    month: "long",
  })}, ${year}`;

  const differenceInDays = Math.abs(differenceInCalendarDays(dateObj, today));

  if (differenceInDays < 7) {
    date = format(dateObj, "EEEE");
  }

  return (
    <div className="w-full my-3 text-sm lg:text-md flex justify-center items-center">
      <p className="bg-[var(--muted)] py-2 px-4 rounded-md shadow-sm">
        {isToday ? "Today" : date}
      </p>
    </div>
  );
}