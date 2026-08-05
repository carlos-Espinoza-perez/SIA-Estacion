import React from 'react';
import { DashboardLayoutTemplate } from '../../components/templates/DashboardLayoutTemplate/DashboardLayoutTemplate';
import { DashboardOverview } from '../../components/organisms/DashboardOverview/DashboardOverview';

export const DashboardPage: React.FC = () => {
  return (
    <DashboardLayoutTemplate breadcrumbTitle="Dashboard">
      <DashboardOverview />
    </DashboardLayoutTemplate>
  );
};
