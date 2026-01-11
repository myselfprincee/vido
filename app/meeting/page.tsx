"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Plus,
  Users,
  Calendar,
  Copy,
  Clock,
  Loader2,
  AlertCircle,
  LogIn,
  Trash2,
  LogOut,
  Settings,
} from "lucide-react";
import {
  createMeeting,
  getUserMeetings,
  deleteMeeting,
} from "../lib/meetingApi";
import Image from "next/image";
import { useSession, signOut } from "../lib/auth-client";
import ProfileModal from "../Components/ProfileModal";

interface DisplayMeeting {
  id: string;
  meetingCode: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export default function MeetingPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [joinCode, setJoinCode] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<DisplayMeeting | null>(
    null
  );
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);

  const [meetings, setMeetings] = useState<DisplayMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingMeetings(false);
      return;
    }

    async function fetchMeetings() {
      setIsLoadingMeetings(true);
      setError(null);

      const response = await getUserMeetings();

      if (response.success && response.data) {
        setMeetings(
          response.data.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt),
            expiresAt: new Date(m.expiresAt),
          }))
        );
      } else {
        if (response.error !== "Unauthorized") {
          setError(response.error || "Failed to load meetings");
        }
      }

      setIsLoadingMeetings(false);
    }

    fetchMeetings();
  }, [isAuthenticated]);

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Show loading while checking session
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const handleCreateMeeting = async () => {
    setIsCreatingMeeting(true);
    setError(null);

    const response = await createMeeting();

    if (response.success && response.data) {
      router.push(`/meeting/${response.data.meetingCode}`);
    } else {
      setError(response.error || "Failed to create meeting");
      setIsCreatingMeeting(false);
    }
  };

  const handleJoinMeeting = () => {
    if (joinCode.trim()) {
      router.push(`/meeting/${joinCode.trim()}`);
    }
  };

  const handleJoinMeetingWithCode = (code: string) => {
    router.push(`/meeting/${code}`);
  };

  const handleMeetingClick = (meeting: DisplayMeeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleDeleteMeeting = async (e: React.MouseEvent, meetingId: string) => {
    e.stopPropagation(); // Prevent opening the meeting modal

    if (!confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteMeeting(meetingId);

      if (result.success) {
        // Remove from local state
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
        if (selectedMeeting?.id === meetingId) {
          setSelectedMeeting(null);
          setShowMeetingModal(false);
        }
      } else {
        setError(result.error || "Failed to delete meeting");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    }
  };

  const handleCopyLink = (meetingCode: string, meetingId: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/meeting/${meetingCode}`
    );
    setCopiedMeetingId(meetingId);
    setTimeout(() => setCopiedMeetingId(null), 2000); // Reset after 2 seconds
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="border-dashed border-b border-slate-800/50  backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Video size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Vido</h1>
            </div>

            {/* User Profile Menu */}
            {isAuthenticated && session?.user && (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-xl transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-black">{session.user.name}</p>
                    <p className="text-xs text-slate-500">{session.user.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br bg-black text-white font-bold">
                        {session.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 text-black">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowProfileModal(true);
                        }}
                        className="group w-full flex items-center gap-2 px-3 py-2 text-base text-black hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Settings
                          size={18}
                          className="transition-transform duration-300 group-hover:rotate-180"
                        />
                        Edit Profile
                      </button>

                      <button
                        onClick={async () => {
                          await signOut();
                          router.push('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-base text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        <LogOut size={18} className="" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-6 text-black">Start or Join a Meeting</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Connect with your team instantly. Create a new meeting or join an
            existing one with a simple code.
          </p>
        </div>

        {/* Auth Check - Show login prompt if not authenticated */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto text-center">
            <div className=" backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <LogIn size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Sign in Required</h3>
              <p className="text-slate-400 mb-6">
                Please sign in to create or join meetings.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Sign In
              </button>
              <p className="text-slate-500 text-sm mt-4">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => router.push("/signup")}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
              {/* Create Meeting */}
              <div
                className={`grid grid-rows-[auto_1fr_auto] backdrop-blur-xl border-dashed border border-black rounded-2xl p-8 transition-all duration-300 group ${isCreatingMeeting
                  ? "opacity-75 cursor-wait"
                  : "cursor-pointer"
                  }`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 transition-transform">
                  {isCreatingMeeting ? (
                    <Loader2 size={32} className="text-white animate-spin" />
                  ) : (
                    <Plus size={32} className="text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Create Meeting</h3>
                  <p className="text-slate-400 mb-6">
                    Start a new video call instantly. Share the code with
                    participants to join.
                  </p>
                </div>
                <button
                  onClick={isCreatingMeeting ? undefined : handleCreateMeeting}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-800 disabled:cursor-wait text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isCreatingMeeting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create New Meeting"
                  )}
                </button>
              </div>

              {/* Join Meeting */}
              <div className="grid grid-rows-[auto_1fr_auto] backdrop-blur-xl border border-black border-dashed rounded-2xl p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Users size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Join Meeting</h3>
                  <p className="text-slate-400 mb-6">
                    Enter the meeting code provided by the host to join the
                    call.
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter meeting code (e.g., abc-abcd-abc)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full border border-dashed border-black rounded-xl px-4 py-3 text-black placeholder-slate-500 focus:outline-none focus:ring-2  focus:border-transparent"
                  />
                  <button
                    onClick={handleJoinMeeting}
                    disabled={!joinCode.trim()}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Join Meeting
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="text-red-400" size={20} />
                  <span className="text-red-400">{error}</span>
                </div>
              </div>
            )}

            {/* Previous Meetings */}
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl mb-8 text-center">Your Meetings</h3>

              {isLoadingMeetings ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p>No meetings yet. Create your first meeting above!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className=" backdrop-blur-xl border border-black border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer group"
                      onClick={() => handleMeetingClick(meeting)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Video size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold mb-1 font-geist">
                              {meeting.meetingCode}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                {formatDate(meeting.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={16} />
                                Expires: {formatDate(meeting.expiresAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className={`text-sm px-3 py-1 rounded-full ${meeting.isActive
                              ? "bg-green-500/20 text-green-600"
                              : "bg-red-500/20 text-red-600"
                              }`}
                          >
                            {meeting.isActive ? "Active" : "Expired"}
                          </div>
                          {meeting.isActive && (
                            <button
                              className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinMeetingWithCode(meeting.meetingCode);
                              }}
                            >
                              Rejoin
                            </button>
                          )}
                          <button
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                            onClick={(e) => handleDeleteMeeting(e, meeting.id)}
                            title="Delete meeting"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Meeting Modal */}
      {showMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white border border-white border-dashed rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-black mb-4 font-geist-mono">
              {selectedMeeting.meetingCode}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-black font-medium">Created:</span>
                <span className="text-black">
                  {formatDate(selectedMeeting.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black font-medium">Expires:</span>
                <span className="text-black">
                  {formatDate(selectedMeeting.expiresAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black font-medium">Status:</span>
                <span
                  className={
                    selectedMeeting.isActive ? "text-green-600" : "text-red-400"
                  }
                >
                  {selectedMeeting.isActive ? "Active" : "Expired"}
                </span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleCopyLink(selectedMeeting.meetingCode, selectedMeeting.id)}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <Copy size={16} />
                {copiedMeetingId === selectedMeeting.id ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="px-4 py-2 rounded-lg  bg-slate-600 text-slate-200 font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={{
          name: session?.user?.name || "",
          image: session?.user?.image,
        }}
        onUpdate={() => {
          // Force session refresh or reload page to see changes
          window.location.reload();
        }}
      />
    </div>
  );
}
