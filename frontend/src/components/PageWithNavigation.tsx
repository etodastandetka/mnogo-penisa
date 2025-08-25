import React from 'react';
import { Navigation } from './Navigation';
import { PageWrapper } from './PageWrapper';

interface PageWithNavigationProps {
  children: React.ReactNode;
}

export const PageWithNavigation: React.FC<PageWithNavigationProps> = ({ children }) => {
  console.log('🔧 PageWithNavigation рендерится');
  return (
    <>
      <Navigation />
      <PageWrapper>
        {children}
      </PageWrapper>
    </>
  );
};

