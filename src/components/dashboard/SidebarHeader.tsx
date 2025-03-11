import { selectUserProfile } from "@/store/selectors/userSelectors";
import { useSelector } from "react-redux";

export const SidebarHeader = () => {
  const userProfile = useSelector(selectUserProfile);

  const userName = `${userProfile?.first_name ?? "User"} ${userProfile?.last_name ?? ""}`.trim();
  const userEmail = userProfile?.email ?? "No email available";
  const userInitials = userProfile?.first_name
    ? `${userProfile.first_name[0]}${userProfile?.last_name?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white text-lg font-semibold">
          {userInitials}
        </div>

        {/* User Details */}
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
        
        </div>
      </div>
    </div>
  );
};
