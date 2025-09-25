'use client';

import { useRouter } from 'next/navigation';
import BasicEditContractModal from './basic-edit-contract-modal';
import type { Contract, User, DocumentType } from '@/types';

interface EditContractModalWrapperProps {
  contract: Contract;
  users: User[];
  documentTypes: DocumentType[];
}

const EditContractModalWrapper = ({ contract, users, documentTypes }: EditContractModalWrapperProps) => {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <BasicEditContractModal
      isOpen={true}
      onClose={handleClose}
      contract={contract}
      users={users}
      documentTypes={documentTypes}
    />
  );
};

export default EditContractModalWrapper;