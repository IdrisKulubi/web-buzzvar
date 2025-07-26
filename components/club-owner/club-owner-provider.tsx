"use client";

import { createContext, useContext, ReactNode } from 'react';

interface ClubOwnerContextType {
  venueId: string | null;
}

const ClubOwnerContext = createContext<ClubOwnerContextType | undefined>(undefined);

export function ClubOwnerProvider({
  children,
  venueId,
}: {
  children: ReactNode;
  venueId: string | null;
}) {
  return (
    <ClubOwnerContext.Provider value={{ venueId }}>
      {children}
    </ClubOwnerContext.Provider>
  );
}

export function useClubOwner() {
  const context = useContext(ClubOwnerContext);
  if (context === undefined) {
    throw new Error('useClubOwner must be used within a ClubOwnerProvider');
  }
  return context;
} 