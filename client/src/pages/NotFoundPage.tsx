import { Logo, PrimaryButton } from '../lib/ui';
import { useLanguage } from '../lib/i18n';

export function NotFound() {
  const { t } = useLanguage();
  return <div className="grid min-h-screen place-items-center bg-background p-6 text-center"><div><Logo /><h1 className="mt-10 font-display text-5xl">{t('notFound.title')}</h1><p className="mt-4 text-muted-foreground">{t('notFound.body')}</p><div className="mt-7"><PrimaryButton href="/admin-login">{t('notFound.cta')}</PrimaryButton></div></div></div>;
}