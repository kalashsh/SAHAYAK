import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Logo, Wordmark, PrimaryButton, OutlineButton, HERO_IMAGE } from '../lib/ui';
import { capabilities } from '../lib/data';
import { useLanguage } from '../lib/i18n';
import { ArrowUpRight, ArrowRight, Menu, MoveRight, Play, ShieldCheck, Target } from 'lucide-react';

export function Landing() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [activeCapability, setActiveCapability] = useState(0);

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          <a href="#story" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground">The gap</a>
          <a href="#capabilities" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground">Capabilities</a>
          <Link href="/citizen" className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary transition hover:text-foreground">{t('citizen.findForMe')}</Link>
          <button onClick={() => navigate('/admin-login')} className="rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition hover:bg-[#18231f] hover:text-[#f5f1e8]">{t('nav.console')} <span className="ml-2 opacity-50">↗</span></button>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden"><Menu size={17} /></button>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-[1500px] gap-12 px-6 pb-20 pt-10 md:grid-cols-[0.82fr_1.18fr] md:items-center md:px-12 md:pb-28 md:pt-16">
          <div className="relative z-10">
            <Wordmark>Smart India Hackathon 2026 · PS-3</Wordmark>
            <h1 className="mt-7 max-w-2xl font-display text-[clamp(4rem,9vw,8.5rem)] leading-[0.86] tracking-[-0.065em]">The welfare gap is <em className="font-serif font-normal text-brand-terracotta">often invisible.</em></h1>
            <p className="mt-8 max-w-lg text-[17px] leading-7 text-muted-foreground">Across districts, welfare signals exist across different records, schemes and geographies. SAHAYAK brings those signals together to show where attention may be needed.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryButton href="/citizen" icon={Target}>{t('citizen.findForMe')}</PrimaryButton>
              <OutlineButton onClick={() => navigate('/admin-login')} icon={ArrowRight}>{t('role.adminSub')}</OutlineButton>
            </div>
            <div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"><ShieldCheck size={13} className="text-primary" /> Prototype · Synthetic data · Human-verified workflow</div>
          </div>

          <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] bg-muted shadow-[0_24px_70px_rgba(67,55,34,0.14)] md:min-h-[610px]">
            <img src={HERO_IMAGE} alt="Peri-urban fields at the edge of the pilot region" className="absolute inset-0 h-full w-full object-cover object-center motion-safe:animate-[slowZoom_18s_ease-in-out_infinite_alternate]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#18231f]/45 via-transparent to-[#18231f]/5" />
            <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(245,241,232,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,232,.12)_1px,transparent_1px)] [background-size:58px_58px]" />
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-background/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-indigo"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-terracotta" /> India · live prototype</div>
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between text-[#f5f1e8]">
              <div>
                <div className="font-display text-3xl tracking-[-0.035em]">Real landscape</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f5f1e8]/70">+ welfare intelligence</div>
              </div>
              <div className="hidden text-right md:block"><div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#f5f1e8]/70">Signal focus</div><div className="mt-1 text-sm">Najafgarh <span className="text-[#efb17d]">↗</span></div></div>
            </div>
            <div className="absolute left-[63%] top-[44%] h-3 w-3 rounded-full border-2 border-[#f5f1e8] bg-brand-terracotta shadow-[0_0_0_8px_rgba(200,107,67,.22)]" />
            <div className="absolute left-[63%] top-[44%] ml-5 mt-1 hidden rounded-sm bg-[#18231f]/85 px-3 py-2 text-[10px] text-[#f5f1e8] md:block"><div className="font-mono uppercase tracking-[0.12em] text-[#efb17d]">Potential gap</div><div className="mt-0.5 font-medium">1,284 households</div></div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary" id="story">
          <div className="mx-auto max-w-[1500px] px-6 py-20 md:px-12 md:py-28">
            <div className="grid gap-16 md:grid-cols-[0.7fr_1.3fr]">
              <div><Wordmark tone="saffron">The problem we start with</Wordmark><h2 className="mt-5 max-w-md font-display text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">Signals exist.<br /><span className="text-brand-terracotta">Connections don’t.</span></h2><p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">The gap is rarely one missing record. It is a pattern spread across people, programs and place.</p></div>
              <div className="relative">
                <div className="absolute left-[29px] top-4 h-[calc(100%-32px)] w-px bg-[#18231f]/15" />
                <div className="space-y-8">
                  {[
                    ['TODAY', 'Fragmented data', 'Household, scheme and geography records sit apart.'],
                    ['01', 'Manual screening', 'Teams read lists one by one, under pressure.'],
                    ['02', 'Reactive outreach', 'Action starts when a complaint or deadline arrives.'],
                    ['03', 'Hidden gaps', 'Potentially eligible households remain invisible.'],
                  ].map(([index, title, body], i) => <div key={title} className="relative flex gap-6"><div className={`relative z-10 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-4 border-[#ece8de] ${i === 0 ? 'bg-brand-terracotta' : 'bg-primary'}`} /><div className="grid flex-1 gap-1 md:grid-cols-[100px_1fr] md:gap-8"><div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{index}</div><div><div className="font-display text-2xl tracking-[-0.025em]">{title}</div><div className="mt-1 text-sm text-muted-foreground">{body}</div></div></div></div>)}
                </div>
                <div className="mt-10 flex items-center gap-3 pl-11 font-mono text-[10px] uppercase tracking-[0.18em] text-primary"><MoveRight size={16} /> with SAHAYAK, signals become intelligence</div>
                <div className="mt-10 grid gap-3 border-t border-border pt-7 md:grid-cols-5">
                  {['Unified welfare graph', 'Explainable detection', 'Prioritized outreach', 'What-if planning', 'Verified action'].map((item, i) => <div key={item} className="group border-l border-border pl-3 transition hover:border-brand-terracotta"><div className="font-mono text-[10px] text-brand-terracotta">0{i + 1}</div><div className="mt-2 text-sm font-medium leading-5">{item}</div></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-6 py-20 md:px-12 md:py-28" id="capabilities">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Wordmark tone="indigo">One connected system</Wordmark><h2 className="mt-5 max-w-2xl font-display text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">From <em className="font-serif font-normal text-primary">signal</em> to verified action.</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">Five capabilities, one calm operational layer for the people responsible for making welfare delivery visible.</p></div>
          <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[380px] overflow-hidden rounded-[1.75rem] bg-[#18231f] p-8 text-[#f5f1e8] md:min-h-[500px] md:p-12">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_25%,#d9923b_0,transparent_25%),radial-gradient(circle_at_70%_60%,#557a63_0,transparent_28%)]" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M112 108C220 150 235 279 339 291C433 302 427 171 572 197" stroke="rgba(245,241,232,.26)" strokeWidth="1" strokeDasharray="5 7" /><path d="M112 108C220 150 235 279 339 291C433 302 427 171 572 197" stroke="#d9923b" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 10" className="motion-safe:animate-[dash_4s_linear_infinite]" /><circle cx="112" cy="108" r="7" fill="#c86b43" stroke="#f5f1e8" strokeWidth="3" /><circle cx="339" cy="291" r="7" fill="#557a63" stroke="#f5f1e8" strokeWidth="3" /><circle cx="572" cy="197" r="7" fill="#8275a8" stroke="#f5f1e8" strokeWidth="3" /><path d="M84 404C196 344 274 414 350 355C447 279 502 387 628 310" stroke="rgba(245,241,232,.12)" strokeWidth="1" /></svg>
              <div className="relative z-10 flex h-full flex-col justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#efb17d]">Interactive intelligence layer</div><div className="mt-6 max-w-md font-display text-4xl leading-[0.98] tracking-[-0.04em] md:text-5xl">{capabilities[activeCapability].verb} what the records can’t show alone.</div><p className="mt-5 max-w-sm text-sm leading-6 text-[#f5f1e8]/65">{capabilities[activeCapability].description}</p></div><div className="flex items-end justify-between"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f5f1e8]/45">Hover a capability to trace the layer</div><div className="font-display text-6xl text-[#f5f1e8]/10">0{activeCapability + 1}</div></div></div>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {capabilities.map((capability, index) => <button key={capability.name} onMouseEnter={() => setActiveCapability(index)} onFocus={() => setActiveCapability(index)} onClick={() => navigate(index === 0 ? '/gap-radar' : index === 1 ? '/welfare-graph' : index === 2 ? '/opportunity-radar' : index === 3 ? '/rule-consistency' : '/simulator')} className={`group flex w-full items-center gap-5 py-6 text-left transition ${activeCapability === index ? 'pl-3' : ''}`}><div className={`font-mono text-[10px] ${activeCapability === index ? 'text-brand-terracotta' : 'text-muted-foreground'}`}>{capability.number}</div><div className="flex-1"><div className="font-display text-2xl tracking-[-0.025em] transition group-hover:text-brand-terracotta">{capability.name}</div><div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{capability.verb}</div></div><ArrowUpRight size={17} className={`transition ${activeCapability === index ? 'text-brand-terracotta opacity-100' : 'opacity-20'}`} /></button>)}
            </div>
          </div>
        </section>

        <section className="bg-primary px-6 py-16 text-primary-foreground md:px-12 md:py-24"><div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-10 md:flex-row md:items-end"><div><Wordmark tone="saffron">Built for the people behind the records</Wordmark><h2 className="mt-5 max-w-xl font-display text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">A window into the welfare system of a region.</h2></div><div className="max-w-sm"><p className="text-sm leading-6 text-primary-foreground/75">The administrator remains responsible for verification. SAHAYAK makes the evidence easier to see, explain and act on.</p><div className="mt-6"><PrimaryButton href="/admin-login" tone="saffron" icon={Play}>Open the prototype</PrimaryButton></div></div></div></section>
      </main>
      <footer className="flex flex-col gap-4 bg-[#18231f] px-6 py-8 text-[#f5f1e8]/60 md:flex-row md:items-center md:justify-between md:px-12"><Logo inverse /><div className="font-mono text-[10px] uppercase tracking-[0.14em]">Synthetic data · Demonstration environment · India pilot</div><div className="font-mono text-[10px] uppercase tracking-[0.14em]">SIH 2026 · PS-3</div></footer>
    </div>
  );
}
