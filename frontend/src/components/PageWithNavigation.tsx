import React from 'react';
import { Navigation } from './Navigation';

interface PageWithNavigationProps {
  children: React.ReactNode;
}

export const PageWithNavigation: React.FC<PageWithNavigationProps> = ({ children }) => {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

