import Sidebar from "../components/Sidebar";
import ProfilePhoto from "../components/ProfilePhoto";
import SettingsForm from "../components/SettingsForm";

const Settings = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-8">

          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Account Settings</h2>
            <p className="mt-2 text-sm text-gray-500">
              Update your profile information and preferences.
            </p>
          </header>

          {/* Profile photo section */}
          {/* <ProfilePhoto /> */}

          {/* Settings form */}
          <SettingsForm />

        </div>
      </main>

    </div>
  );
};

export default Settings;