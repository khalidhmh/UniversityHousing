/**
 * PrintableHeader Component - Phase 8
 * Header component visible only during printing
 * Features: University branding, date, and report title
 */

import React from 'react';

interface PrintableHeaderProps {
  title: string;
}

/**
 * PrintableHeader Component */
export const PrintableHeader: React.FC<PrintableHeaderProps> = ({ title }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="printable-header">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          University Housing Management System
        </h1>
        <div className="text-lg text-gray-700 font-medium mb-1">
          {title}
        </div>
        <div className="text-sm text-gray-600">
          Generated on: {currentDate}
        </div>
      </div>
    </div>
  );
};

export default PrintableHeader;
