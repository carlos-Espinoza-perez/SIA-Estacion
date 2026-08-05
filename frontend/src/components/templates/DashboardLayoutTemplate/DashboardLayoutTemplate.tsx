import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { Sidebar } from '../../organisms/Sidebar/Sidebar';
import { RightSidebar } from '../../organisms/RightSidebar/RightSidebar';
import { DashboardHeader } from '../../organisms/DashboardHeader/DashboardHeader';

export interface DashboardLayoutTemplateProps {
  children: React.ReactNode;
  breadcrumbTitle?: string;
}

export const DashboardLayoutTemplate: React.FC<DashboardLayoutTemplateProps> = ({
  children,
  breadcrumbTitle = 'Dashboard',
}) => {
  const { sidebarOpen, rightSidebarOpen } = useAppSelector((state) => state.ui);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#333333',
        color: '#FFFFFF',
        width: '100vw',
      }}
    >
      {/* ── Sidebar izquierdo: wrapper anima el ancho ── */}
      <div
        style={{
          width: sidebarOpen ? '212px' : '0px',
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Sidebar isOpen={sidebarOpen} />
      </div>

      {/* ── Área central ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <DashboardHeader breadcrumbTitle={breadcrumbTitle} />
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {children}
        </div>
      </main>

      {/* ── Sidebar derecho: wrapper anima el ancho ── */}
      <div
        style={{
          width: rightSidebarOpen ? '280px' : '0px',
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <RightSidebar isOpen={rightSidebarOpen} />
      </div>
    </div>
  );
};

