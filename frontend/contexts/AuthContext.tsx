import { createContext, ReactNode } from "react";
import { api } from "../services/api";

type SignInCredencials = {
    email: string,
    password: string,
}

type AuthContextData = {
    signIn(credentials: SignInCredencials): Promise<void>;
    isAuthenticated: boolean;
}

type AuthProvider = {
    children: ReactNode
}

export const AuthCotext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProvider) {
    const isAuthenticated = false;

    async function signIn({email, password}: SignInCredencials) {
        try{
            const response = await api.post('sessions', {
                email,
                password,
            })
            
            console.log(response.data)
        }catch(e){
            console.log(e)
        }
    }

    return (
        <AuthCotext.Provider value={{ signIn, isAuthenticated }}>
            {children}
        </AuthCotext.Provider>
    )
}