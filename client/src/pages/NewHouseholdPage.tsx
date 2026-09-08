import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Banknote, Briefcase, GraduationCap, Home, LandPlot, Loader2, Plus, ShieldAlert, ShieldCheck, UsersRound } from 'lucide-react';
import { SectionLabel, Wordmark, type Tone } from '../lib/ui';
import { useCreateHousehold } from '../lib/api';
import {
  AGE_GROUP_OPTIONS,
  AGRICULTURAL_ACTIVITY_OPTIONS,
  AGRICULTURAL_LAND_OPTIONS,
  APPRENTICESHIP_INTEREST_OPTIONS,
  BUSINESS_SIZE_OPTIONS,
  BUSINESS_STATUS_OPTIONS,
  CHILDREN_OPTIONS,
  COURSE_FIELD_OPTIONS,
  CULTIVATION_OPTIONS,
  DEPENDENTS_OPTIONS,
  DISABILITY_OPTIONS,
  DISABLED_MEMBERS_OPTIONS,
  EDUCATION_OPTIONS,
  ELDERLY_MEMBERS_OPTIONS,
  EXISTING_PENSION_OPTIONS,
  FORMAL_BUSINESS_OPTIONS,
  GENDER_OPTIONS,
  HOUSEHOLD_SIZE_OPTIONS,
  HOUSING_OPTIONS,
  INCOME_OPTIONS,
  IRRIGATION_OPTIONS,
  LANDHOLDING_OPTIONS,
  LOOKING_FOR_EMPLOYMENT_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  OCCUPATION_OPTIONS,
  PENSION_RANGE_OPTIONS,
  PENSION_SOURCE_OPTIONS,
  PENSION_STATUS_OPTIONS,
  SKILL_TRAINING_OPTIONS,
  SOCIAL_CATEGORY_OPTIONS,
  STILL_WORKING_OPTIONS,
  STUDYING_OPTIONS,
  VENDOR_STATUS_OPTIONS,
  citizenSchemes,
  defaultCitizenProfile,
  indiaStates,
} from '../lib/citizen';
import {
  USER_ENTERED_DATASET_LABEL,
  USER_ENTERED_SCENARIO,
  buildProfile,
  headLabelOf,
  occupationPresets,
} from '../lib/manualHousehold';

const initialForm = (): Record<string, string> => ({
  ...defaultCitizenProfile,
  state: indiaStates[0].name,
  district: indiaStates[0].districts[0].name,
  locality: indiaStates[0].districts[0].localities[0],
  occupation: 'Farmer',
  ...occupationPresets('Farmer'),
});

export function NewHouseholdPage() {
  const navigate = useLocation()[1];
  const create = useCreateHousehold();

  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [covered, setCovered] = useState<Set<string>>(new Set());
  const [coverageSearch, setCoverageSearch] = useState('');
  const [touched, setTouched] = useState(false);

  const stateData = indiaStates.find((item) => item.name === form.state);
  const districtData = stateData?.districts.find((item) => item.name === form.district);
  const localityOptions = districtData?.localities ?? [];

  const occupation = form.occupation;
  const showAgriculture = occupation === 'Farmer' || occupation === 'Agricultural worker';
  const showBusiness = ['Business owner', 'Self-employed', 'Street vendor'].includes(occupation);
  const showStudent = occupation === 'Student';
  const showPension = occupation === 'Retired' || occupation === 'Pensioner';

  const filteredSchemes = useMemo(() => {
    const query = coverageSearch.trim().toLowerCase();
    if (!query) return citizenSchemes;
    return citizenSchemes.filter(
      (scheme) =>
        scheme.name.toLowerCase().includes(query) ||
        scheme.purpose.toLowerCase().includes(query),
    );
  }, [coverageSearch]);

  const set = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleState = (next: string) => {
    const state = indiaStates.find((item) => item.name === next);
    setForm((current) => ({
      ...current,
      state: next,
      district: state?.districts[0]?.name ?? next,
      locality: state?.districts[0]?.localities[0] ?? '',
    }));
  };

  const handleDistrict = (next: string) => {
    const state = indiaStates.find((item) => item.name === form.state);
    setForm((current) => ({
      ...current,
      district: next,
      locality: state?.districts.find((item) => item.name === next)?.localities[0] ?? '',
    }));
  };

  const handleOccupation = (next: string) => {
    setForm((current) => ({ ...current, occupation: next, ...occupationPresets(next) }));
  };

  const toggleCovered = (schemeId: string) => {
    setCovered((current) => {
      const next = new Set(current);
      if (next.has(schemeId)) {
        next.delete(schemeId);
      } else {
        next.add(schemeId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!form.state || !form.district || !form.locality) return;
    const result = await create.create({
      state: form.state,
      district: form.district,
      locality: form.locality,
      profile: buildProfile(form),
      coverage: Array.from(covered),
    });
    if (result) {
      navigate(`/households/${result.household.id}`);
    }
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/households" className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition hover:text-foreground">
          <ArrowLeft size={13} /> Households
        </Link>
        <SectionLabel
          kicker="Household intelligence · user-entered"
          title="Add a prototype household."
          description="Enter a household for the prototype. It is stored alongside the synthetic set, clearly labelled as user-entered, and evaluated against all 40 schemes with the same engine used for every other household."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Wordmark tone="indigo">{USER_ENTERED_DATASET_LABEL}</Wordmark>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{USER_ENTERED_SCENARIO}</span>
          <span className="rounded-full bg-sage px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-sage-fg">40 schemes evaluated</span>
        </div>
      </div>

      <div className="mb-8 flex items-start gap-3 rounded-[1.2rem] border border-brand-terracotta/25 bg-terracotta/10 p-4">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-brand-terracotta" />
        <div className="text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">Prototype only — no sensitive data.</span>
          {' '}Never enter real names, Aadhaar numbers, phone numbers or other identifiers. The household head label is generated automatically from occupation and age only.
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        className="space-y-6"
      >
        <Card title="Location" tone="indigo" icon={<Home size={14} />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectRow label="State" value={form.state} options={indiaStates.map((item) => item.name)} onChange={handleState} />
            <SelectRow label="District" value={form.district} options={stateData?.districts.map((item) => item.name) ?? []} onChange={handleDistrict} />
            <SelectRow label="Locality" value={form.locality} options={localityOptions} onChange={(value) => set('locality', value)} />
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Synthetic location list from the prototype geography</p>
        </Card>

        <Card title="About the household head" tone="terracotta" icon={<UsersRound size={14} />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectRow label="Main activity / occupation" value={form.occupation} options={Array.from(OCCUPATION_OPTIONS)} onChange={handleOccupation} />
            <SelectRow label="Age group" value={form.ageGroup} options={Array.from(AGE_GROUP_OPTIONS)} onChange={(value) => set('ageGroup', value)} />
            <SelectRow label="Gender" value={form.gender} options={Array.from(GENDER_OPTIONS)} onChange={(value) => set('gender', value)} />
            <SelectRow label="Marital status" value={form.maritalStatus} options={Array.from(MARITAL_STATUS_OPTIONS)} onChange={(value) => set('maritalStatus', value)} />
            <SelectRow label="Social category" value={form.socialCategory} options={Array.from(SOCIAL_CATEGORY_OPTIONS)} onChange={(value) => set('socialCategory', value)} />
            <SelectRow label="Disability" value={form.disability} options={Array.from(DISABILITY_OPTIONS)} onChange={(value) => set('disability', value)} />
            <SelectRow label="Education" value={form.education} options={Array.from(EDUCATION_OPTIONS)} onChange={(value) => set('education', value)} />
          </div>
        </Card>

        <Card title="Household" tone="saffron" icon={<UsersRound size={14} />}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectRow label="Household size" value={form.householdSize} options={Array.from(HOUSEHOLD_SIZE_OPTIONS)} onChange={(value) => set('householdSize', value)} />
            <SelectRow label="Children" value={form.children} options={Array.from(CHILDREN_OPTIONS)} onChange={(value) => set('children', value)} />
            <SelectRow label="Dependents" value={form.dependents} options={Array.from(DEPENDENTS_OPTIONS)} onChange={(value) => set('dependents', value)} />
            <SelectRow label="Elderly members" value={form.elderlyMembers} options={Array.from(ELDERLY_MEMBERS_OPTIONS)} onChange={(value) => set('elderlyMembers', value)} />
            <SelectRow label="Disabled members" value={form.disabledMembers} options={Array.from(DISABLED_MEMBERS_OPTIONS)} onChange={(value) => set('disabledMembers', value)} />
            <SelectRow label="Income range" value={form.income} options={Array.from(INCOME_OPTIONS)} onChange={(value) => set('income', value)} />
            <SelectRow label="Housing" value={form.housing} options={Array.from(HOUSING_OPTIONS)} onChange={(value) => set('housing', value)} />
          </div>
        </Card>

        {showAgriculture && (
          <Card title="Agriculture & landholding" tone="sage" icon={<LandPlot size={14} />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectRow label="Agricultural activity" value={form.agriculturalActivity} options={Array.from(AGRICULTURAL_ACTIVITY_OPTIONS)} onChange={(value) => set('agriculturalActivity', value)} />
              <SelectRow label="Agricultural land" value={form.agriculturalLand} options={Array.from(AGRICULTURAL_LAND_OPTIONS)} onChange={(value) => set('agriculturalLand', value)} />
              <SelectRow label="Landholding" value={form.landholding} options={Array.from(LANDHOLDING_OPTIONS)} onChange={(value) => set('landholding', value)} />
              <SelectRow label="Cultivation" value={form.cultivation} options={Array.from(CULTIVATION_OPTIONS)} onChange={(value) => set('cultivation', value)} />
              <SelectRow label="Irrigation" value={form.irrigation} options={Array.from(IRRIGATION_OPTIONS)} onChange={(value) => set('irrigation', value)} />
            </div>
          </Card>
        )}

        {showBusiness && (
          <Card title="Business & self-employment" tone="saffron" icon={<Briefcase size={14} />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectRow label="Business status" value={form.businessStatus} options={Array.from(BUSINESS_STATUS_OPTIONS)} onChange={(value) => set('businessStatus', value)} />
              <SelectRow label="Business size" value={form.businessSize} options={Array.from(BUSINESS_SIZE_OPTIONS)} onChange={(value) => set('businessSize', value)} />
              <SelectRow label="Formal business" value={form.formalBusiness} options={Array.from(FORMAL_BUSINESS_OPTIONS)} onChange={(value) => set('formalBusiness', value)} />
              {occupation === 'Street vendor' && (
                <SelectRow label="Vendor status" value={form.vendorStatus} options={Array.from(VENDOR_STATUS_OPTIONS)} onChange={(value) => set('vendorStatus', value)} />
              )}
            </div>
          </Card>
        )}

        {showStudent && (
          <Card title="Education & skills" tone="indigo" icon={<GraduationCap size={14} />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectRow label="Studying" value={form.studying} options={Array.from(STUDYING_OPTIONS)} onChange={(value) => set('studying', value)} />
              <SelectRow label="Course field" value={form.courseField} options={Array.from(COURSE_FIELD_OPTIONS)} onChange={(value) => set('courseField', value)} />
              <SelectRow label="Skill training" value={form.skillTraining} options={Array.from(SKILL_TRAINING_OPTIONS)} onChange={(value) => set('skillTraining', value)} />
              <SelectRow label="Looking for employment" value={form.lookingForEmployment} options={Array.from(LOOKING_FOR_EMPLOYMENT_OPTIONS)} onChange={(value) => set('lookingForEmployment', value)} />
              <SelectRow label="Apprenticeship interest" value={form.apprenticeshipInterest} options={Array.from(APPRENTICESHIP_INTEREST_OPTIONS)} onChange={(value) => set('apprenticeshipInterest', value)} />
            </div>
          </Card>
        )}

        {showPension && (
          <Card title="Pension & retirement" tone="indigo" icon={<Banknote size={14} />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectRow label="Pension status" value={form.pensionStatus} options={Array.from(PENSION_STATUS_OPTIONS)} onChange={(value) => set('pensionStatus', value)} />
              <SelectRow label="Pension source" value={form.pensionSource} options={Array.from(PENSION_SOURCE_OPTIONS)} onChange={(value) => set('pensionSource', value)} />
              <SelectRow label="Pension range" value={form.pensionRange} options={Array.from(PENSION_RANGE_OPTIONS)} onChange={(value) => set('pensionRange', value)} />
              <SelectRow label="Still working" value={form.stillWorking} options={Array.from(STILL_WORKING_OPTIONS)} onChange={(value) => set('stillWorking', value)} />
              <SelectRow label="Existing pension" value={form.existingPension} options={Array.from(EXISTING_PENSION_OPTIONS)} onChange={(value) => set('existingPension', value)} />
            </div>
          </Card>
        )}

        <Card title="Current welfare coverage" tone="sage" icon={<ShieldCheck size={14} />}>
          <p className="mb-3 text-xs text-muted-foreground">
            Select any schemes this prototype household already receives. These records drive the gap and overlap analysis on
            the detail page. {covered.size} of {citizenSchemes.length} selected.
          </p>
          <input
            aria-label="Search schemes"
            value={coverageSearch}
            onChange={(event) => setCoverageSearch(event.target.value)}
            placeholder="Search schemes by name or purpose…"
            className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <div className="max-h-72 overflow-y-auto rounded-lg border border-border p-2">
            {filteredSchemes.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No schemes match the current search.</div>
            ) : (
              filteredSchemes.map((scheme) => (
                <div key={scheme.id} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
                  <input
                    id={`coverage-${scheme.id}`}
                    type="checkbox"
                    checked={covered.has(scheme.id)}
                    onChange={() => toggleCovered(scheme.id)}
                    className="h-4 w-4 accent-brand-terracotta"
                  />
                  <label htmlFor={`coverage-${scheme.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{scheme.name}</span>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{scheme.purpose}</span>
                  </label>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Household label (generated · PII-free)</div>
            <div className="mt-1 font-display text-2xl tracking-[-0.02em]">{headLabelOf(form.occupation, form.ageGroup)}</div>
          </div>
          {create.error && (
            <div className="rounded-lg border border-brand-terracotta/30 bg-terracotta/20 px-4 py-3 text-sm text-terracotta-fg">{create.error}</div>
          )}
          {touched && !form.locality && (
            <div className="rounded-lg border border-brand-terracotta/30 bg-terracotta/20 px-4 py-3 text-sm text-terracotta-fg">Choose a locality to continue.</div>
          )}
          <button
            type="submit"
            disabled={create.busy}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-[0_10px_22px_rgba(24,35,31,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary active:scale-[0.98] disabled:translate-y-0 disabled:opacity-50"
          >
            {create.busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {create.busy ? 'Creating household…' : 'Create household'}
          </button>
        </div>
      </form>
    </>
  );
}

function Card({ title, tone, icon, children }: { title: string; tone: Tone; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[1.2rem] border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className={`grid h-6 w-6 place-items-center rounded-full ${tone === 'indigo' ? 'bg-indigo text-indigo-fg' : tone === 'saffron' ? 'bg-saffron text-saffron-fg' : tone === 'sage' ? 'bg-sage text-sage-fg' : 'bg-terracotta text-terracotta-fg'}`}>{icon}</span>
        <Wordmark tone={tone}>{title}</Wordmark>
      </div>
      {children}
    </section>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}