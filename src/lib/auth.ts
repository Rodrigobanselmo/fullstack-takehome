import type { UserRole } from "generated/gql/graphql";
import { cookies } from "next/headers";
import { captureException } from "./error-reporting";

export interface UserSession {
  id: string;
  username: string;
  role: UserRole;
}

const USER_COOKIE_NAME = "user_session";

export async function setUserCookie(user: UserSession) {
  const cookieStore = await cookies();

  const sevenDays = 60 * 60 * 24 * 7;
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: sevenDays,
    path: "/",
  });
}

export async function getUserFromCookie(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(USER_COOKIE_NAME);

    if (!userCookie?.value) {
      return null;
    }

    const user = JSON.parse(userCookie.value) as UserSession;
    return user;
  } catch (error) {
    captureException(error, { message: "Error parsing user cookie" });
    return null;
  }
}

export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}
