import { useState } from 'react';
import { SectionLabel, Wordmark, PrimaryButton } from '../lib/ui';
import { MapView } from '../components/Map';
import { formatNumber } from '../lib/data';
import { useDistricts } from '../lib/api';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

export function OpportunityPage() {
  const { districts, loading, error } = useDistricts();
  const [selected, setSelected] = useState(districts[0]?.name ?? 'Najafgarh');
  if (loading) return <div className="grid min-h-[50vh] place-items-center bg-background text-sm text-muted-foreground">Loading districts…</div>;
  if (error || districts.length === 0) return <div className="grid min-h-[50vh] place-items-center bg-background text-sm text-terracotta-fg">{error ?? 'No district data available.'}</div>;
  const selectedDistrict = districts[0];
  const district = districts.find(item => item.name === selected) || selectedDistrict;
  return <><SectionLabel kicker="Prioritize · opportunity radar" title="Where should outreach happen first?" description="Ranked by potential reach, evidence strength and the practical opportunity to act." /><div className="grid gap-7 xl:grid-cols-[0.75fr_1.25fr]"><div className="border-y border-border"><div className="py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Ranked outreach opportunities</div>{districts.slice(0, 4).map((d, i) => <button key={d.name} onClick={() => setSelected(d.name)} className={`group flex w-full items-center gap-4 border-t border-border py-5 text-left transition ${selected === d.name ? 'bg-secondary/80' : 'hover:bg-secondary/50'}`}><div className="w-8 font-mono text-[11px] text-brand-terracotta">0{i + 1}</div><div className="flex-1"><div className="font-display text-2xl tracking-[-0.02em]">{d.name}</div><div className="mt-1 text-xs text-muted-foreground">{d.region} · {formatNumber(d.gap)} potential households</div></div><div className="text-right"><div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Priority</div><div className={`mt-1 font-display text-2xl ${selected === d.name ? 'text-brand-terracotta' : ''}`}>{d.priority}</div></div><ChevronRight size={16} className="text-muted-foreground transition group-hover:translate-x-1" /></button>)}</div><div><MapView selected={selected} mode="opportunity" items={districts} onSelect={setSelected} /><div className="mt-5 flex items-end justify-between border-b border-border pb-4"><div><Wordmark tone="saffron">Selected opportunity</Wordmark><div className="mt-2 font-display text-3xl">{district.name}, {district.region}</div></div><PrimaryButton href="/simulator" tone="saffron" icon={ArrowUpRight}>Build outreach plan</PrimaryButton></div></div></div></> }
