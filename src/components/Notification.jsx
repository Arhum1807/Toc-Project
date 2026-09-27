import { useMachine } from '../context/MachineContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Notification() {
  const { state, actions } = useMachine();
  const { notification } = state;

  if (!notification) return null;

  const styles = {
    success: { icon: CheckCircle, cls: 'bg-green-50 dark:bg-green-950/50 border-green-400 text-green-800 dark:text-green-300' },
    error: { icon: XCircle, cls: 'bg-red-50 dark:bg-red-950/50 border-red-400 text-red-800 dark:text-red-300' },
    info: { icon: Info, cls: 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-800 dark:text-blue-300' },
    warning: { icon: AlertTriangle, cls: 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-800 dark:text-amber-300' },
  };

  const { icon: Icon, cls } = styles[notification.type] || styles.info;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm ${cls}`}>
        <Icon size={18} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm flex-1">{notification.message}</p>
        <button
          onClick={actions.clearNotification}
          className="hover:opacity-60 transition-opacity"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
