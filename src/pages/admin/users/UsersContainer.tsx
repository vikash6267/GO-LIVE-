import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters } from "@/components/users/filters/UserFilters";
import UsersTable, { User } from "@/components/users/UsersTable";

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

          <div className="rounded-md border">
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