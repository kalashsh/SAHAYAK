import { useEffect, useState, type ReactNode } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider } from './contexts/ThemeContext';
import { languageFromStorage, LanguageContext, type Language, type TranslationKey, translate, translateValue, translateDetail } from './lib/i18n';
import { ConsoleLayout, RedirectToLogin } from './components/Layout';
import { AdminLogin } from './pages/AdminLoginPage';
import { AuditPage } from './pages/AuditPage';
import { CitizenCompare } from './pages/CitizenComparePage';
import { CitizenLanding } from './pages/CitizenLandingPage';
import { CitizenProfilePage } from './pages/CitizenProfilePage';
import { CitizenResults } from './pages/CitizenResultsPage';
import { CitizenSaved } from './pages/CitizenSavedPage';
import { CitizenSchemeDetail } from './pages/CitizenSchemeDetailPage';
import { CitizenWizard } from './pages/CitizenWizardPage';
import { GapRadarPage } from './pages/GapRadarPage';
import { Landing } from './pages/LandingPage';
import { MapsPage } from './pages/MapsPage';
import { NotFound } from './pages/NotFoundPage';
import { OpportunityPage } from './pages/OpportunityPage';
import { OverviewPage } from './pages/OverviewPage';
import { RuleConsistencyPage } from './pages/RuleConsistencyPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { VerificationPage } from './pages/VerificationPage';
import { WelfareGraphPage } from './pages/WelfareGraphPage';

function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => languageFromStorage());
  useEffect(() => { document.documentElement.lang = language === 'hi' ? 'hi' : 'en'; }, [language]);
  const setLanguage = (next: Language) => { setLanguageState(next); window.localStorage.setItem('sahayak-language', next); document.documentElement.lang = next === 'hi' ? 'hi' : 'en'; };
  const t = (key: TranslationKey) => translate(language, key);
  const tv = (value: string) => translateValue(language, value);
  const td = (sentence: string) => translateDetail(language, sentence);
  return <LanguageContext.Provider value={{ language, setLanguage, t, tv, td }}>{children}</LanguageContext.Provider>;
}

function Router() {
  return <Switch><Route path="/" component={Landing} /><Route path="/admin-login" component={AdminLogin} /><Route path="/citizen" component={CitizenLanding} /><Route path="/citizen/profile" component={CitizenWizard} /><Route path="/citizen/results" component={CitizenResults} /><Route path="/citizen/scheme/:id" component={CitizenSchemeDetail} /><Route path="/citizen/compare" component={CitizenCompare} /><Route path="/citizen/saved" component={CitizenSaved} /><Route path="/citizen/profile/view" component={CitizenProfilePage} /><Route path="/citizen/profile/edit" component={CitizenWizard} /><Route path="/dashboard" component={OverviewPage} /><Route path="/gap-radar" component={GapRadarPage} /><Route path="/welfare-graph" component={WelfareGraphPage} /><Route path="/opportunity-radar" component={OpportunityPage} /><Route path="/maps" component={MapsPage} /><Route path="/rule-consistency" component={RuleConsistencyPage} /><Route path="/simulator" component={SimulatorPage} /><Route path="/verification" component={VerificationPage} /><Route path="/audit" component={AuditPage} /><Route component={NotFound} /></Switch>;
}

function RoutedApp() {
  const [location] = useLocation();
  const { user, loading } = useAuth();
  if (location.startsWith('/citizen') || location === '/' || location === '/admin-login') return <Router />;
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f5f1e8] text-sm text-[#65736c]">Checking administrator session…</div>;
  return user ? <ConsoleLayout><Router /></ConsoleLayout> : <RedirectToLogin />;
}

export default function App() {
  return (
    <ThemeProvider switchable defaultTheme="light">
      <AuthProvider>
        <LanguageProvider>
          <RoutedApp />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
