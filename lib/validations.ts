import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

export const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email().optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  status: z.enum(["ACTIVE", "VIP", "NEW", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  description: z.string().optional(),
  duration: z.number().min(5, "Duration must be at least 5 minutes"),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
});

export const bookingSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().min(1, "Staff is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  clientId: z.string().min(1, "Client is required"),
  amount: z.number().min(1, "Amount is required"),
  method: z.enum(["CASH", "TRANSFER", "CARD", "POS"]),
  status: z.enum(["PENDING", "PAID", "PARTIAL", "REFUNDED"]).default("PAID"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
