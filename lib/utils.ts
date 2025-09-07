import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Handles API errors and sets field errors using Formik helpers
 * @param error - The error object from the API response
 * @param setFieldError - Formik's setFieldError function
 */
export const catchError = (
  error: any,
  setFieldError: (field: string, message: string) => void,
) => {
  error?.data &&
    Object.entries(error.data).forEach(([field, message]) => {
      setFieldError(field, message as string);
    });
};
