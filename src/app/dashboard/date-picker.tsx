"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  currentDate: string;
}

export function DatePicker({ currentDate }: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const date = parse(currentDate, "yyyy-MM-dd", new Date());

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", format(newDate, "yyyy-MM-dd"));
      router.push(`/dashboard?${params.toString()}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[240px] justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(date, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
