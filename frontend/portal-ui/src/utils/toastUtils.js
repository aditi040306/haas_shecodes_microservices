/**********************************************************************************************************
 * @file        toastUtils.js 
 * @description common toast Utility, to show success or error message across the pages wherever required
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-07-24
 * @version     v1.0.0
 **********************************************************************************************************/
import { toast } from 'react-toastify';

export function showSuccess(message) {
  toast.success(message, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    style:{minWidth: '25rem', maxWidth: '1rem' }
  });
}

export function showError(message) {
  toast.error(message, {
    position: 'top-center',
    hideProgressBar: true,
    closeOnClick: true,
    style:{minWidth: '25rem', maxWidth: '1rem' }
  });
}
