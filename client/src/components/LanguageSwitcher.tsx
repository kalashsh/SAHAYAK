import { useLanguage } from '../lib/i18n';

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  return <div className={`flex items-center gap-1 rounded-full border px-1 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${dark ? 'border-[#f5f1e8]/20 text-[#f5f1e8]/70' : 'border-border text-muted-foreground'}`} aria-label={t('nav.language')}><button onClick={() => setLanguage('en')} className={`rounded-full px-2 py-1 transition ${language === 'en' ? (dark ? 'bg-[#f5f1e8] text-[#18231f]' : 'bg-foreground text-background') : ''}`}>English</button><button onClick={() => setLanguage('hi')} className={`rounded-full px-2 py-1 transition ${language === 'hi' ? (dark ? 'bg-[#f5f1e8] text-[#18231f]' : 'bg-foreground text-background') : ''}`}>हिन्दी</button></div>;
}
