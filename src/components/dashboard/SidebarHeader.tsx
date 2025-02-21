export const SidebarHeader = () => {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold">
          RX
        </div>
        <span className="font-semibold">RX Manager</span>
      </div>
    </div>
  );
};