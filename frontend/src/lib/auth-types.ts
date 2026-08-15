import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      tenantId: string;
      branchId: string;
      roles: string[];
      accessToken: string;
    };
  }
}
