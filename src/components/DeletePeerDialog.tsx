
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface DeletePeerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  peerName: string;
  isDeleting: boolean;
}

const DeletePeerDialog: React.FC<DeletePeerDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  peerName,
  isDeleting
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-red-400">
            <Trash2 className="w-5 h-5 mr-2" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Tem certeza que deseja excluir o peer "{peerName}"?
            <br />
            <span className="text-red-400 font-medium">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Peer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePeerDialog;
