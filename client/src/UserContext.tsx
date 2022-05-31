import React from 'react';

interface AuthenticatedUser {
    displayName: string;
}

const AuthenticatedUserContext = React.createContext<AuthenticatedUser | null>(
    null // default value
);

export { AuthenticatedUserContext };
export type { AuthenticatedUser };