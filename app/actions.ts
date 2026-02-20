"use server";

import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export async function submitEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  const result = emailSchema.safeParse(email);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // TODO: Replace with Supabase insert
  console.log("Email submitted:", result.data);

  return {
    success: true,
    message: "You're on the list!",
  };
}
