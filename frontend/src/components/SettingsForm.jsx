import { useState } from "react";
import { useAuth } from "../context/useAuth.js";
import { updateUserDetails, updatePassword } from "../services/authService.js";
import { toast } from "react-hot-toast";

const SettingsForm = () => {
  const { user, setUser } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || "");
  const [bio, setBio] = useState(user?.bio || "");

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = { fullName, username, email, statusMessage, bio };
      const response = await updateUserDetails(updatedUser);
      if (response?.user) {
        setUser(response.user);
      } else {
        setUser((prev) => ({ ...prev, ...updatedUser }));
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setFullName(user.fullName || "");
    setUsername(user.username || "");
    setEmail(user.email || "");
    setStatusMessage(user.statusMessage || "");
    setBio(user.bio || "");
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    try {
      setPwLoading(true);
      const response = await updatePassword(oldPassword, newPassword, confirmPassword);
      if (response?.user) setUser(response.user);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setPwLoading(false);
    }
  };

  // Avatar initials
  const initials = (user?.fullName || user?.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Profile card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Card header bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900">Profile Information</h3>
        </div>

        <form onSubmit={handleUpdateUser}>
          <div className="px-6 py-6 space-y-5">

            {/* Avatar row */}
            <div className="flex items-center gap-4 pb-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center select-none flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.fullName || user?.username || "Your Name"}</p>
                <p className="text-xs text-gray-400">{user?.email || ""}</p>
              </div>
            </div>

            {/* Full name + username */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Status message */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status Message</label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="What's on your mind?"
                className={inputClass}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself…"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Card footer actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            {profileSaved ? (
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Changes saved
              </span>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving…
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Change password card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handleUpdatePassword}>
          <div className="px-6 py-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">New Password</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
            >
              {pwLoading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Updating…
                </>
              ) : "Update Password"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default SettingsForm;