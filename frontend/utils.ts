
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
