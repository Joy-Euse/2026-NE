import AsyncStorage from '@react-native-async-storage/async-storage';

import authorizedUsers from '@/data/users.json';
import { LocalUser } from '@/types/user';

const CURRENT_USER_KEY = '@dictionaryapp:current-user';

export async function getCurrentUser(): Promise<LocalUser | null> {
  try {
    const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
    const parsedUser = storedUser ? (JSON.parse(storedUser) as LocalUser) : null;
    const authorizedUser = (authorizedUsers as LocalUser[]).find(
      (user) => user.id === parsedUser?.id && user.username === parsedUser.username,
    );

    if (!authorizedUser) {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }

    return authorizedUser;
  } catch {
    return null;
  }
}

export async function loginLocalUser(username: string, password: string): Promise<LocalUser> {
  const normalizedUsername = username.trim().toLowerCase();
  // Demo/school-only authentication: passwords are read from a local JSON file.
  // This is not secure and must not be used for production applications.
  const user = (authorizedUsers as LocalUser[]).find(
    (item) => item.username.toLowerCase() === normalizedUsername && item.password === password,
  );

  if (!user) {
    throw new Error('Invalid username or password.');
  }

  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export async function logoutLocalUser() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}
