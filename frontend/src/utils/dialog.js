// Custom Dialog and Notification Event Bus for Clini-Tech
const DIALOG_EVENT = 'clinitech-custom-dialog';

/**
 * Trigger a custom modal dialog (Alert or Confirm)
 */
export const showDialog = ({
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  title = '',
  message = '',
  confirmText = '',
  cancelText = 'إلغاء',
  isConfirm = false,
  onConfirm = null,
  onCancel = null
}) => {
  const defaultTitle = isConfirm 
    ? (type === 'danger' ? 'تأكيد الحذف والإجراء' : 'تأكيد العملية')
    : (type === 'warning' ? 'تنبيه من المنظومة' : type === 'danger' ? 'خطأ في العملية' : 'إشعار');

  const defaultConfirmText = isConfirm
    ? (type === 'danger' ? 'نعم، متأكد وحذف' : 'نعم، تأكيد')
    : 'حسناً، فهمت';

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(DIALOG_EVENT, {
        detail: {
          type,
          title: title || defaultTitle,
          message,
          confirmText: confirmText || defaultConfirmText,
          cancelText,
          isConfirm,
          onConfirm,
          onCancel
        }
      })
    );
  }
};

/**
 * Show a sleek modern alert modal
 */
export const showAlert = (message, title = '', type = 'warning') => {
  showDialog({
    type,
    title,
    message,
    isConfirm: false
  });
};

/**
 * Show a sleek modern confirmation modal
 */
export const showConfirm = (message, onConfirm, title = '', type = 'danger') => {
  showDialog({
    type,
    title,
    message,
    isConfirm: true,
    onConfirm
  });
};

// Global intercept for window.alert to always look beautiful
if (typeof window !== 'undefined') {
  window.alert = (msg) => {
    showAlert(String(msg || ''));
  };
}
