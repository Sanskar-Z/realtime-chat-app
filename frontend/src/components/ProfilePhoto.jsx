import { useState, useRef } from "react";
import { useAuth } from "../context/useAuth.js";

const ProfilePhoto = () => {
  const { user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const initials = (user?.fullName || user?.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleInputChange = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-blue-500" />
        <h3 className="text-sm font-semibold text-gray-900">Profile Photo</h3>
      </div>

      <div className="px-6 py-6 flex items-start gap-6">

        {/* Avatar with hover overlay */}
        <div
          className={`relative group w-20 h-20 flex-shrink-0 rounded-2xl cursor-pointer transition-all duration-150 ${isDragging ? "ring-2 ring-blue-400 ring-offset-2" : ""
            }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover border border-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 font-bold text-xl flex items-center justify-center select-none">
              {initials}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center gap-1">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-white text-[10px] font-medium">Change</span>
          </div>
        </div>

        {/* Info + actions */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Square image recommended, at least 400×400px. JPG, PNG, or WebP.
          </p>

          <div className="flex items-center gap-2">
            {/* Upload button */}
            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold cursor-pointer transition-all active:scale-[0.98] shadow-sm shadow-blue-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload Photo
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
            </label>

            {/* Remove button — only shown when there's a photo */}
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-all active:scale-[0.98]"
              >
                Remove
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePhoto;