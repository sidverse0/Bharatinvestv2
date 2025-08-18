
'use client';

import MaintenanceScreen from '@/components/MaintenanceScreen';
import maintenanceConfig from '../../maintenance.config.json';

export default function RootProvider({ children }: { children: React.ReactNode }) {
  if (maintenanceConfig.maintenanceMode) {
    return <MaintenanceScreen config={maintenanceConfig} />;
  }

  return <>{children}</>;
}
