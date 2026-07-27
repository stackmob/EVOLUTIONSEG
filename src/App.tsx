import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { CompanyOnboardingModal } from './components/CompanyOnboardingModal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Clients } from './pages/Clients';
import { Contracts } from './pages/Contracts';
import { Scales } from './pages/Scales';
import { Assets } from './pages/Assets';
import { Maintenance } from './pages/Maintenance';
import { Providers } from './pages/Providers';
import { Reports } from './pages/Reports';
import { AuditLogs } from './pages/AuditLogs';
import { Docs } from './pages/Docs';
import { Occurrences } from './pages/Occurrences';
import { SaasSubscription } from './pages/SaasSubscription';
import { SupabaseIntegration } from './pages/SupabaseIntegration';
import { UsersManagement } from './pages/UsersManagement';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { hasRealTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Tracking detailed references clicked from global search or alerts
  const [openDetailId, setOpenDetailId] = useState<{ type: string; id: string } | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);

  // Show onboarding if user is logged in but has no real company registered
  const showCompanyOnboarding = !onboardingDone && !hasRealTenant;

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <CompanyOnboardingModal
        isOpen={showCompanyOnboarding}
        onComplete={() => setOnboardingDone(true)}
      />

      <DashboardLayout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        openDetailId={openDetailId}
        setOpenDetailId={setOpenDetailId}
      >
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'employees' && <Employees openDetailId={openDetailId} setOpenDetailId={setOpenDetailId} />}
        {activeTab === 'occurrences' && <Occurrences />}
        {activeTab === 'clients' && <Clients openDetailId={openDetailId} setOpenDetailId={setOpenDetailId} />}
        {activeTab === 'contracts' && <Contracts openDetailId={openDetailId} setOpenDetailId={setOpenDetailId} />}
        {activeTab === 'scales' && <Scales />}
        {activeTab === 'assets' && <Assets openDetailId={openDetailId} setOpenDetailId={setOpenDetailId} />}
        {activeTab === 'maintenance' && <Maintenance />}
        {activeTab === 'providers' && <Providers />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'saas-plans' && <SaasSubscription />}
        {activeTab === 'supabase' && <SupabaseIntegration />}
        {activeTab === 'audit' && <AuditLogs />}
        {activeTab === 'docs' && <Docs />}
      </DashboardLayout>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TenantProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
