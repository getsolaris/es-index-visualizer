"use client";

import React, { useState, useEffect } from "react";
import MappingBlock from "./MappingBlock";
import { globalT, addTranslationChangeListener } from "./LanguageSwitcher";

type TranslateFunction = (key: string) => string;

const cachedTranslations: Record<string, string> = {};

const safeT = (key: string, t: TranslateFunction): string => {
  const translated = t(key);
  if (translated !== key) {
    cachedTranslations[key] = translated;
    return translated;
  }
  return cachedTranslations[key] || key;
};

type MappingType = {
  type: string;
  color: string;
  properties?: Record<string, unknown>;
};

const mappingTypes: MappingType[] = [
  { type: "text", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "keyword", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "long", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "integer", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "short", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "byte", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "double", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "float", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "date", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "boolean", color: "bg-cyan-100 border-cyan-300 shadow-cyan-50" },
  { type: "object", color: "bg-blue-100 border-blue-300 shadow-blue-50" },
  { type: "nested", color: "bg-purple-100 border-purple-300 shadow-purple-50" },
  {
    type: "join",
    color: "bg-pink-100 border-pink-300 shadow-pink-50",
    properties: { type: "join", relations: { parent: ["child"] } },
  },
];

const MappingSidebar: React.FC = () => {
  const [t, setT] = useState<TranslateFunction>(() => globalT);

  useEffect(() => {
    const unsubscribe = addTranslationChangeListener(() => {
      setT(() => globalT);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="p-4">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          {safeT("mapping.title", t)}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {safeT("mapping.subtitle", t)}
        </p>
      </div>

      <div className="pt-4 space-y-6">
        <div>
          <div className="space-y-2">
            {mappingTypes.map((type) => (
              <MappingBlock
                key={type.type}
                type={type.type}
                color={type.color}
                properties={type.properties || { type: type.type }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingSidebar;
