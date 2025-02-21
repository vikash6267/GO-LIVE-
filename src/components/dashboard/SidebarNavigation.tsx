import { useLocation, useNavigate } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroupLabel } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

interface SidebarNavigationProps {
  items: NavigationItem[] | NavigationGroup[];
  isGrouped?: boolean;
}

export const SidebarNavigation = ({ items, isGrouped = false }: SidebarNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (isGrouped) {
    const groupedItems = items as NavigationGroup[];
    return (
      <SidebarMenu>
        {groupedItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6 last:mb-0">
            <SidebarGroupLabel className="px-2 mb-2 text-xs font-medium text-gray-500">
              {group.label}
            </SidebarGroupLabel>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        ))}
      </SidebarMenu>
    );
  }

  const regularItems = items as NavigationItem[];
  return (
    <SidebarMenu>
      {regularItems.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton 
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === item.path 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};