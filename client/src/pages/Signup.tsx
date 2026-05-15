import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../lib/auth-client";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp.email({
      email: email.trim(),
      password,
      name: displayName.trim(),
    });

    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Sign up failed. Please try again.");
      return;
    }

    navigate("/onboarding");
  };

  // Shared input style helpers
  const inputBase: React.CSSProperties = {
    backgroundColor: "#242424",
    border: "1px solid #333",
  };

  const onFocusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid #6366f1";
  };
  const onBlurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid #333";
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="mb-8 text-3xl font-bold tracking-tight"
        style={{ color: "#6366f1" }}
      >
        huddle
      </Link>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-xl p-8 flex flex-col gap-6"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Create an account</h1>
          <p className="mt-1 text-sm text-gray-400">
            Join Huddle — it&apos;s free.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="displayName"
              className="text-sm font-medium text-gray-300"
            >
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Smith"
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
              style={inputBase}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
              style={inputBase}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
              style={inputBase}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-300"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
              style={{
                ...inputBase,
                border:
                  confirmPassword && confirmPassword !== password
                    ? "1px solid #f87171"
                    : inputBase.border,
              }}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-400">Passwords do not match.</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#6366f1" }}
            onMouseEnter={(e) => {
              if (!loading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#4f46e5";
            }}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#6366f1")
            }
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Footer links */}
        <div className="flex flex-col gap-2 text-center text-sm text-gray-400">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
          <Link to="/" className="text-gray-500 hover:text-gray-300">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
