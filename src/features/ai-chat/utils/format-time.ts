/**
 * Format a date to a time string like "1:45 PM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date to a full date/time string for tooltips
 */
export function formatFullDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date to relative time ("2 min ago", "1 hour ago") or actual time for older messages
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  // Less than 1 minute
  if (diffSeconds < 60) {
    return "just now";
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  // More than 24 hours - show the actual time
  return formatTime(date);
}

/**
 * Get a date separator label like "Today", "Yesterday", or "Feb 18"
 */
export function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = isSameDay(date, today);
  const isYesterday = isSameDay(date, yesterday);

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates should show a date separator between them
 */
export function shouldShowDateSeparator(
  currentDate: Date,
  previousDate: Date | null
): boolean {
  if (!previousDate) return true;
  return !isSameDay(currentDate, previousDate);
}

