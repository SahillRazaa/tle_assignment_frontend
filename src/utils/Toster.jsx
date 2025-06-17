import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

export const ShowToast = ({ type, title, message }) => {
  const content = (
    <div>
      <strong>{title}</strong>
      <div>{message}</div>
    </div>
  );

  switch (type) {
    case 'success':
      toast.success(content, toastOptions);
      break;
    case 'error':
      toast.error(content, toastOptions);
      break;
    case 'info':
      toast.info(content, toastOptions);
      break;
    case 'warning':
      toast.warning(content, toastOptions);
      break;
    default:
      toast(content, toastOptions);
  }
};
