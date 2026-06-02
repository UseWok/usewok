import { X } from 'lucide-react';

export default function ProModal({ open, title, subtitle, children, onClose, onAction, actionText }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-black/60 backdrop-blur-sm">
      <div className="relative w-[95%] md:w-[480px] bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted text-muted-foreground rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {actionText && (
          <div className="p-4 border-t border-border flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
            <button onClick={onAction} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0055FF] hover:bg-[#0044CC] rounded-md transition-colors shadow-sm">{actionText}</button>
          </div>
        )}
      </div>
    </div>
  );
}