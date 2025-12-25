import { Route, Routes } from "react-router-dom";
import Login from "./containers/Login";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { onError } from "./lib/error";
import Dashboard from "./containers/Dashboard";
import { ThemeProvider } from "./components/theme-provider";
import { Journal } from "./containers/Journal";
import { AppContext, type AppContextType } from "./lib/context";

export function App() {
    const [isAuthenticating, setIsAuthenticating] = useState(true)
    const [isAuthenticated, userHasAuthenticated] = useState(false)

    useEffect(() => {
        onLoad()
    }, [])

    async function onLoad() {
        try {
            await Auth.currentSession();
            userHasAuthenticated(true);
        } catch (error) {
            if (error !== "No current user") {
                onError(error);
            }
        }
        setIsAuthenticating(false)
    }

    async function handleLogout() {
        await Auth.signOut()
        userHasAuthenticated(false);
    }

    return (
        !isAuthenticating && (
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <AppContext.Provider value={{ isAuthenticated } as AppContextType}>
                    <Routes>
                        <Route path='/' element={<Login onSuccessfulSignIn={() => {
                            userHasAuthenticated(true);
                        }} />} />
                        <Route path="dashboard" element={<Dashboard onSignout={handleLogout} />}>
                            <Route index element={<Journal />} />
                            <Route path="journal" element={<Journal />} />
                            <Route path="journal/:date" element={<Journal />} />
                        </Route>
                    </Routes>
                    <Toaster />
                </AppContext.Provider>
            </ThemeProvider>
        )
    )
}