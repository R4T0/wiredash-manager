
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderTabProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default PlaceholderTab;
