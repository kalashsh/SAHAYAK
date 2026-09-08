import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export const HERO_IMAGE = '/images/sahayak-hero.png';
export const CITIZEN_IMAGE = '/images/citizen.png';

export type Tone = 'sage' | 'terracotta' | 'saffron' | 'indigo' | 'lavender';

export const toneStyles: Record<Tone, string> = {
  sage: 'bg-sage text-sage-fg',
  terracotta: 'bg-terracotta text-terracotta-fg',
  saffron: 'bg-saffron text-saffron-fg',
  indigo: 'bg-indigo text-indigo-fg',
  lavender: 'bg-lavender text-lavender-fg',
};

export const toneLine: Record<Tone, string> = {
  sage: 'bg-primary',
  terracotta: 'bg-brand-terracotta',
  saffron: 'bg-brand-saffron',
  indigo: 'bg-brand-indigo',
  lavender: 'bg-brand-lavender',
};

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${inverse ? 'text-background' : 'text-foreground'}`}>
      <div className="relative grid h-9 w-9 place-items-center rounded-full border border-current/30">
        <span className="absolute h-3 w-3 rounded-full bg-brand-terracotta" />
        <span className="absolute h-6 w-6 rounded-full border border-current/50" />
        <span className="absolute h-8 w-8 rounded-full border border-current/20" />
      </div>
      <div>
        <div className="font-display text-[16px] font-semibold tracking-[0.22em]">SAHAYAK</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-60">Welfare Gap Radar</div>
      </div>
    </div>
  );
}

export function Wordmark({ children, tone = 'terracotta' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
      <span className={`h-1.5 w-1.5 rounded-full ${toneLine[tone]}`} />
      {children}
    </span>
  );
}

export function Pill({ children, tone = 'sage' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${toneStyles[tone]}`}>{children}</span>;
}

export function SectionLabel({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <Wordmark>{kicker}</Wordmark>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[0.98] tracking-[-0.035em] text-foreground md:text-6xl">{title}</h1>
      </div>
      {description && <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
    </div>
  );
}

export function StatNumber({ value, label, detail, tone = 'terracotta' }: { value: string; label: string; detail?: string; tone?: Tone }) {
  return (
    <div className="relative border-l border-border pl-5">
      <div className="font-display text-4xl tracking-[-0.04em] text-foreground md:text-5xl">{value}</div>
      <div className="mt-2 text-sm font-medium text-foreground">{label}</div>
      {detail && <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{detail}</div>}
      <span className={`absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full ${toneLine[tone]}`} />
    </div>
  );
}

export function PrimaryButton({ children, href, onClick, tone = 'terracotta', icon: Icon = ArrowRight, type = 'button' }: { children: ReactNode; href?: string; onClick?: () => void; tone?: Tone; icon?: LucideIcon; type?: 'button' | 'submit' }) {
  const content = (
    <span className="group inline-flex items-center gap-3 rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background shadow-[0_10px_22px_rgba(24,35,31,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary active:scale-[0.98]">
      <span className={`grid h-6 w-6 place-items-center rounded-full ${toneStyles[tone]}`}><Icon size={13} /></span>
      {children}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
    </span>
  );
  return href ? <Link href={href}>{content}</Link> : <button type={type} onClick={onClick}>{content}</button>;
}

export function OutlineButton({ children, onClick, icon: Icon = ArrowRight }: { children: ReactNode; onClick?: () => void; icon?: LucideIcon }) {
  return <button onClick={onClick} className="group inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:bg-accent active:scale-[0.98]">{children}<Icon size={14} className="transition-transform group-hover:translate-x-0.5" /></button>;
}