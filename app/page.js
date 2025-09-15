'use client'

import React, { useState } from 'react';
import XenoLandingPage from '../components/XenoLandingPage';
import XenoDashboard from '../components/XenoDashboard';

const MainApp = () => {
  const [selectedTenant, setSelectedTenant] = useState(null);

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
  };

  const handleBackToLanding = () => {
    setSelectedTenant(null);
  };

  return (
    <div>
      {!selectedTenant ? (
        <XenoLandingPage onTenantSelect={handleTenantSelect} />
      ) : (
        <XenoDashboard 
          defaultTenant={selectedTenant} 
          onBackToLanding={handleBackToLanding}
        />
      )}
    </div>
  );
};

export default MainApp;