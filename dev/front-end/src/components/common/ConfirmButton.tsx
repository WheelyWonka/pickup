import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  message: string;
  onConfirm: () => void;
}

const ConfirmButton: React.FC<Props> = ({ message, onConfirm, children, onClick, ...btnProps }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    const ok = window.confirm(message);
    if (ok) onConfirm();
  };
  return (
    <button {...btnProps} onClick={handleClick}>
      {children}
    </button>
  );
};

export default ConfirmButton;
