export interface SignupInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "EDITOR" | "VIEWER";
}

export interface SigninInput {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export function validateSignupInput(input: SignupInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!input.password || input.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!input.role || !["EDITOR", "VIEWER"].includes(input.role)) {
    errors.role = "Please select a valid role";
  }

  return errors;
}

export function validateSigninInput(input: SigninInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!input.password) {
    errors.password = "Password is required";
  }

  return errors;
}

