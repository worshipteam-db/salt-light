import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import db from "@/api/base44Client";
import { Eye, EyeOff } from "lucide-react";

const RESET_PENDING_KEY = "salt_light_password_reset_pending_email";

async function updatePassword(authClient, newPassword) {
  if (typeof authClient?.updateUser === "function") {
    return authClient.updateUser({ password: newPassword });
  }

  if (typeof authClient?.update === "function") {
    return authClient.update({ password: newPassword });
  }

  throw new Error("Password update is not supported by this auth client.");
}

async function requestPasswordReset(authClient, email, redirectTo) {
  if (typeof authClient?.resetPasswordForEmail === "function") {
    return authClient.resetPasswordForEmail(email, {
      redirectTo,
    });
  }

  throw new Error("Password reset is not supported by this auth client.");
}

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  isSubmitting,
  visible,
  onToggleVisible,
  required = true,
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <div className="relative">
        <input
          className="w-full rounded-lg border px-3 py-2 pr-12 bg-background"
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={isSubmitting}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const urlMode = searchParams.get("mode");
  const isResetRoute = urlMode === "reset" || urlMode === "recovery";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | signup | forgot | reset
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authClient = db?.auth;

  useEffect(() => {
    if (isResetRoute) {
      setMode("reset");
      setMessage("Open the email link, then choose a new password here.");

      const storedEmail = localStorage.getItem(RESET_PENDING_KEY);
      if (storedEmail && !email) {
        setEmail(storedEmail);
      }
    }
  }, [isResetRoute, email]);

  useEffect(() => {
    const isResetFlow = mode === "reset" || isResetRoute;

    if (!loading && user && !isResetFlow) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate, mode, isResetRoute]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/", { replace: true });
        return;
      }

      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { data, error } = await signUp(email, password);
        if (error) throw error;

        if (data?.session) {
          navigate("/", { replace: true });
        } else {
          setMessage(
            "Account created. Check your email if confirmation is enabled, then log in."
          );
        }
        return;
      }

      if (mode === "forgot") {
        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }

        const redirectTo = `${window.location.origin}/login?mode=reset`;
        const { error } = await requestPasswordReset(
          authClient,
          email.trim(),
          redirectTo
        );

        if (error) throw error;

        localStorage.setItem(RESET_PENDING_KEY, email.trim());
        setMessage(
          "Password reset email sent. Open the link in your inbox, then come back here to set a new password."
        );
        return;
      }

      if (mode === "reset") {
        if (!password.trim()) {
          throw new Error("Please enter a new password.");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { error } = await updatePassword(authClient, password);
        if (error) throw error;

        localStorage.removeItem(RESET_PENDING_KEY);
        setMessage("Password updated. You can log in with your new password now.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        navigate("/", { replace: true });
      }
    } catch (err) {
      const msg = err?.message || "Something went wrong";
      setError(
        msg === "email rate limit exceeded"
          ? "Email rate limit exceeded. Turn off email confirmation in Supabase or wait before trying again."
          : msg
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm bg-card">
        <h1 className="text-2xl font-bold mb-2">Salt &amp; Light</h1>

        <p className="text-sm text-muted-foreground mb-6">
          {mode === "login" && "Log in to continue"}
          {mode === "signup" && "Create your account"}
          {mode === "forgot" && "Reset your password"}
          {mode === "reset" && "Set a new password"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === "login" || mode === "signup" || mode === "forgot") && (
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-background"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {mode === "login" && (
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              isSubmitting={isSubmitting}
              visible={showPassword}
              onToggleVisible={() => setShowPassword((v) => !v)}
            />
          )}

          {mode === "signup" && (
            <>
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Create a password"
                isSubmitting={isSubmitting}
                visible={showPassword}
                onToggleVisible={() => setShowPassword((v) => !v)}
              />

              <PasswordInput
                label="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                isSubmitting={isSubmitting}
                visible={showConfirmPassword}
                onToggleVisible={() => setShowConfirmPassword((v) => !v)}
              />
            </>
          )}

          {mode === "login" && (
            <button
              type="button"
              className="mt-2 text-xs underline text-muted-foreground hover:text-foreground"
              onClick={() => {
                setError("");
                setMessage("");
                setMode("forgot");
              }}
              disabled={isSubmitting}
            >
              Forgot password?
            </button>
          )}

          {mode === "forgot" && (
            <p className="text-xs text-muted-foreground">
              We will send a reset link to your email.
            </p>
          )}

          {mode === "reset" && (
            <>
              <PasswordInput
                label="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Enter a new password"
                isSubmitting={isSubmitting}
                visible={showPassword}
                onToggleVisible={() => setShowPassword((v) => !v)}
              />

              <PasswordInput
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                isSubmitting={isSubmitting}
                visible={showConfirmPassword}
                onToggleVisible={() => setShowConfirmPassword((v) => !v)}
              />

              <p className="text-xs text-muted-foreground">
                {user
                  ? "You are signed in from the reset link. Save a new password now."
                  : "If the reset link opened correctly, you should be able to save a new password here."}
              </p>
            </>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : mode === "signup"
              ? "Sign Up"
              : mode === "forgot"
              ? "Send Reset Email"
              : "Save New Password"}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {mode !== "reset" && (
            <button
              type="button"
              className="text-sm underline block"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setMessage("");
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              disabled={isSubmitting}
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              className="text-sm underline block"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              disabled={isSubmitting}
            >
              Back to log in
            </button>
          )}

          {mode === "reset" && (
            <button
              type="button"
              className="text-sm underline block"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              disabled={isSubmitting}
            >
              Back to log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}