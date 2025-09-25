'use client';

import { useState } from 'react';
import EditContractModal from './edit-contract-modal';
import type { Contract, User } from '@/types';

interface EditContractModalTriggerProps {
  children: React.ReactNode;
  users: User[];
  contract?: Contract | null;
}

const EditContractModalTrigger = ({ children, users, contract }: EditContractModalTriggerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div onClick={handleOpen} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      {isOpen && (
        <EditContractModal
          isOpen={isOpen}
          onClose={handleClose}
          contract={contract}
          users={users}
        />
      )}
    </>
  );
};

export default EditContractModalTrigger;