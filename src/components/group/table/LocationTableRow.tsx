import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Edit, Eye, MoreHorizontal } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Location } from "../types/location";

interface LocationTableRowProps {
  location: Location;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  getStatusColor: (status: string) => string;
}

export function LocationTableRow({ 
  location, 
  onView, 
  onEdit,
  getStatusColor 
}: LocationTableRowProps) {
  return (
    <TableRow key={location.id} className="hover:bg-muted/50">
      <TableCell className="font-medium">{location.name}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2 max-w-[200px] truncate">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{location.address}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{location.address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(location.status)}>
          {location.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span>{location.manager}</span>
          {location.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              {location.phone}
            </div>
          )}
          {location.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {location.email}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{location.ordersThisMonth}</div>
      </TableCell>
      <TableCell>{location.lastActive}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onView(location.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(location.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Location</DropdownMenuItem>
              <DropdownMenuItem>Manage Staff</DropdownMenuItem>
              <DropdownMenuItem>View Orders</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Deactivate Location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}