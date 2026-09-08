import { describe, expect, it } from 'vitest';
import {
  translations,
  translate,
  translateValue,
  translateDetail,
  format,
  type TranslationKey,
} from './i18n';

describe('chrome key parity', () => {
  it('every english key exists in hindi', () => {
    const enKeys = Object.keys(translations.en) as TranslationKey[];
    for (const key of enKeys) {
      expect(translations.hi[key], `missing hi key ${key}`).toBeTruthy();
    }
  });

  it('hindi does not claim keys english does not define', () => {
    const enKeys = new Set(Object.keys(translations.en));
    for (const key of Object.keys(translations.hi)) {
      expect(enKeys.has(key), `orphan hi key ${key}`).toBe(true);
    }
  });
});

describe('translate', () => {
  it('returns the hindi value when asked', () => {
    expect(translate('hi', 'nav.citizenAssistance')).toBe('नागरिक सहायता');
  });

  it('returns the english value for unknown keys (safe fallback)', () => {
    expect(translate('en', 'nav.citizenAssistance')).toBe('Citizen assistance');
    expect(translate('hi', ('not.a.real.key' as TranslationKey))).toBeUndefined();
  });

  it('switches back and forth', () => {
    const key: TranslationKey = 'common.continue';
    expect(translate('hi', key)).not.toBe(translate('en', key));
    expect(translate('en', key)).toBe('Continue');
  });
});

describe('format', () => {
  it('interpolates tokens into templates', () => {
    expect(format('Step {current} of {shown}', { current: 2, shown: 5 })).toBe('Step 2 of 5');
  });
});

describe('translateValue (english passthrough on regression)', () => {
  it('returns the value unchanged in english', () => {
    expect(translateValue('en', 'Farmer')).toBe('Farmer');
    expect(translateValue('en', 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)')).toBe(
      'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    );
  });

  it('translates known values in hindi', () => {
    expect(translateValue('hi', 'Farmer')).toBe('किसान');
    expect(translateValue('hi', 'High relevance')).toBe('अत्यधिक प्रासंगिक');
    expect(translateValue('hi', 'Covered')).toBe('कवर किया गया');
    expect(translateValue('hi', 'State')).toBe('राज्य');
    expect(translateValue('hi', 'students')).toBe('छात्र');
    expect(translateValue('hi', 'Women entrepreneurs')).toBe('महिला उद्यमी');
    expect(translateValue('hi', 'the intended group')).toBe('इच्छित समूह');
  });

  it('passes through unknown values in hindi', () => {
    expect(translateValue('hi', 'Rajasthan')).toBe('Rajasthan');
    expect(translateValue('hi', 'Kisan Credit Card')).toBe('Kisan Credit Card');
  });
});

describe('translateDetail (exact sentence dictionary)', () => {
  it('translates exact dict sentences in hindi', () => {
    expect(
      translateDetail('hi', 'Your age group matches the 18-60 range for this opportunity.'),
    ).toBe('आपका आयु वर्ग इस अवसर के लिए 18-60 आयु सीमा से मेल खाता है।');
    expect(
      translateDetail('hi', 'This opportunity is meant for ages 60-60+, and your age group is outside that range.'),
    ).toBe('यह अवसर 60-60+ आयु के लिए है, और आपका आयु वर्ग इस सीमा से बाहर है।');
    expect(
      translateDetail('hi', 'This opportunity is aimed at ages 6-35; your age group falls outside.'),
    ).toBe('यह अवसर 6-35 आयु को ध्यान में रखकर बनाया गया है; आपका आयु वर्ग इससे बाहर है।');
  });

  it('leaves unmatched sentences in english (fallback)', () => {
    expect(translateDetail('hi', 'Some brand new sentence.')).toBe('Some brand new sentence.');
    expect(translateDetail('en', 'Your age group matches the 18-60 range for this opportunity.')).toBe(
      'Your age group matches the 18-60 range for this opportunity.',
    );
  });
});

describe('translateDetail (interpolated templates)', () => {
  it('occupation: matched', () => {
    const out = translateDetail('hi', 'Your main activity (Farmer) matches landholding farmer families.');
    expect(out).toBe('आपकी मुख्य गतिविधि (किसान) भूमि-धारक किसान परिवार से मेल खाती है।');
  });

  it('occupation: blocked', () => {
    const out = translateDetail(
      'hi',
      'This opportunity is intended for students, which your main activity (Farmer) does not fit.',
    );
    expect(out).toBe('यह अवसर छात्र के लिए है, जो आपकी मुख्य गतिविधि (किसान) से मेल नहीं खाता।');
  });

  it('occupation: missing from profile (engine emits spaced em dash)', () => {
    const out = translateDetail(
      'hi',
      'We could not confirm students from your profile yet \u2014 you can complete this in \u201cAbout you\u201d.',
    );
    expect(out).toBe(
      'अभी आपकी प्रोफाइल से छात्र की पुष्टि नहीं हो सकी \u2014 आप इसे \u201cआपके बारे में\u201d अनुभाग में पूरा कर सकते हैं।',
    );
  });

  it('age: matched (template)', () => {
    const out = translateDetail('hi', 'Your age group matches the 25-50 range for this opportunity.');
    expect(out).toContain('25-50');
    expect(out).toContain('मेल खाता');
  });

  it('age: blocked (template)', () => {
    const out = translateDetail('hi', 'This opportunity is meant for ages 25-50, and your age group is outside that range.');
    expect(out).toContain('25-50');
    expect(out).toContain('बाहर');
  });

  it('age: aimed template', () => {
    const out = translateDetail('hi', 'This opportunity is aimed at ages 25-50; your age group falls outside.');
    expect(out).toContain('25-50');
    expect(out).toContain('बाहर');
  });
});