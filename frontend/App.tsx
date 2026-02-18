import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import IncidentModule from './components/IncidentModule';
import ProblemModule from './components/ProblemModule';
import ChangeModule from './components/ChangeModule';
import ServicePortfolioModule from './components/ServicePortfolioModule';
import CMDBModule from './components/CMDBModule';
import PortfolioModule from './components/PortfolioModule';
import ServicePortalModule from './components/ServicePortalModule';
import RiskModule from './components/RiskModule';
import AIGovernanceModule from './components/AIGovernanceModule';
import EnterpriseArchitectureModule from './components/EnterpriseArchitectureModule';
import StrategyModule from './components/StrategyModule';
import IdeationPortal from './components/IdeationPortal';
import IdeationModule from './components/IdeationModule';

const App = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/strategy" element={<StrategyModule />} />
          <Route path="/ideation-portal" element={<IdeationPortal />} />
          <Route path="/ideation-mgmt" element={<IdeationModule />} />
          <Route path="/portal" element={<ServicePortalModule />} />
          <Route path="/incident" element={<IncidentModule />} />
          <Route path="/problem" element={<ProblemModule />} />
          <Route path="/change" element={<ChangeModule />} />
          <Route path="/risk" element={<RiskModule />} />
          <Route path="/ai-governance" element={<AIGovernanceModule />} />
          <Route path="/ea" element={<EnterpriseArchitectureModule />} />
          <Route path="/portfolio" element={<PortfolioModule />} />
          <Route path="/services" element={<ServicePortfolioModule />} />
          <Route path="/cmdb" element={<CMDBModule />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
