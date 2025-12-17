import { createContext, useContext } from "react";

export interface AppContextType {
    isAuthenticated: boolean;
}

export const AppContext = createContext<AppContextType>({
    isAuthenticated: false,
});

export function useAppContext() {
    return useContext(AppContext);
}
