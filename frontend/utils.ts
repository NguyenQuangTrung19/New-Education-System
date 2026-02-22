
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const calculateAge = (dateString: string): number => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const isValidPhone = (phone: string): boolean => {
  // Starts with 0, exactly 10 digits
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidCitizenId = (id: string): boolean => {
  // Exactly 12 digits
  const idRegex = /^\d{12}$/;
  return idRegex.test(id);
};

export const isDateInFutureOrToday = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part of today
  
  // Create a date object for the input at the end of that day to allow "today" selection
  const inputDateEnd = new Date(inputDate);
  inputDateEnd.setHours(23, 59, 59, 999);

  return inputDateEnd >= today;
};

export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11. August is 7.
  
  // If we are in August (7) or later, it's the start of a new academic year (e.g., Aug 2025 -> 2025-2026)
  // If we are before August, we are in the second half of the previous academic year (e.g., Jan 2026 -> 2025-2026)
  if (month >= 7) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

/**
 * Generates an array of page numbers and ellipses for smart pagination rendering.
 * @param currentPage The active page (1-based)
 * @param totalPages The total number of pages
 * @returns Array representing the sequence of pages and ellipses (e.g., [1, 2, '...', 50])
 */
export const generatePagination = (currentPage: number, totalPages: number): (number | string)[] => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipses.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 5, an ellipsis, and the last page.
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first page, an ellipsis, and the last 5 pages.
  if (currentPage >= totalPages - 2) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
