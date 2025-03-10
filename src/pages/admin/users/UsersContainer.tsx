import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters } from "@/components/users/filters/UserFilters";
import UsersTable, { User } from "@/components/users/UsersTable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface UsersContainerProps {
  users: User[];
  selectedUsers: string[];
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSelectionChange: (selectedIds: string[]) => void;
}

export function UsersContainer({
  users,
  selectedUsers,
  searchTerm,
  filterType,
  filterStatus,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onSelectionChange,
}: UsersContainerProps) {
  const {toast} = useToast()
  const[groupid,setGroup] = useState(null)

  const addGroup = async()=>{
try {
  
  if(!groupid){
    toast({
      title: "Group Selection ",
      description: "Please Select Group to continue.",
      variant: "destructive",
    });
  }
  const { data, error } = await supabase
  .from("profiles")
  .update({ group_id: groupid }) // Update group_id properly
  .in("id", selectedUsers); // Use .in() to update multiple IDs

// Check if an error occurred
if (error) {
  console.error("Error updating profiles:", error.message);
  alert("Failed to update profiles. Please try again.");
  return;
}

  
        // Handle case where no data is found
        if (!data) {
       
        
          return;
        }
  
        // Set selected location state
        console.log("Fetched Location Data:", data);
   
} catch (error) {
  
}
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Customers List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <UserFilters
            searchTerm={searchTerm}
            filterType={filterType}
            filterStatus={filterStatus}
            onSearchChange={onSearchChange}
            onTypeChange={onTypeChange}
            onStatusChange={onStatusChange}
          />
{selectedUsers.length > 0 && (
  <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 bg-white shadow-lg rounded-lg">
<select
  name="profile"
  id="profile"
  className="w-full md:w-72 p-3 border border-gray-300 rounded-lg shadow-sm 
             focus:ring-2 focus:ring-blue-500 focus:outline-none"
  onChange={(e) => setGroup(e.target.value)}
>
  <option value="" disabled selected>
    Select a user
  </option>
  
  {/* Filter users by role before mapping */}
  {users
    .filter((user) => user.type.toLowerCase() === "group") // Only include users with role "group"
    .map((user) => (
      <option key={user.id} value={user.id}>
        {user.name}
      </option>
    ))}
</select>


    <button
      onClick={addGroup}
      className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md 
                 hover:bg-blue-700 transition duration-300 ease-in-out 
                 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      + Add to Group
    </button>
  </div>
)}


          <div className="rounded-md border ">
            <UsersTable
              users={users}
              selectedUsers={selectedUsers}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
