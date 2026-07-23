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

// --- PAP Validations ---

export type PropertyType = "RESIDENTIAL" | "COMMERCIAL" | "AGRICULTURAL" | "INDUSTRIAL" | "OTHER";
export type CompensationStatus = "DRAFT" | "NOT_YET_PAID" | "COUNCIL_REVIEW" | "FINANCE_PROCESSING" | "PAID" | "FAILED" | "CANCELLED";

export interface CreatePapInput {
  projectId: string;
  ownerName: string;
  ownerId: string;
  ownerPhone?: string;
  ownerEmail?: string;
  civilStatus?: string;
  beneficiaryName: string;
  beneficiaryId: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  relationship?: string;
  affectedUpi: string;
  affectedArea: number;
  propertyType: PropertyType;
  sector: string;
  cell: string;
  village: string;
  landRegistration?: string;
  landDescription?: string;
  compensationAmount?: number;
  valuationDate?: string;
  valuationComment?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface UpdatePapInput {
  ownerName?: string;
  ownerId?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  civilStatus?: string;
  beneficiaryName?: string;
  beneficiaryId?: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  relationship?: string;
  affectedUpi?: string;
  affectedArea?: number;
  propertyType?: PropertyType;
  sector?: string;
  cell?: string;
  village?: string;
  landRegistration?: string;
  landDescription?: string;
  compensationStatus?: CompensationStatus;
  compensationAmount?: number;
  valuationDate?: string;
  valuationComment?: string;
  ownerSigned?: boolean;
  ownerSignedDate?: string;
  cellSigned?: boolean;
  cellSignedDate?: string;
  sectorSigned?: boolean;
  sectorSignedDate?: string;
  landVerified?: boolean;
  landVerifiedBy?: string;
  landVerifiedDate?: string;
  landTitleVerified?: boolean;
  landTitleVerifiedBy?: string;
  landTitleVerifiedDate?: string;
  idVerified?: boolean;
  idVerifiedBy?: string;
  idVerifiedDate?: string;
  bankName?: string;
  accountNumber?: string;
  paymentCode?: string;
  paidAmount?: number;
  paidDate?: string;
}

const VALID_PROPERTY_TYPES: PropertyType[] = ["RESIDENTIAL", "COMMERCIAL", "AGRICULTURAL", "INDUSTRIAL", "OTHER"];
const VALID_COMPENSATION_STATUSES: CompensationStatus[] = ["DRAFT", "NOT_YET_PAID", "COUNCIL_REVIEW", "FINANCE_PROCESSING", "PAID", "FAILED", "CANCELLED"];

export function validateCreatePapInput(input: CreatePapInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.projectId) {
    errors.projectId = "Project is required";
  }

  if (!input.ownerName || input.ownerName.trim().length < 2) {
    errors.ownerName = "Owner name must be at least 2 characters";
  }

  if (!input.ownerId || input.ownerId.trim().length < 2) {
    errors.ownerId = "Owner ID is required";
  }

  if (!input.beneficiaryName || input.beneficiaryName.trim().length < 2) {
    errors.beneficiaryName = "Beneficiary name must be at least 2 characters";
  }

  if (!input.beneficiaryId || input.beneficiaryId.trim().length < 2) {
    errors.beneficiaryId = "Beneficiary ID is required";
  }

  if (!input.affectedUpi || input.affectedUpi.trim().length < 2) {
    errors.affectedUpi = "Affected UPI is required";
  }

  if (!input.affectedArea || input.affectedArea <= 0) {
    errors.affectedArea = "Affected area must be greater than 0";
  }

  if (!input.propertyType || !VALID_PROPERTY_TYPES.includes(input.propertyType)) {
    errors.propertyType = "Please select a valid property type";
  }

  if (!input.sector || input.sector.trim().length < 2) {
    errors.sector = "Sector is required";
  }

  if (!input.cell || input.cell.trim().length < 2) {
    errors.cell = "Cell is required";
  }

  if (!input.village || input.village.trim().length < 2) {
    errors.village = "Village is required";
  }

  if (input.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.ownerEmail)) {
    errors.ownerEmail = "Please enter a valid email address";
  }

  if (input.beneficiaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.beneficiaryEmail)) {
    errors.beneficiaryEmail = "Please enter a valid email address";
  }

  return errors;
}

export function validateUpdatePapInput(input: UpdatePapInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.ownerName !== undefined && input.ownerName.trim().length < 2) {
    errors.ownerName = "Owner name must be at least 2 characters";
  }

  if (input.ownerId !== undefined && input.ownerId.trim().length < 2) {
    errors.ownerId = "Owner ID is required";
  }

  if (input.beneficiaryName !== undefined && input.beneficiaryName.trim().length < 2) {
    errors.beneficiaryName = "Beneficiary name must be at least 2 characters";
  }

  if (input.beneficiaryId !== undefined && input.beneficiaryId.trim().length < 2) {
    errors.beneficiaryId = "Beneficiary ID is required";
  }

  if (input.affectedUpi !== undefined && input.affectedUpi.trim().length < 2) {
    errors.affectedUpi = "Affected UPI is required";
  }

  if (input.affectedArea !== undefined && input.affectedArea <= 0) {
    errors.affectedArea = "Affected area must be greater than 0";
  }

  if (input.propertyType !== undefined && !VALID_PROPERTY_TYPES.includes(input.propertyType)) {
    errors.propertyType = "Please select a valid property type";
  }

  if (input.sector !== undefined && input.sector.trim().length < 2) {
    errors.sector = "Sector is required";
  }

  if (input.cell !== undefined && input.cell.trim().length < 2) {
    errors.cell = "Cell is required";
  }

  if (input.village !== undefined && input.village.trim().length < 2) {
    errors.village = "Village is required";
  }

  if (input.compensationStatus !== undefined && !VALID_COMPENSATION_STATUSES.includes(input.compensationStatus)) {
    errors.compensationStatus = "Invalid compensation status";
  }

  if (input.ownerEmail !== undefined && input.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.ownerEmail)) {
    errors.ownerEmail = "Please enter a valid email address";
  }

  if (input.beneficiaryEmail !== undefined && input.beneficiaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.beneficiaryEmail)) {
    errors.beneficiaryEmail = "Please enter a valid email address";
  }

  return errors;
}


// --- Valuation Validations ---

export interface UpdateValuationInput {
  compensationAmount?: number;
  valuationDate?: string;
  valuationComment?: string;
  compensationStatus?: CompensationStatus;
}

export function validateValuationInput(input: UpdateValuationInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.compensationAmount !== undefined && input.compensationAmount < 0) {
    errors.compensationAmount = "Compensation amount cannot be negative";
  }

  if (input.valuationDate !== undefined) {
    const date = new Date(input.valuationDate);
    if (isNaN(date.getTime())) {
      errors.valuationDate = "Invalid valuation date";
    }
  }

  if (input.valuationComment !== undefined && input.valuationComment.length > 500) {
    errors.valuationComment = "Comment must be 500 characters or less";
  }

  if (input.compensationStatus !== undefined && !VALID_COMPENSATION_STATUSES.includes(input.compensationStatus)) {
    errors.compensationStatus = "Invalid compensation status";
  }

  return errors;
}

// --- Council Review Validations ---

export type CouncilDecision = "PENDING" | "APPROVED" | "REVISION_NEEDED";

export interface RecordCouncilReviewInput {
  papId: string;
  reviewerName: string;
  reviewDate?: string;
  decision: CouncilDecision;
  feedback?: string;
  approvedAmount?: number;
}

const VALID_COUNCIL_DECISIONS: CouncilDecision[] = ["PENDING", "APPROVED", "REVISION_NEEDED"];

export function validateCouncilReviewInput(input: RecordCouncilReviewInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.papId) {
    errors.papId = "PAP is required";
  }

  if (!input.reviewerName || input.reviewerName.trim().length < 2) {
    errors.reviewerName = "Reviewer name must be at least 2 characters";
  }

  if (!input.decision || !VALID_COUNCIL_DECISIONS.includes(input.decision)) {
    errors.decision = "Please select a valid council decision";
  }

  if (input.approvedAmount !== undefined && input.approvedAmount < 0) {
    errors.approvedAmount = "Approved amount cannot be negative";
  }

  if (input.feedback !== undefined && input.feedback.length > 1000) {
    errors.feedback = "Feedback must be 1000 characters or less";
  }

  if (input.reviewDate !== undefined) {
    const date = new Date(input.reviewDate);
    if (isNaN(date.getTime())) {
      errors.reviewDate = "Invalid review date";
    }
  }

  return errors;
}

// --- Complaint Validations ---

export type ComplaintStatus = "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
export type ComplaintCategory = "LAND_ISSUE" | "VALUATION_ISSUE" | "OWNERSHIP_ISSUE" | "PAYMENT_ISSUE" | "OTHER";

export interface CreateComplaintInput {
  papId: string;
  projectId: string;
  category: ComplaintCategory;
  description: string;
  parentComplaintId?: string;
}

export interface UpdateComplaintInput {
  status?: ComplaintStatus;
  resolution?: string;
  resolvedById?: string;
  resolvedAt?: string;
}

const VALID_COMPLAINT_STATUSES: ComplaintStatus[] = ["SUBMITTED", "UNDER_REVIEW", "RESOLVED", "REJECTED"];
const VALID_COMPLAINT_CATEGORIES: ComplaintCategory[] = ["LAND_ISSUE", "VALUATION_ISSUE", "OWNERSHIP_ISSUE", "PAYMENT_ISSUE", "OTHER"];

export function validateCreateComplaintInput(input: CreateComplaintInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.papId) {
    errors.papId = "PAP is required";
  }

  if (!input.projectId) {
    errors.projectId = "Project is required";
  }

  if (!input.category || !VALID_COMPLAINT_CATEGORIES.includes(input.category)) {
    errors.category = "Please select a valid complaint category";
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  if (input.description && input.description.length > 2000) {
    errors.description = "Description must be 2000 characters or less";
  }

  return errors;
}

export function validateUpdateComplaintInput(input: UpdateComplaintInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.status !== undefined && !VALID_COMPLAINT_STATUSES.includes(input.status)) {
    errors.status = "Invalid complaint status";
  }

  if (input.resolution !== undefined && input.resolution.length > 2000) {
    errors.resolution = "Resolution must be 2000 characters or less";
  }

  if (input.status === "RESOLVED" && (!input.resolution || input.resolution.trim().length < 10)) {
    errors.resolution = "Resolution description is required when resolving a complaint (min 10 characters)";
  }

  if (input.status === "REJECTED" && (!input.resolution || input.resolution.trim().length < 10)) {
    errors.resolution = "Rejection reason is required when rejecting a complaint (min 10 characters)";
  }

  return errors;
}

// --- Payment Validations ---

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export interface CreatePaymentInput {
  papId: string;
  projectId: string;
  beneficiaryName: string;
  beneficiaryId: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  paymentCode?: string;
  paidDate?: string;
  notes?: string;
}

export interface UpdatePaymentInput {
  status?: PaymentStatus;
  paymentCode?: string;
  paidDate?: string;
  notes?: string;
}

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "CANCELLED"];

export function validateCreatePaymentInput(input: CreatePaymentInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.papId) {
    errors.papId = "PAP is required";
  }

  if (!input.projectId) {
    errors.projectId = "Project is required";
  }

  if (!input.beneficiaryName || input.beneficiaryName.trim().length < 2) {
    errors.beneficiaryName = "Beneficiary name must be at least 2 characters";
  }

  if (!input.beneficiaryId || input.beneficiaryId.trim().length < 2) {
    errors.beneficiaryId = "Beneficiary ID is required";
  }

  if (!input.bankName || input.bankName.trim().length < 2) {
    errors.bankName = "Bank name must be at least 2 characters";
  }

  if (!input.accountNumber || input.accountNumber.trim().length < 2) {
    errors.accountNumber = "Account number is required";
  }

  if (!input.amount || input.amount <= 0) {
    errors.amount = "Amount must be greater than 0";
  }

  if (input.amount && input.amount > 100_000_000_000) {
    errors.amount = "Amount seems too high";
  }

  if (input.beneficiaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.beneficiaryEmail)) {
    errors.beneficiaryEmail = "Please enter a valid email address";
  }

  return errors;
}

export function validateUpdatePaymentInput(input: UpdatePaymentInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.status !== undefined && !VALID_PAYMENT_STATUSES.includes(input.status)) {
    errors.status = "Invalid payment status";
  }

  if (input.paidDate !== undefined) {
    const date = new Date(input.paidDate);
    if (isNaN(date.getTime())) {
      errors.paidDate = "Invalid date format";
    }
  }

  if (input.notes !== undefined && input.notes.length > 2000) {
    errors.notes = "Notes must be 2000 characters or less";
  }

  return errors;
}

// --- User Validations (Admin Management) ---

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "EDITOR" | "VIEWER";
}

const VALID_ROLES: ("ADMIN" | "EDITOR" | "VIEWER")[] = ["ADMIN", "EDITOR", "VIEWER"];

export function validateCreateUserInput(input: CreateUserInput): Record<string, string> {
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

  if (!input.role || !VALID_ROLES.includes(input.role)) {
    errors.role = "Please select a valid role";
  }

  return errors;
}

export function validateUpdateUserInput(input: UpdateUserInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.name !== undefined && input.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (input.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (input.password !== undefined && input.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (input.role !== undefined && !VALID_ROLES.includes(input.role)) {
    errors.role = "Please select a valid role";
  }

  return errors;
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

