import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Eye, EyeOff } from "lucide-react";

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
  const [mode, setMode] = useState("login"); // login | signup
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotHelper, setShowForgotHelper] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (isResetRoute) {
      setShowForgotHelper(true);
      setMessage("Password recovery is temporarily disabled while we fix bugs.");
      navigate("/login", { replace: true });
    }
  }, [isResetRoute, navigate]);

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
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                setShowForgotHelper((prev) => !prev);
                setError("");
                setMessage("");
              }}
              disabled={isSubmitting}
            >
              Forgot password?
            </button>
          )}

          {showForgotHelper && (
            <p className="text-xs text-muted-foreground -mt-2">
              Password recovery is temporarily disabled while we fix bugs.
            </p>
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
              : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 space-y-2">
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
              setShowForgotHelper(false);
            }}
            disabled={isSubmitting}
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}