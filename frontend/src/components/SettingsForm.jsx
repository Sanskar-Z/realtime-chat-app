import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth.js";
import { updateUserDetails } from "../services/authService.js";

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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    // Call your API here to change password
    alert("Password changed successfully!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = {
        fullName,
        username,
        email,
        statusMessage,
        bio
      };
      const response = await updateUserDetails(updatedUser);
      if (response?.user) {
        setUser(response.user);
      } else {
        setUser((prev) => ({ ...prev, ...updatedUser }));
      }
    } catch (error) {
      alert(error?.response?.data?.message);
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
    try {
      setLoading(true);
      const response = await updatePassword(oldPassword, newPassword, confirmPassword);
      if (response?.user) {
        setUser(response.user);
      } else {
        setUser((prev) => ({ ...prev, ...updatedUser }));
      }
    } catch (error) {
      alert(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-12 mt-8">

      {/* Personal Info */}
      <form onSubmit={handleUpdateUser} className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="required w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="required w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="required w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status Message</label>
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea
              placeholder="Tell us about yourself..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition active:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow transition active:bg-indigo-800"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form
        onSubmit={handlePasswordChange}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6"
      >
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Old Password</label>
            <input
              type="password"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow transition active:bg-indigo-800"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;