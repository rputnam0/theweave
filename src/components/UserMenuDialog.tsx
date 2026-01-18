import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, LogOut } from 'lucide-react';
import { Win95Window, Win95Button } from './ui/Win95Primitives';

interface UserMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export function UserMenuDialog({ isOpen, onClose, onNavigate }: UserMenuDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 z-[2000]"
            onClick={onClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2001]"
          >
            <Win95Window 
              title="User Menu" 
              icon={<User className="w-3.5 h-3.5" />}
              onClose={onClose}
              showControls
              className="min-w-[280px]"
            >
              <div className="p-4 bg-background">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-2 bg-input border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input mb-2">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-t-input border-l-input border-r-border border-b-border">
                       <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                       <div className="font-bold text-[14px]">DM_REX</div>
                       <div className="text-[10px] text-muted-foreground uppercase">Administrator</div>
                    </div>
                  </div>

                  {/* Profile */}
                  <Win95Button
                    onClick={() => {
                      onNavigate?.('profile');
                      onClose();
                    }}
                    className="flex items-center justify-start gap-2 h-auto py-2 w-full"
                  >
                    <User className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Win95Button>

                  {/* Config/Settings */}
                  <Win95Button
                    onClick={() => {
                      onNavigate?.('settings');
                      onClose();
                    }}
                    className="flex items-center justify-start gap-2 h-auto py-2 w-full"
                  >
                    <Settings className="w-4 h-4" />
                    <span>System Configuration</span>
                  </Win95Button>

                  <div className="h-[2px] bg-gradient-to-r from-transparent via-muted-foreground to-transparent my-1 opacity-50" />

                  {/* Logout */}
                  <Win95Button
                    onClick={() => {
                      console.log('Logging out...');
                      onClose();
                    }}
                    className="flex items-center justify-start gap-2 h-auto py-2 w-full text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </Win95Button>
                </div>
              </div>
            </Win95Window>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}