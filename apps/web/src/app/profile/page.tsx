'use client'

import { z } from "zod";

const ProfileSchema = z.object({
  userName: z.string().trim(),
  bio: z.string().trim().optional(),
  avatar: z.string().url().optional(),
})

type ProfileFormValues = z.infer<typeof ProfileSchema>;

// type UserResponse = z.

function ProfilePage() {
  return ( 
    <div>
      <h1>Profile</h1>
    </div>
  )
}

export default ProfilePage