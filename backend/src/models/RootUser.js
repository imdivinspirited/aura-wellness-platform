/**
 * Root operators are stored in the `users` collection with `role: "root"`.
 * Required fields after signup: `username`, `email`, `password_hash`, `secret_key_verified`, `login_history`.
 */
export const ROOT_USER_ROLE = 'root';
