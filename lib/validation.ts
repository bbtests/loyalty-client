// Validation utilities similar to Formik
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export const validateField = (
  value: any,
  rules: ValidationRule,
): string | undefined => {
  if (
    rules.required &&
    (!value || (typeof value === "string" && !value.trim()))
  ) {
    return "This field is required";
  }

  // Run custom validation first if it exists
  if (rules.custom && value !== undefined && value !== null) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  if (value && typeof value === "string") {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return "Invalid format";
    }
  }

  return undefined;
};

export const validateForm = (
  data: Record<string, any>,
  schema: ValidationSchema,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach((field) => {
    const error = validateField(data[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Common validation schemas
export const userValidationSchema: ValidationSchema = {
  name: { required: true, minLength: 2 },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address";
      }
    },
  },
  password: { required: true, minLength: 6 },
  company: { required: true },
  phone: {
    pattern: /^[+]?[1-9][\d]{0,15}$/,
    custom: (value) => {
      if (value && !/^[+]?[1-9][\d]{0,15}$/.test(value)) {
        return "Please enter a valid phone number";
      }
    },
  },
};
