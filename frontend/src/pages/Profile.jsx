import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Calendar, Award, Code2, ArrowLeft } from "lucide-react";
import userService from "../services/userService";
 
export default function Profile() {
  const { id } = useParams();
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewedProfile, setViewedProfile] = useState(null);
 
  const isOwnProfile = !id;
 
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isOwnProfile) {
          if (firebaseUser) {
            await refreshProfile();
          }
        } else {
          const data = await userService.getUserProfile(id);
          setViewedProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (!isOwnProfile) {
          setError("This user could not be found.");
        }
      } finally {
        setLoading(false);
      }
    };
 
    loadProfile();
  }, [firebaseUser, id, isOwnProfile]);
 
  const source = isOwnProfile ? profile : viewedProfile;
 
  const username = source?.username || (isOwnProfile ? firebaseUser?.email?.split("@")[0] : "");
 
  useEffect(() => {
    if (username) {
      document.title = isOwnProfile
        ? `${username} - Profile | CodeDour`
        : `${username} | CodeDour`;
    } else {
      document.title = "My Profile | CodeDour";
    }
  }, [username, isOwnProfile]);
 
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }
 
  if (!isOwnProfile && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p className="text-slate-400">{error}</p>
        <Link
          to="/leaderboard"
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition"
        >
          <ArrowLeft size={16} />
          Back to Leaderboard
        </Link>
      </div>
    );
  }
 
  const displayName = isOwnProfile
    ? firebaseUser?.displayName || profile?.display_name || "User"
    : viewedProfile?.display_name || viewedProfile?.username || "User";
  const email = isOwnProfile ? firebaseUser?.email || profile?.email || "" : "";
  const photoURL = isOwnProfile
    ? firebaseUser?.photoURL || profile?.avatar_url || ""
    : viewedProfile?.avatar_url || "";
  const problemsSolved = source?.problems_solved || 0;
  const totalSubmissions = source?.total_submissions || 0;
  const rating = source?.rating ?? 0;
  const maxRating = source?.max_rating ?? rating;
  const createdAt = isOwnProfile
    ? profile?.created_at || firebaseUser?.metadata?.creationTime
    : null;
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {!isOwnProfile && (
          <Link
            to="/leaderboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back to Leaderboard
          </Link>
        )}
 
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
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
 
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="mt-1 text-slate-400">@{username}</p>
 
              <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                {email && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="h-4 w-4" />
                    {email}
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
 
        <div className="mt-8 grid gap-6 md:grid-cols-3">
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
 
          {isOwnProfile ? (
            <Link
              to="/submissions"
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-indigo-500/50 hover:bg-slate-900/90 block"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-3 transition group-hover:bg-indigo-500/20">
                  <Code2 className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-400">{totalSubmissions}</p>
                  <p className="text-sm text-slate-400 group-hover:text-slate-200 transition">
                    Total Submissions <span className="text-indigo-400 ml-1">→</span>
                  </p>
                </div>
              </div>
            </Link>
          ) : (
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
          )}
 
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
 
        {source && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Max Rating</span>
                <span className="font-semibold">{maxRating}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Acceptance Rate</span>
                <span className="font-semibold">
                  {totalSubmissions > 0
                    ? Math.round((problemsSolved / totalSubmissions) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 