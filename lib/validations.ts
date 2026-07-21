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

// --- Project Validations ---

export interface CreateProjectInput {
  name: string;
  location: string;
  budget: number;
  deadline: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  location?: string;
  budget?: number;
  deadline?: string;
  description?: string;
  status?: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export function validateCreateProjectInput(input: CreateProjectInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Project name must be at least 2 characters";
  }

  if (!input.location || input.location.trim().length < 2) {
    errors.location = "Location must be at least 2 characters";
  }

  if (!input.budget || input.budget <= 0) {
    errors.budget = "Budget must be greater than 0";
  }

  if (!input.deadline) {
    errors.deadline = "Deadline is required";
  } else {
    const deadlineDate = new Date(input.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = "Invalid date format";
    } else if (deadlineDate <= new Date()) {
      errors.deadline = "Deadline must be in the future";
    }
  }

  return errors;
}

export function validateUpdateProjectInput(input: UpdateProjectInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.name !== undefined && input.name.trim().length < 2) {
    errors.name = "Project name must be at least 2 characters";
  }

  if (input.location !== undefined && input.location.trim().length < 2) {
    errors.location = "Location must be at least 2 characters";
  }

  if (input.budget !== undefined && input.budget <= 0) {
    errors.budget = "Budget must be greater than 0";
  }

  if (input.deadline !== undefined) {
    const deadlineDate = new Date(input.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = "Invalid date format";
    } else if (deadlineDate <= new Date()) {
      errors.deadline = "Deadline must be in the future";
    }
  }

  if (
    input.status !== undefined &&
    !["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"].includes(input.status)
  ) {
    errors.status = "Invalid project status";
  }

  return errors;
}

