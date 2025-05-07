"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createI18nClient } from "../app/i18n";

type TranslateFunction = (key: string) => string;

export let globalT: TranslateFunction = (key: string) => key;
export let isTranslationLoaded = false;

const listeners: (() => void)[] = [];

export const notifyTranslationChange = () => {
  listeners.forEach((listener) => listener());
};

export const addTranslationChangeListener = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

let initPromise: Promise<void> | null = null;
export const initializeTranslation = (forceLocale?: string) => {
  if (!initPromise) {
    initPromise = (async () => {
      isTranslationLoaded = false;
      const savedLang = forceLocale || localStorage.getItem("language") || "ko";
      const i18n = await createI18nClient(savedLang);
      globalT = i18n.t.bind(i18n);
      isTranslationLoaded = true;
      notifyTranslationChange();
    })();
  }
  return initPromise;
};

const LanguageSwitcher: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<string>("ko");
  const [t, setT] = useState<TranslateFunction>(() => globalT);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "ko";
    setCurrentLang(savedLang);

    initializeTranslation();

    const unsubscribe = addTranslationChangeListener(() => {
      setT(() => globalT);
    });

    return unsubscribe;
  }, []);

  const changeLanguage = useCallback(
    async (locale: string) => {
      if (isLoading || locale === currentLang) return;

      setIsLoading(true);
      setCurrentLang(locale);
      localStorage.setItem("language", locale);

      initPromise = null;
      await initializeTranslation(locale);
      setIsLoading(false);
    },
    [currentLang, isLoading]
  );

  return (
    <div className="inline-flex shadow-sm rounded-md">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => changeLanguage("ko")}
        className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        } ${
          currentLang === "ko"
            ? "bg-blue-100 text-blue-800 border-blue-300"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        {isLoading ? "..." : t("language.ko")}
      </button>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => changeLanguage("en")}
        className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        } ${
          currentLang === "en"
            ? "bg-blue-100 text-blue-800 border-blue-300"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        {isLoading ? "..." : t("language.en")}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
