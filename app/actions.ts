"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

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

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from("waitlist").insert({ email: result.data });
  } catch {
    // Fail silently — don't block the user on a DB error
  }

  return {
    success: true,
    message: "You're on the list!",
  };
}
