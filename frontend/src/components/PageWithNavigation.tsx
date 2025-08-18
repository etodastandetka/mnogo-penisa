import React from 'react';
import { Navigation } from './Navigation';
import { PageWrapper } from './PageWrapper';

interface PageWithNavigationProps {
  children: React.ReactNode;
}

export const PageWithNavigation: React.FC<PageWithNavigationProps> = ({ children }) => {
  return (
    <>
      <Navigation />
      <PageWrapper>
        {children}
      </PageWrapper>
    </>
  );
};

