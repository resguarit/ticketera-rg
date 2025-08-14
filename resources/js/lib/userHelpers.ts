/**
 * Helpers para información de usuarios
 */

export const getUserFullName = (user: any): string => {
  return `${user.person.name} ${user.person.last_name}`;
};

export const getUserInitials = (user: any): string => {
  return `${user.person.name.charAt(0)}${user.person.last_name.charAt(0)}`;
};

export const getUserDisplayName = (user: any): string => {
  return user.person?.name || user.email;
};
