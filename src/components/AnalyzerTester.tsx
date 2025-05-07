"use client";

import React, { useState, useEffect } from "react";
import {
  globalT,
  isTranslationLoaded,
  addTranslationChangeListener,
} from "./LanguageSwitcher";

interface Token {
  token: string;
  position: number;
  start_offset: number;
  end_offset: number;
}

interface AnalyzerExample {
  text: string;
  tokens: Token[];
}

interface AnalyzerInfo {
  description: string;
  examples: AnalyzerExample[];
}

type TranslateFunction = (key: string) => string;

const cachedTranslations: Record<string, string> = {};

const safeT = (key: string, t: TranslateFunction): string => {
  if (!isTranslationLoaded) {
    return cachedTranslations[key] || key;
  }

  const translated = t(key);

  if (translated !== key) {
    cachedTranslations[key] = translated;
  }
  return translated;
};

interface AnalyzerTesterProps {
  analyzer: string;
  customText?: string;
}

const AnalyzerTester: React.FC<AnalyzerTesterProps> = ({
  analyzer,
  customText,
}) => {
  const [t, setT] = useState<TranslateFunction>(() => globalT);
  const [selectedAnalyzer, setSelectedAnalyzer] = useState(
    analyzer || "standard"
  );
  const [inputText, setInputText] = useState(customText || "");
  const [isCustomText, setIsCustomText] = useState(!!customText);
  const [isExpanded, setIsExpanded] = useState(false);
  const [customExample, setCustomExample] = useState<AnalyzerExample | null>(
    null
  );

  const analyzerExamples: Record<string, AnalyzerInfo> = {
    standard: {
      description: safeT("analyzerTester.standardDescription", t),
      examples: [
        {
          text: "The quick brown fox jumps over the lazy dog.",
          tokens: [
            { token: "the", position: 0, start_offset: 0, end_offset: 3 },
            { token: "quick", position: 1, start_offset: 4, end_offset: 9 },
            { token: "brown", position: 2, start_offset: 10, end_offset: 15 },
            { token: "fox", position: 3, start_offset: 16, end_offset: 19 },
            { token: "jumps", position: 4, start_offset: 20, end_offset: 25 },
            { token: "over", position: 5, start_offset: 26, end_offset: 30 },
            { token: "the", position: 6, start_offset: 31, end_offset: 34 },
            { token: "lazy", position: 7, start_offset: 35, end_offset: 39 },
            { token: "dog", position: 8, start_offset: 40, end_offset: 43 },
          ],
        },
      ],
    },
    simple: {
      description: safeT("analyzerTester.simpleDescription", t),
      examples: [
        {
          text: "The quick brown-fox jumps over the lazy dog.",
          tokens: [
            { token: "the", position: 0, start_offset: 0, end_offset: 3 },
            { token: "quick", position: 1, start_offset: 4, end_offset: 9 },
            { token: "brown", position: 2, start_offset: 10, end_offset: 15 },
            { token: "fox", position: 3, start_offset: 16, end_offset: 19 },
            { token: "jumps", position: 4, start_offset: 20, end_offset: 25 },
            { token: "over", position: 5, start_offset: 26, end_offset: 30 },
            { token: "the", position: 6, start_offset: 31, end_offset: 34 },
            { token: "lazy", position: 7, start_offset: 35, end_offset: 39 },
            { token: "dog", position: 8, start_offset: 40, end_offset: 43 },
          ],
        },
      ],
    },
    whitespace: {
      description: safeT("analyzerTester.whitespaceDescription", t),
      examples: [
        {
          text: "The quick brown-fox jumps over the lazy dog.",
          tokens: [
            { token: "The", position: 0, start_offset: 0, end_offset: 3 },
            { token: "quick", position: 1, start_offset: 4, end_offset: 9 },
            { token: "brown-fox", position: 2, start_offset: 10, end_offset: 19 },
            { token: "jumps", position: 3, start_offset: 20, end_offset: 25 },
            { token: "over", position: 4, start_offset: 26, end_offset: 30 },
            { token: "the", position: 5, start_offset: 31, end_offset: 34 },
            { token: "lazy", position: 6, start_offset: 35, end_offset: 39 },
            { token: "dog.", position: 7, start_offset: 40, end_offset: 44 },
          ],
        },
      ],
    },
    keyword: {
      description: safeT("analyzerTester.keywordDescription", t),
      examples: [
        {
          text: "The quick brown fox jumps over the lazy dog.",
          tokens: [
            {
              token: "The quick brown fox jumps over the lazy dog.",
              position: 0,
              start_offset: 0,
              end_offset: 44,
            },
          ],
        },
      ],
    },
    pattern: {
      description: safeT("analyzerTester.patternDescription", t),
      examples: [
        {
          text: "The quick, brown-fox jumps over the lazy dog.",
          tokens: [
            { token: "the", position: 0, start_offset: 0, end_offset: 3 },
            { token: "quick", position: 1, start_offset: 4, end_offset: 9 },
            { token: "brown", position: 2, start_offset: 11, end_offset: 16 },
            { token: "fox", position: 3, start_offset: 17, end_offset: 20 },
            { token: "jumps", position: 4, start_offset: 21, end_offset: 26 },
            { token: "over", position: 5, start_offset: 27, end_offset: 31 },
            { token: "the", position: 6, start_offset: 32, end_offset: 35 },
            { token: "lazy", position: 7, start_offset: 36, end_offset: 40 },
            { token: "dog", position: 8, start_offset: 41, end_offset: 44 },
          ],
        },
      ],
    },
    uax_url_email: {
      description: safeT("analyzerTester.uax_url_emailDescription", t),
      examples: [
        {
          text: "Contact us at support@example.com or visit https://example.com",
          tokens: [
            { token: "contact", position: 0, start_offset: 0, end_offset: 7 },
            { token: "us", position: 1, start_offset: 8, end_offset: 10 },
            { token: "at", position: 2, start_offset: 11, end_offset: 13 },
            {
              token: "support@example.com",
              position: 3,
              start_offset: 14,
              end_offset: 33,
            },
            { token: "or", position: 4, start_offset: 34, end_offset: 36 },
            { token: "visit", position: 5, start_offset: 37, end_offset: 42 },
            {
              token: "https://example.com",
              position: 6,
              start_offset: 43,
              end_offset: 62,
            },
          ],
        },
      ],
    },
  };

  useEffect(() => {
    const unsubscribe = addTranslationChangeListener(() => {
      setT(() => globalT);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (analyzer) {
      setSelectedAnalyzer(analyzer);
    }
  }, [analyzer]);

  const handleAnalyzerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnalyzer(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setIsCustomText(true);

    if (!text) {
      setCustomExample(null);
      return;
    }

    let tokens: Token[] = [];

    if (selectedAnalyzer === "keyword") {
      tokens = [
        { token: text, position: 0, start_offset: 0, end_offset: text.length },
      ];
    } else if (selectedAnalyzer === "whitespace") {
      let position = 0;
      let currentOffset = 0;
      const parts = text.split(/\s+/);

      for (const part of parts) {
        if (part.length > 0) {
          const start = text.indexOf(part, currentOffset);
          const end = start + part.length;
          tokens.push({
            token: part,
            position: position++,
            start_offset: start,
            end_offset: end,
          });
          currentOffset = end;
        }
      }
    } else {
      let position = 0;
      let currentOffset = 0;
      const words = text.toLowerCase().split(/[\s.,!?;:()\[\]{}'"\/\\-]+/);

      for (const word of words) {
        if (word.length > 0) {
          const start = text.toLowerCase().indexOf(word, currentOffset);
          const end = start + word.length;
          tokens.push({
            token: word,
            position: position++,
            start_offset: start,
            end_offset: end,
          });
          currentOffset = end;
        }
      }
    }

    if (tokens.length === 0) {
      tokens = [
        { token: "토큰화", position: 0, start_offset: 0, end_offset: 3 },
        { token: "결과가", position: 1, start_offset: 4, end_offset: 7 },
        { token: "없습니다", position: 2, start_offset: 8, end_offset: 11 },
      ];
    }

    setCustomExample({
      text: text,
      tokens: tokens,
    });
  };

  const useDefaultExample = () => {
    setIsCustomText(false);
    setInputText("");
    setCustomExample(null);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getTokenizationExample = () => {
    const analyzerInfo =
      analyzerExamples[selectedAnalyzer] || analyzerExamples.standard;

    if (isCustomText && customExample) {
      return customExample;
    }

    if (!isCustomText && analyzerInfo.examples.length > 0) {
      return analyzerInfo.examples[0];
    }

    return {
      text: inputText || "텍스트를 입력하세요",
      tokens: [
        { token: "분석기", position: 0, start_offset: 0, end_offset: 3 },
        { token: "예시", position: 1, start_offset: 4, end_offset: 6 },
        { token: "입니다", position: 2, start_offset: 7, end_offset: 10 },
      ],
    };
  };

  const example = getTokenizationExample();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
      <div
        onClick={toggleExpand}
        className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all duration-300 ${
          isExpanded ? "border-b border-gray-200" : "border-b-0"
        }`}
      >
        <h3 className="text-lg font-medium flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-colors duration-300 ${
              isExpanded ? "text-blue-500" : "text-gray-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span
            className={`transition-colors duration-300 ${
              isExpanded ? "text-gray-800" : "text-gray-600"
            }`}
          >
            {safeT("analyzerTester.title", t)}
          </span>
        </h3>
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-all duration-500 ease-in-out ${
              isExpanded ? "text-blue-500 rotate-180" : "text-gray-400 rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          transitionDelay: isExpanded ? "0ms" : "0ms",
        }}
      >
        <div
          className={`p-4 transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transitionDelay: isExpanded ? "200ms" : "0ms",
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {safeT("analyzerTester.analyzerType", t)}
            </label>
            <select
              value={selectedAnalyzer}
              onChange={handleAnalyzerChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(analyzerExamples).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {analyzerExamples[selectedAnalyzer]?.description ||
                safeT("analyzerTester.noDescription", t)}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {safeT("analyzerTester.inputText", t)}
            </label>
            <div className="flex items-center mb-2">
              <textarea
                value={isCustomText ? inputText : example.text}
                onChange={handleTextChange}
                placeholder={safeT("analyzerTester.textPlaceholder", t)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <button
              onClick={useDefaultExample}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {safeT("analyzerTester.useDefaultExample", t)}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-b pb-3 border-gray-200">
            <div className="p-3 bg-gray-50 rounded border border-gray-300 break-words text-base leading-relaxed">
              {example.text.split("").map((char, idx) => {
                const tokenForPosition = example.tokens.find(
                  (t) => idx >= t.start_offset && idx < t.end_offset
                );

                const isTokenStart = example.tokens.some(
                  (t) => idx === t.start_offset
                );

                const isTokenEnd = example.tokens.some(
                  (t) => idx === t.end_offset - 1
                );

                const tokenIndex = tokenForPosition
                  ? example.tokens.findIndex(
                      (t) => t.token === tokenForPosition.token
                    )
                  : -1;

                const colors = [
                  "bg-blue-100 border-blue-500",
                  "bg-green-100 border-green-500",
                  "bg-amber-100 border-amber-500",
                  "bg-purple-100 border-purple-500",
                  "bg-rose-100 border-rose-500",
                  "bg-teal-100 border-teal-500",
                  "bg-indigo-100 border-indigo-500",
                  "bg-orange-100 border-orange-500",
                ];

                const colorClass =
                  tokenIndex >= 0 ? colors[tokenIndex % colors.length] : "";

                return (
                  <span
                    key={idx}
                    className={`
                      inline-block
                      ${tokenForPosition ? colorClass : ""}
                      ${
                        isTokenStart
                          ? `border-l-2 pl-0.5 ${
                              colorClass.split(" ")[1] || "border-blue-500"
                            }`
                          : ""
                      }
                      ${
                        isTokenEnd
                          ? `border-r-2 pr-0.5 ${
                              colorClass.split(" ")[1] || "border-blue-500"
                            }`
                          : ""
                      }
                    `}
                    title={tokenForPosition ? tokenForPosition.token : ""}
                  >
                    {char === " " ? (
                      <span className="text-transparent select-none">
                        &middot;
                      </span>
                    ) : (
                      char
                    )}
                  </span>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {example.tokens.map((token, idx) => {
                const colors = [
                  "bg-blue-100 text-blue-800 border-blue-300",
                  "bg-green-100 text-green-800 border-green-300",
                  "bg-amber-100 text-amber-800 border-amber-300",
                  "bg-purple-100 text-purple-800 border-purple-300",
                  "bg-rose-100 text-rose-800 border-rose-300",
                  "bg-teal-100 text-teal-800 border-teal-300",
                  "bg-indigo-100 text-indigo-800 border-indigo-300",
                  "bg-orange-100 text-orange-800 border-orange-300",
                ];

                const colorClass = colors[idx % colors.length];

                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${colorClass}`}
                  >
                    {token.token}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 pt-3">
              {safeT("analyzerTester.tokenizationResult", t)}
            </label>
            <div className="border rounded-md border-gray-300 p-3 bg-gray-50">
              <div className="text-sm font-mono mb-2">
                {safeT("analyzerTester.original", t)}:{" "}
                <span className="text-gray-700">{example.text}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left">
                        {safeT("analyzerTester.token", t)}
                      </th>
                      <th className="px-3 py-2 text-left">
                        {safeT("analyzerTester.position", t)}
                      </th>
                      <th className="px-3 py-2 text-left sm:table-cell hidden">
                        {safeT("analyzerTester.startOffset", t)}
                      </th>
                      <th className="px-3 py-2 text-left sm:table-cell hidden">
                        {safeT("analyzerTester.endOffset", t)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {example.tokens.map((token, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-3 py-2 font-mono">{token.token}</td>
                        <td className="px-3 py-2">{token.position}</td>
                        <td className="px-3 py-2 sm:table-cell hidden">
                          {token.start_offset}
                        </td>
                        <td className="px-3 py-2 sm:table-cell hidden">
                          {token.end_offset}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {safeT("analyzerTester.simulationWarning", t)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzerTester;
