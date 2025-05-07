import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import koCommon from '../../public/locales/ko/common.json';
import enCommon from '../../public/locales/en/common.json';

export const defaultLanguage = 'ko';
export const languages = ['ko', 'en'];
export const defaultNS = 'common';

const resources = {
  ko: {
    common: koCommon
  },
  en: {
    common: enCommon
  }
};

const createI18nClient = async (lng = defaultLanguage, ns = defaultNS) => {
  const i18nInstance = createInstance({
    lng,
    defaultNS: ns,
    fallbackLng: defaultLanguage,
    resources,
    ns: [ns],
    fallbackNS: defaultNS,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

  i18nInstance.use(initReactI18next);
  i18nInstance.use(Backend);
  i18nInstance.use(LanguageDetector);

  await i18nInstance.init({
    lng,
    fallbackLng: defaultLanguage,
    resources,
    ns: [ns],
    fallbackNS: defaultNS,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

  return i18nInstance;
};

export { createI18nClient }; 