import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Calendar, Award, Code2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (firebaseUser && !profile) {
          await refreshProfile();
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [firebaseUser, profile, refreshProfile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const displayName = firebaseUser?.displayName || profile?.display_name || "User";
  const email = firebaseUser?.email || profile?.email || "";
  const photoURL = firebaseUser?.photoURL || profile?.avatar_url || "";
  const username = profile?.username || email.split('@')[0];
  const rating = profile?.rating || 1500;
  const problemsSolved = profile?.problems_solved || 0;
  const totalSubmissions = profile?.total_submissions || 0;
  const createdAt = profile?.created_at || firebaseUser?.metadata?.creationTime;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Profile Header Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Profile Photo */}
            <div className="relative">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="h-32 w-32 rounded-full border-4 border-slate-800 object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-800 bg-gradient-to-br from-indigo-500 to-violet-600">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-indigo-400 border border-slate-700">
                {rating}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="mt-1 text-slate-400">@{username}</p>

              <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4" />
                  {email}
                </div>
                {createdAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              {profile?.role && profile.role !== 'user' && (
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/30">
                    <Award className="h-3.5 w-3.5" />
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Problems Solved */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-3">
                <Code2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{problemsSolved}</p>
                <p className="text-sm text-slate-400">Problems Solved</p>
              </div>
            </div>
          </div>

          {/* Total Submissions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-3">
                <Code2 className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-400">{totalSubmissions}</p>
                <p className="text-sm text-slate-400">Total Submissions</p>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-3">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{rating}</p>
                <p className="text-sm text-slate-400">Current Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {profile && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Max Rating</span>
                <span className="font-semibold">{profile.max_rating || rating}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Acceptance Rate</span>
                <span className="font-semibold">
                  {totalSubmissions > 0
                    ? Math.round((problemsSolved / totalSubmissions) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Account Type</span>
                <span className="font-semibold capitalize">{profile.role || 'User'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">User ID</span>
                <span className="font-semibold">#{profile.user_id}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
