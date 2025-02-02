'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { localeLanguageRegionMap, locales, LocaleType } from '~/i18n';
import { useRouter } from '~/navigation';

import { Button } from '../ui/button';
import { Popover } from '../ui/popover';
import { Select } from '../ui/select';

type LanguagesByRegionMap = Record<
  string,
  {
    languages: string[];
    flag: string;
  }
>;

export const LocaleSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();

  const t = useTranslations('Header');

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const selectedLocale = localeLanguageRegionMap[locale as LocaleType];

  const [regionSelected, setRegionSelected] = useState(selectedLocale.region);
  const [languageSelected, setLanguageSelected] = useState(selectedLocale.language);

  const languagesByRegionMap = useMemo(
    () =>
      Object.values(localeLanguageRegionMap).reduce<LanguagesByRegionMap>(
        (acc, { region, language, flag }) => {
          if (!acc[region]) {
            acc[region] = { languages: [language], flag };
          }

          if (!acc[region].languages.includes(language)) {
            acc[region].languages.push(language);
          }

          return acc;
        },
        {},
      ),
    [],
  );

  const regions = Object.keys(languagesByRegionMap);

  const handleOnOpenChange = () => {
    setRegionSelected(selectedLocale.region);
    setLanguageSelected(selectedLocale.language);
  };

  const handleRegionChange = (region: string) => {
    setRegionSelected(region);
    setLanguageSelected(languagesByRegionMap[region]?.languages[0] || '');
  };

  const handleLanguageChange = (language: string) => {
    if (language) {
      setLanguageSelected(language);
    }
  };

  const handleOnSubmit = () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const keys = Object.keys(localeLanguageRegionMap) as LocaleType[];

    const newLocale = keys.find(
      (key) =>
        localeLanguageRegionMap[key].language === languageSelected &&
        localeLanguageRegionMap[key].region === regionSelected,
    );

    if (newLocale) {
      router.replace('/', { locale: newLocale });
    }
  };

  return (
    Object.keys(locales).length > 1 && (
      <Popover
        align="end"
        onOpenChange={handleOnOpenChange}
        trigger={
          <button className="flex h-12 items-center p-3 text-2xl">{selectedLocale.flag}</button>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleOnSubmit}>
          <p>{t('chooseCountryAndLanguage')}</p>
          <Select
            onValueChange={handleRegionChange}
            options={regions.map((region) => ({
              value: region,
              label: `${languagesByRegionMap[region]?.flag} ${region}`,
            }))}
            value={regionSelected}
          />
          <Select
            onValueChange={handleLanguageChange}
            options={
              languagesByRegionMap[regionSelected]?.languages.map((language) => ({
                value: language,
                label: language,
              })) || []
            }
            value={languageSelected}
          />
          <Button className="w-auto" type="submit">
            {t('goToSite')}
          </Button>
        </form>
      </Popover>
    )
  );
};
