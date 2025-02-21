import { UserRole } from "../schemas/userFormSchemas";

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-success text-success-foreground hover:bg-success/80";
    case "inactive":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/80";
    case "pending":
      return "bg-warning text-warning-foreground hover:bg-warning/80";
    default:
      return "bg-secondary hover:bg-secondary/80";
  }
};

export const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-purple-500 text-purple-50 hover:bg-purple-600";
    case "manager":
      return "bg-blue-500 text-blue-50 hover:bg-blue-600";
    case "staff":
      return "bg-green-500 text-green-50 hover:bg-green-600";
    case "user":
      return "bg-gray-500 text-gray-50 hover:bg-gray-600";
    default:
      return "bg-secondary hover:bg-secondary/80";
  }
};

export const getLocationDetails = (userId: string) => {
  // Convert the string ID to a number for the switch case
  const numericId = parseInt(userId, 10);
  const locationTypes = {
    1: [],
    2: [],
    3: [
      { name: "Main Office", type: "headquarters", address: "123 Main St, CA" },
      { name: "North Branch", type: "branch", address: "456 North Ave, NY" },
      { name: "West Warehouse", type: "warehouse", address: "789 West Rd, TX" },
    ],
    4: [
      { name: "Regional HQ", type: "headquarters", address: "321 Region St, FL" },
      { name: "East Branch", type: "branch", address: "654 East Blvd, MA" },
    ],
    5: [
      { name: "National Center", type: "headquarters", address: "987 National Ave, DC" },
      { name: "South Hub", type: "branch", address: "654 South St, GA" },
      { name: "Central Warehouse", type: "warehouse", address: "321 Central Rd, IL" },
    ],
  }[numericId] || [];
  
  return locationTypes;
};

export const getLocationTypeIcon = (type: string) => {
  switch (type) {
    case "headquarters":
      return "🏢";
    case "branch":
      return "🏪";
    case "warehouse":
      return "🏭";
    default:
      return "📍";
  }
};