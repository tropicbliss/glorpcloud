import { LoginForm } from "@/components/login-form";
import glorpLogo from "@/assets/glorp.avif"
import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { toast } from "sonner"
import { onError } from "@/lib/error";
import { useStore } from "@nanostores/react";
import { $isAuthenticated } from "@/lib/context";
import { NavLink, useNavigate } from "react-router-dom";

export default function Login({ onSuccessfulSignIn }: { onSuccessfulSignIn: () => void }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [disableSubmit, setDisableSubmit] = useState(false)
    const isAuthenticated = useStore($isAuthenticated)
    const nav = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            nav("/dashboard")
        }
    }, [isAuthenticated])

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <NavLink to="/" className="flex items-center gap-2 self-center font-medium">
                    <div className="text-primary-foreground flex size-6 items-center justify-center">
                        <img src={glorpLogo} className="size-6" />
                    </div>
                    glorpcloud
                </NavLink>
                <LoginForm email={email} password={password} onEmailChange={(email) => setEmail(email)} onPasswordChange={(password) => setPassword(password)} onSubmit={async () => {
                    setDisableSubmit(true)
                    try {
                        await Auth.signIn(email, password)
                        toast("Logged in")
                        onSuccessfulSignIn()
                    } catch (error) {
                        console.error(error)
                        onError(error)
                        setPassword("")
                    }
                    setDisableSubmit(false)
                }} disableButton={disableSubmit} />
            </div>
        </div>
    );
}