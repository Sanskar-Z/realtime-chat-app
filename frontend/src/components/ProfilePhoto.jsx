import { useState } from "react";

const ProfilePhoto = () => {
  const [preview, setPreview] = useState("https://via.placeholder.com/100");


  return (
    <div className="flex items-center gap-8 pb-8 bg-white p-4 rounded-xl shadow-sm">
      {/* Profile Image */}
      <div className="relative group w-24 h-24">
        <img
          src={preview}
          alt="profile"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-md"
        />

        {/* Hover overlay */}
        <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
          <span className="text-white text-sm">Change</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
        <p className="text-sm text-gray-500 mb-4">
          Recommended: Square image, at least 400x400px.
        </p>

        <div className="flex gap-3">
          <label className="bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700 transition">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
            />
          </label>
          <button
            className="border border-gray-100 px-4 py-2 rounded-md hover:bg-gray-50 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoto;