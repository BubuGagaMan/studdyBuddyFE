// src/shared/types/index.ts
// Types used across features. Feature-specific types live in that feature's types.ts.

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  suspended: boolean;
  profile_image_url?: string | null;
}
