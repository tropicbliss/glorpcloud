import { Route, Routes } from "react-router-dom";
import Login from "./containers/Login";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { Auth } from "aws-amplify";
import { onError } from "./lib/error";
import { $isAuthenticated, $isAuthenticating } from "./lib/context";
import { useStore } from '@nanostores/react'
import Dashboard from "./containers/Dashboard";
import { ThemeProvider } from "./components/theme-provider";
import { Journal } from "./containers/Journal";

export function App() {
    const isAuthenticating = useStore($isAuthenticating)

    useEffect(() => {
        onLoad()
    }, [])

    async function onLoad() {
        try {
            await Auth.currentSession();
            $isAuthenticated.set(true)
        } catch (error) {
            if (error !== "No current user") {
                onError(error);
            }
        }
        $isAuthenticating.set(false)
    }

    async function handleLogout() {
        await Auth.signOut()
        $isAuthenticated.set(false)
    }

    return (
        !isAuthenticating && (
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Routes>
                    <Route path='/' element={<Login onSuccessfulSignIn={() => {
                        $isAuthenticated.set(true)
                    }} />} />
                    <Route path="dashboard" element={<Dashboard onSignout={handleLogout} />}>
                        <Route index element={<Journal />} />
                        <Route path="journal" element={<Journal />} />
                    </Route>
                </Routes>
                <Toaster />
            </ThemeProvider>
        )
    )
}