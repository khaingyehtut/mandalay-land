import { SignJWT, jwtVerify } from "jose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Bearer-token auth for the Flutter client (mobile + web).
// Reuses NEXTAUTH_SECRET so tokens are tied to the same trust root as the site.

const secretKey = () =>
  new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "insecure-dev-secret");

export async function signMobileToken(user) {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifyMobileToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

function bearerFrom(req) {
  const h =
    req?.headers?.get?.("authorization") || req?.headers?.get?.("Authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : null;
}

/**
 * Normalized current user from either the Bearer token (Flutter client) or the
 * NextAuth cookie session (the existing website). Returns null if unauthenticated.
 */
export async function getAuthUser(req) {
  const token = bearerFrom(req);
  if (token) {
    const payload = await verifyMobileToken(token);
    if (payload?.id) {
      return {
        id: String(payload.id),
        email: payload.email ?? null,
        name: payload.name ?? null,
        image: payload.image ?? null,
      };
    }
  }
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    };
  }
  return null;
}

export function isAdminEmail(email) {
  return !!email && email === process.env.ADMIN_EMAIL;
}
