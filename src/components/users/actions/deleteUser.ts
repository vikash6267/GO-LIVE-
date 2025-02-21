
import { supabase } from "@/supabaseClient";
import { toast } from "@/hooks/use-toast";

export const deleteUser = async (userId: string, userName: string): Promise<boolean> => {
  try {
    console.log('Starting delete operation for user:', userId);
    
    // First check if user exists and has no dependencies
    const { data: userToDelete, error: deleteCheckError } = await supabase
      .from('profiles')
      .select(`
        id,
        type,
        locations (id),
        documents
      `)
      .eq('id', userId)
      .single();
    
    if (deleteCheckError) {
      console.error('Error checking user:', deleteCheckError);
      throw new Error('Failed to verify user status');
    }

    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Check for dependencies
    const hasLocations = userToDelete.locations && userToDelete.locations.length > 0;
    const hasDocuments = userToDelete.documents && Array.isArray(userToDelete.documents) && userToDelete.documents.length > 0;

    if (hasLocations || hasDocuments) {
      throw new Error(
        'Cannot delete user with existing locations or documents. ' +
        'Please remove associated data first.'
      );
    }

    // Attempt to delete the user
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Delete operation failed:', deleteError);
      throw new Error(deleteError.message || 'Failed to delete user');
    }

    console.log('User deleted successfully:', userId);
    
    toast({
      title: "Success",
      description: `${userName} has been deleted`,
    });
    
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
};
