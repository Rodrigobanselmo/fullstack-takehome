export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

export const formatMessageTimestamp = (date: Date): string => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString) {
    return null;
  }

  const parts = dateString.split("-").map(Number);
  const isValidDate = parts.length === 3 && parts.every((part) => !isNaN(part));

  if (!isValidDate) {
    return null;
  }

  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor

  // Validate the created date
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};
