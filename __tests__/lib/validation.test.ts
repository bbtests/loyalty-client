import {
  validateField,
  validateForm,
  userValidationSchema,
} from "@/lib/validation";

describe("Validation Utils", () => {
  describe("validateField", () => {
    it("validates required field", () => {
      const rules = { required: true };

      expect(validateField("", rules)).toBe("This field is required");
      expect(validateField("   ", rules)).toBe("This field is required");
      expect(validateField(null, rules)).toBe("This field is required");
      expect(validateField(undefined, rules)).toBe("This field is required");
      expect(validateField("valid", rules)).toBeUndefined();
    });

    it("validates minLength", () => {
      const rules = { minLength: 5 };

      expect(validateField("abc", rules)).toBe(
        "Minimum length is 5 characters",
      );
      expect(validateField("abcde", rules)).toBeUndefined();
      expect(validateField("abcdef", rules)).toBeUndefined();
    });

    it("validates maxLength", () => {
      const rules = { maxLength: 5 };

      expect(validateField("abcdef", rules)).toBe(
        "Maximum length is 5 characters",
      );
      expect(validateField("abcde", rules)).toBeUndefined();
      expect(validateField("abc", rules)).toBeUndefined();
    });

    it("validates pattern", () => {
      const rules = { pattern: /^[A-Z]+$/ };

      expect(validateField("abc", rules)).toBe("Invalid format");
      expect(validateField("ABC", rules)).toBeUndefined();
      expect(validateField("123", rules)).toBe("Invalid format");
    });

    it("validates custom function", () => {
      const rules = {
        custom: (value: any) => {
          if (value === "invalid") return "Custom error message";
          return undefined;
        },
      };

      expect(validateField("invalid", rules)).toBe("Custom error message");
      expect(validateField("valid", rules)).toBeUndefined();
    });

    it("handles non-string values for length validation", () => {
      const rules = { minLength: 5 };

      expect(validateField(123, rules)).toBeUndefined();
      expect(validateField(null, rules)).toBeUndefined();
      expect(validateField(undefined, rules)).toBeUndefined();
    });

    it("combines multiple rules", () => {
      const rules = {
        required: true,
        minLength: 3,
        maxLength: 10,
        pattern: /^[a-z]+$/,
      };

      expect(validateField("", rules)).toBe("This field is required");
      expect(validateField("ab", rules)).toBe("Minimum length is 3 characters");
      expect(validateField("abcdefghijk", rules)).toBe(
        "Maximum length is 10 characters",
      );
      expect(validateField("ABC", rules)).toBe("Invalid format");
      expect(validateField("abc", rules)).toBeUndefined();
    });
  });

  describe("validateForm", () => {
    it("validates entire form", () => {
      const schema = {
        name: { required: true, minLength: 2 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        age: {
          custom: (value: any) =>
            value < 18 ? "Must be 18 or older" : undefined,
        },
      };

      const data = {
        name: "J",
        email: "invalid-email",
        age: 16,
      };

      const errors = validateForm(data, schema);

      expect(errors).toEqual({
        name: "Minimum length is 2 characters",
        email: "Invalid format",
        age: "Must be 18 or older",
      });
    });

    it("returns empty object for valid form", () => {
      const schema = {
        name: { required: true, minLength: 2 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      };

      const data = {
        name: "John Doe",
        email: "john@example.com",
      };

      const errors = validateForm(data, schema);

      expect(errors).toEqual({});
    });

    it("handles empty schema", () => {
      const errors = validateForm({ name: "test" }, {});
      expect(errors).toEqual({});
    });

    it("handles missing fields in data", () => {
      const schema = {
        name: { required: true },
        email: { required: true },
      };

      const data = { name: "John" };
      const errors = validateForm(data, schema);

      expect(errors).toEqual({
        email: "This field is required",
      });
    });
  });

  describe("userValidationSchema", () => {
    it("validates name field", () => {
      const schema = userValidationSchema;

      expect(validateField("", schema.name)).toBe("This field is required");
      expect(validateField("J", schema.name)).toBe(
        "Minimum length is 2 characters",
      );
      expect(validateField("John", schema.name)).toBeUndefined();
    });

    it("validates email field", () => {
      const schema = userValidationSchema;

      expect(validateField("", schema.email)).toBe("This field is required");
      expect(validateField("invalid-email", schema.email)).toBe(
        "Please enter a valid email address",
      );
      expect(validateField("user@domain", schema.email)).toBe(
        "Please enter a valid email address",
      );
      expect(validateField("user@domain.com", schema.email)).toBeUndefined();
    });

    it("validates password field", () => {
      const schema = userValidationSchema;

      expect(validateField("", schema.password)).toBe("This field is required");
      expect(validateField("12345", schema.password)).toBe(
        "Minimum length is 6 characters",
      );
      expect(validateField("123456", schema.password)).toBeUndefined();
    });

    it("validates company field", () => {
      const schema = userValidationSchema;

      expect(validateField("", schema.company)).toBe("This field is required");
      expect(validateField("Acme Corp", schema.company)).toBeUndefined();
    });

    it("validates phone field", () => {
      const schema = userValidationSchema;

      expect(validateField("", schema.phone)).toBeUndefined(); // Not required
      expect(validateField("1234567890", schema.phone)).toBeUndefined();
      expect(validateField("+1234567890", schema.phone)).toBeUndefined();
      expect(validateField("0123456789", schema.phone)).toBe(
        "Please enter a valid phone number",
      );
      expect(validateField("abc123", schema.phone)).toBe(
        "Please enter a valid phone number",
      );
    });

    it("validates complete user form", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        company: "Acme Corp",
        phone: "1234567890",
      };

      const errors = validateForm(validData, userValidationSchema);
      expect(errors).toEqual({});
    });

    it("validates invalid user form", () => {
      const invalidData = {
        name: "J",
        email: "invalid-email",
        password: "123",
        company: "",
        phone: "0123456789",
      };

      const errors = validateForm(invalidData, userValidationSchema);
      expect(errors).toEqual({
        name: "Minimum length is 2 characters",
        email: "Please enter a valid email address",
        password: "Minimum length is 6 characters",
        company: "This field is required",
        phone: "Please enter a valid phone number",
      });
    });
  });
});
