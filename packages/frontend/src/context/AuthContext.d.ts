import React, { ReactNode } from 'react';
export interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}
export declare const AuthContext: React.Context<AuthContextType | undefined>;
interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthProvider: React.FC<AuthProviderProps>;
export {};
//# sourceMappingURL=AuthContext.d.ts.map