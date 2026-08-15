import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      if (nextUrl.pathname.startsWith('/auth')) {
        return true;
      }

      const isProtected = 
        nextUrl.pathname === '/' || 
        nextUrl.pathname.startsWith('/requisitions') ||
        nextUrl.pathname.startsWith('/candidates') ||
        nextUrl.pathname.startsWith('/compliance') ||
        nextUrl.pathname.startsWith('/operations') ||
        nextUrl.pathname.startsWith('/branches') ||
        nextUrl.pathname.startsWith('/clients') ||
        nextUrl.pathname.startsWith('/users') ||
        nextUrl.pathname.startsWith('/settings');

      if (isProtected) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
