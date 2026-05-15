import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signIn } from "../lib/auth-client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn.email({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Sign in failed. Please check your credentials.");
      return;
    }

    navigate(redirect);
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
          <h1 className="text-2xl font-semibold text-white">Sign in to Huddle</h1>
          <p className="mt-1 text-sm text-gray-400">Welcome back.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #333",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.border = "1px solid #6366f1")
              }
              onBlur={(e) =>
                (e.currentTarget.style.border = "1px solid #333")
              }
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #333",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.border = "1px solid #6366f1")
              }
              onBlur={(e) =>
                (e.currentTarget.style.border = "1px solid #333")
              }
            />
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Footer links */}
        <div className="flex flex-col gap-2 text-center text-sm text-gray-400">
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">
              Create one
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
