import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const [roomInput, setRoomInput] = useState("");
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = roomInput.trim();
    if (!slug) return;
    navigate(`/join?room=${encodeURIComponent(slug)}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      {/* Logo + tagline */}
      <div className="mb-10 text-center">
        <h1
          className="text-5xl font-bold tracking-tight"
          style={{ color: "#6366f1" }}
        >
          huddle
        </h1>
        <p className="mt-2 text-gray-400 text-lg">Free video calls. No limits.</p>
      </div>

      {/* Two-column grid on md+, single column on mobile */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Join a meeting card */}
        <div
          className="rounded-xl p-8 flex flex-col gap-5"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <div>
            <h2 className="text-xl font-semibold text-white">Join a meeting</h2>
            <p className="mt-1 text-sm text-gray-400">
              Enter a meeting ID to jump straight in.
            </p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Meeting ID"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #333",
              }}
            />
            <button
              type="submit"
              disabled={!roomInput.trim()}
              className="rounded-lg py-3 font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#6366f1" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#4f46e5")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#6366f1")
              }
            >
              Join
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            No account needed to join a call
          </p>
        </div>

        {/* Sign in / dashboard card */}
        <div
          className="rounded-xl p-8 flex flex-col gap-5 justify-between"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          {user ? (
            <>
              <div>
                <h2 className="text-xl font-semibold text-white">Welcome back</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Signed in as{" "}
                  <span className="text-gray-200">{user.name || user.email}</span>
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/dashboard"
                  className="block text-center rounded-lg py-3 font-medium text-white transition-colors"
                  style={{ backgroundColor: "#6366f1" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#4f46e5")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#6366f1")
                  }
                >
                  Go to dashboard
                </Link>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Manage your rooms and meeting history.
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {authLoading ? " " : "Sign in"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Access your account to start and manage meetings.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="block text-center rounded-lg py-3 font-medium text-white transition-colors"
                  style={{ backgroundColor: "#6366f1" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#4f46e5")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#6366f1")
                  }
                >
                  Sign in
                </Link>

                <Link
                  to="/signup"
                  className="block text-center rounded-lg py-3 font-medium text-gray-300 transition-colors hover:text-white"
                  style={{ backgroundColor: "#242424", border: "1px solid #333" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#2e2e2e")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#242424")
                  }
                >
                  Create an account
                </Link>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Free forever. No credit card required.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
