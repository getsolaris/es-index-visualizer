"use client";

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MappingSidebar from "../components/MappingSidebar";
import JsonEditor from "../components/JsonEditor";
import IndexVisualizer, { IndexDataType } from "../components/IndexVisualizer";
import LanguageSwitcher, {
  globalT,
  addTranslationChangeListener,
  initializeTranslation,
} from "../components/LanguageSwitcher";

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

type MappingItem = {
  type: string;
  properties: Record<string, unknown>;
};

const EditorWithDropZone = ({
  jsonValue,
  setJsonValue,
  t,
}: {
  jsonValue: string;
  setJsonValue: (value: string) => void;
  t: TranslateFunction;
}) => {
  const handleDrop = (item: MappingItem) => {
    try {
      const currentJson = JSON.parse(jsonValue);

      const fieldName = prompt(safeT("mapping.fieldPrompt", t), "");

      if (!fieldName) return;

      if (!currentJson.mappings) {
        currentJson.mappings = { properties: {} };
      }

      if (!currentJson.mappings.properties) {
        currentJson.mappings.properties = {};
      }

      currentJson.mappings.properties[fieldName] = {
        ...item.properties,
        type: item.properties.type || "text",
      };

      const updatedJson = JSON.stringify(currentJson, null, 2);
      setJsonValue(updatedJson);
    } catch (error) {
      console.error("JSON 조작 중 오류 발생:", error);
    }
  };

  return (
    <div
      className="flex-1 p-4 bg-gray-50 flex items-start justify-center"
      style={{ maxHeight: "90%" }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const dragData = e.dataTransfer.getData("application/json");
        if (dragData) {
          try {
            const item = JSON.parse(dragData);
            handleDrop(item);
          } catch (err) {
            console.error("드롭 데이터 처리 중 오류:", err);
          }
        }
      }}
    >
      <div
        className="w-full rounded-lg overflow-hidden shadow-sm border border-gray-200"
        style={{ height: "100%" }}
      >
        <JsonEditor value={jsonValue} onChange={setJsonValue} />
      </div>
    </div>
  );
};

export default function Home() {
  const [jsonValue, setJsonValue] = useState<string>(`{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "email": {
          "type": "custom",
          "tokenizer": "uax_url_email",
          "filter": ["lowercase", "stop"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "id": {
        "type": "keyword"
      },
      "email": {
        "type": "text",
        "analyzer": "email"
      },
      "content": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "code": {
        "type": "alias",
        "path": "id"
      },
      "user": {
        "type": "nested",
        "properties": {
          "id": {
            "type": "keyword"
          },
          "name": {
            "type": "text"
          }
        }
      }
    }
  }
}`);

  const defaultJson: IndexDataType = {
    settings: {
      number_of_shards: 5,
      number_of_replicas: 2,
      analysis: {
        analyzer: {
          email: {
            type: "custom",
            tokenizer: "uax_url_email",
            filter: ["lowercase", "stop"],
          },
        },
      },
    },
    mappings: {
      properties: {
        title: {
          type: "text",
        },
        id: {
          type: "keyword",
        },
        email: {
          type: "text",
          analyzer: "email",
        },
        content: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
              ignore_above: 256,
            },
          },
        },
        code: {
          type: "alias",
          path: "id",
        },
        user: {
          type: "nested",
          properties: {
            id: {
              type: "keyword",
            },
            name: {
              type: "text",
            },
          },
        },
      },
    },
  };

  const [parsedJson, setParsedJson] = useState<IndexDataType>(defaultJson);
  const [t, setT] = useState<TranslateFunction>(() => globalT);
  const [indexName, setIndexName] = useState<string>("");

  useEffect(() => {
    initializeTranslation();

    const unsubscribe = addTranslationChangeListener(() => {
      setT(() => globalT);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      parseInputAndSetIndex(jsonValue);
    } catch (error) {
      console.error("파싱 오류:", error);
    }
  }, [jsonValue]);

  const parseInputAndSetIndex = (input: string) => {
    const apiFormatMatch = input
      .trim()
      .match(/^(PUT|POST)\s+([^\s{]+)\s*(\{[\s\S]*\})$/i);

    if (apiFormatMatch) {
      const indexNameFromApi = apiFormatMatch[2];
      const jsonContent = apiFormatMatch[3];

      try {
        const parsed = JSON.parse(jsonContent);
        setParsedJson(parsed as IndexDataType);
        setIndexName(indexNameFromApi);
      } catch (jsonError) {
        console.error("JSON 파싱 오류:", jsonError);
      }
    } else {
      try {
        const parsed = JSON.parse(input);
        setParsedJson(parsed as IndexDataType);

        setIndexName("");
      } catch (error) {
        console.error("일반 JSON 파싱 오류:", error);
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-sm py-4 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {safeT("app.title", t)}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </header>

        {/* 메인 컨텐츠 - 3단 구조 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 좌측: 매핑 사이드바 - 스크롤 개선 */}
          <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <MappingSidebar />
          </aside>

          {/* 중앙: 메인 콘텐츠 영역 - JSON 에디터 */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800">
                {safeT("editor.title", t)}
                {indexName && (
                  <span className="ml-2 text-gray-500 font-normal">
                    ({indexName})
                  </span>
                )}
              </h2>
            </div>

            {/* 에디터 영역 */}
            <EditorWithDropZone
              jsonValue={jsonValue}
              setJsonValue={setJsonValue}
              t={t}
            />
          </main>

          {/* 우측: 시각화 영역 */}
          <aside className="w-96 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800">
                {safeT("visualizer.title", t)}
              </h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <IndexVisualizer indexData={parsedJson} />
            </div>
          </aside>
        </div>
      </div>
    </DndProvider>
  );
}
