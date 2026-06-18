"use client";

import React, { createContext, useContext } from "react";
import { AuthenticatedUserSession } from "@/lib/auth/session";

export interface ClientUserSession extends AuthenticatedUserSession {
  name: string;
  avatar?: string;
}

const SessionContext = createContext<ClientUserSession | null>(null);

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: ClientUserSession;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Global hook to instantly pull authenticated user, branch, 
 * organization, and platform permissions anywhere in the app.
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}