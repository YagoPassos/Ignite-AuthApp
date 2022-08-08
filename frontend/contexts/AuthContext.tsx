import { channel } from "diagnostics_channel";
import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredencials = {
    email: string,
    password: string,
}

type AuthContextData = {
    signIn: (credentials: SignInCredencials) => Promise<void>;
    signOut: () => void;
    user: User;
    isAuthenticated: boolean;
}

type AuthProvider = {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel;

export function signOut() {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    authChannel.postMessage('signOut')
    Router.push('/')
}

export function AuthProvider({ children }: AuthProvider) {
    const [user, setUser] = useState<User>()
    const isAuthenticated = !!user;

    useEffect(() => {
        authChannel = new BroadcastChannel('auth')

        authChannel.onmessage = (message) => {
            switch (message.data) {
                case 'signOut':
                    Router.push('/');;
                    break;
                case 'signIn':
                    Router.push('/dashboard');
                    break;
                default:
                    break;
            }
        }
    }, [])

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()

        if (token) {
            api.get('/me').then(response => {
                const { email, permissions, roles } = response.data

                setUser({ email, permissions, roles, })
            }).catch(error => {
                signOut()
            })
        }
    }, [])

    async function signIn({ email, password }: SignInCredencials) {
        try {
            const response = await api.post('sessions', {
                email,
                password,
            })

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })


            setUser({
                email,
                permissions,
                roles,
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')

            authChannel.postMessage('signIn')

        } catch (e) {
            console.log(e)
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}