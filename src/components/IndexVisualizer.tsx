"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  globalT,
  addTranslationChangeListener,
  isTranslationLoaded,
} from "./LanguageSwitcher";
import html2canvas from "html2canvas";

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

const SHARD_COLORS = [
  {
    primary: {
      bg: "bg-blue-100",
      border: "border-blue-300",
      text: "text-blue-800",
      hover: "hover:bg-blue-200",
    },
    replica: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      hover: "hover:bg-blue-100",
    },
  },
  {
    primary: {
      bg: "bg-emerald-100",
      border: "border-emerald-300",
      text: "text-emerald-800",
      hover: "hover:bg-emerald-200",
    },
    replica: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      hover: "hover:bg-emerald-100",
    },
  },
  {
    primary: {
      bg: "bg-purple-100",
      border: "border-purple-300",
      text: "text-purple-800",
      hover: "hover:bg-purple-200",
    },
    replica: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      hover: "hover:bg-purple-100",
    },
  },
  {
    primary: {
      bg: "bg-amber-100",
      border: "border-amber-300",
      text: "text-amber-800",
      hover: "hover:bg-amber-200",
    },
    replica: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      hover: "hover:bg-amber-100",
    },
  },
  {
    primary: {
      bg: "bg-rose-100",
      border: "border-rose-300",
      text: "text-rose-800",
      hover: "hover:bg-rose-200",
    },
    replica: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      hover: "hover:bg-rose-100",
    },
  },
];

const ANALYZER_COLORS = {
  bg: "bg-teal-100",
  border: "border-teal-300",
  text: "text-teal-800",
  hover: "hover:bg-teal-200",
};

const TOKENIZER_COLORS = {
  bg: "bg-teal-100",
  border: "border-teal-300",
  text: "text-teal-800",
  hover: "hover:bg-teal-200",
};

const FILTER_COLORS = {
  bg: "bg-orange-100",
  border: "border-orange-300",
  text: "text-orange-800",
  hover: "hover:bg-orange-200",
};

type ShardProps = {
  isPrimary: boolean;
  shardNumber: number;
  replicaNumber?: number;
};

const Shard: React.FC<ShardProps> = ({
  isPrimary,
  shardNumber,
  replicaNumber,
}) => {
  const colorIndex = (shardNumber - 1) % SHARD_COLORS.length;
  const colorSet = SHARD_COLORS[colorIndex];

  const colors = isPrimary ? colorSet.primary : colorSet.replica;

  return (
    <div
      className={`
        p-2 rounded-lg shadow-sm border text-center
        ${colors.bg} ${colors.border} ${colors.text}
        ${isPrimary ? "font-semibold" : ""}
        hover:shadow-md hover:-translate-y-0.5 transition-all
        ${colors.hover}
        h-12 flex items-center justify-center flex-col
      `}
    >
      {isPrimary ? (
        <div className="font-bold">{shardNumber}</div>
      ) : (
        <div className="font-mono text-sm">
          {shardNumber}.{replicaNumber}
        </div>
      )}
    </div>
  );
};

type FieldBlockProps = {
  fieldName: string;
  fieldType: string;
  analyzer?: string;
  relations?: Record<string, string[]>;
  fields?: Record<string, MappingFieldType>;
  path?: string;
  pathExists?: boolean;
  level: number;
  children?: React.ReactNode;
  isAlias?: boolean;
  onToggle?: () => void;
  t: TranslateFunction;
};

const FieldBlock = React.forwardRef<HTMLDivElement, FieldBlockProps>(
  (
    {
      fieldName,
      fieldType,
      analyzer,
      relations,
      fields,
      path,
      pathExists = true,
      level,
      children,
      isAlias,
      onToggle,
      t,
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const isCompound =
      fieldType === "nested" || fieldType === "object" || fieldType === "join";
    const isJoin = fieldType === "join";
    const hasMultiFields = fields && Object.keys(fields).length > 0;
    let borderColor = "border-cyan-300";

    if (fieldType === "nested") {
      borderColor = "border-purple-300";
    } else if (fieldType === "object") {
      borderColor = "border-blue-300";
    } else if (fieldType === "join") {
      borderColor = "border-pink-300";
    } else if (fieldType === "alias") {
      borderColor = "border-indigo-300";
    }

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);

      if (onToggle) {
        onToggle();
      }
    };

    return (
      <div style={{ marginLeft: `${level * 1}rem` }} ref={ref}>
        <div
          className={`p-3 my-2 rounded-lg border bg-white shadow-sm hover:shadow transition-all ${
            isAlias ? "border-indigo-300" : ""
          }`}
        >
          <div className="flex items-center flex-wrap gap-2">
            {isCompound && (
              <button
                onClick={handleToggle}
                className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isExpanded ? "▼" : "▶"}
              </button>
            )}
            <span className="font-medium text-gray-800">{fieldName}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                fieldType === "object"
                  ? "bg-blue-100 text-blue-800"
                  : fieldType === "nested"
                  ? "bg-purple-100 text-purple-800"
                  : fieldType === "join"
                  ? "bg-pink-100 text-pink-800"
                  : fieldType === "alias"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-gray-100 text-gray-800"
              } font-mono`}
            >
              {fieldType}
            </span>
            {analyzer && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-mono">
                analyzer: {analyzer}
              </span>
            )}
            {path && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  pathExists
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-red-100 text-red-800"
                } font-mono`}
              >
                path: {pathExists ? path : safeT("visualizer.notfound", t)}
              </span>
            )}
          </div>

          {isJoin && relations && isExpanded && (
            <div className="mt-2 pl-3 border-l-2 border-pink-200">
              <div className="text-sm font-medium text-pink-700 mb-1">
                relations:
              </div>
              {Object.entries(relations).map(([parent, children]) => (
                <div key={parent} className="ml-2 text-sm">
                  <span className="text-pink-800 font-medium">{parent}</span>
                  <span className="text-gray-500 mx-1">→</span>
                  <span className="text-pink-600">
                    {Array.isArray(children) ? children.join(", ") : children}
                  </span>
                </div>
              ))}
            </div>
          )}

          {hasMultiFields && isExpanded && (
            <div className="mt-2 pl-3 border-l-2 border-amber-200">
              <div className="text-sm font-medium text-amber-700 mb-1">
                fields:
              </div>
              <div className="space-y-1">
                {Object.entries(fields).map(([subFieldName, subField]) => (
                  <div
                    key={subFieldName}
                    className="ml-2 text-sm flex flex-wrap items-center gap-1"
                  >
                    <span className="text-amber-800 font-medium">
                      .{subFieldName}
                    </span>
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-mono">
                      {subField.type}
                    </span>
                    {subField.analyzer && (
                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-mono">
                        analyzer: {subField.analyzer}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isCompound && children && isExpanded && (
          <div className={`pl-4 border-l-2 ${borderColor} ml-2 mt-1`}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

FieldBlock.displayName = "FieldBlock";

type AnalyzerConfig = {
  type?: string;
  tokenizer?: string;
  filter?: string[] | string;
  [key: string]: unknown;
};

type TokenizerConfig = {
  type?: string;
  min_gram?: number;
  max_gram?: number;
  token_chars?: string[];
  [key: string]: unknown;
};

type FilterConfig = {
  type?: string;
  [key: string]: unknown;
};

type AnalyzerBlockProps = {
  name: string;
  config: AnalyzerConfig;
};

const AnalyzerBlock: React.FC<AnalyzerBlockProps> = ({ name, config }) => {
  return (
    <div
      className={`p-3 my-2 rounded-lg border ${ANALYZER_COLORS.bg} ${ANALYZER_COLORS.border} shadow-sm hover:shadow transition-all`}
    >
      <div className="flex items-center flex-wrap gap-2">
        <span className={`font-medium ${ANALYZER_COLORS.text}`}>{name}</span>
      </div>
      <div className="mt-2 text-sm grid grid-cols-1 gap-1">
        {config.type && (
          <div className="flex items-center">
            <span className="font-medium mr-2">type:</span>
            <span className="font-mono">{config.type}</span>
          </div>
        )}
        {config.tokenizer && (
          <div className="flex items-center">
            <span className="font-medium mr-2">tokenizer:</span>
            <span className="font-mono">{config.tokenizer}</span>
          </div>
        )}
        {config.filter && (
          <div className="flex items-start">
            <span className="font-medium mr-2">filter:</span>
            <span className="font-mono">
              {Array.isArray(config.filter)
                ? config.filter.join(", ")
                : String(config.filter)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

type TokenizerBlockProps = {
  name: string;
  config: TokenizerConfig;
};

const TokenizerBlock: React.FC<TokenizerBlockProps> = ({ name, config }) => {
  return (
    <div
      className={`p-3 my-2 rounded-lg border ${TOKENIZER_COLORS.bg} ${TOKENIZER_COLORS.border} shadow-sm hover:shadow transition-all`}
    >
      <div className="flex items-center flex-wrap gap-2">
        <span className={`font-medium ${TOKENIZER_COLORS.text}`}>{name}</span>
      </div>
      <div className="mt-2 text-sm grid grid-cols-1 gap-1">
        {config.type && (
          <div className="flex items-center">
            <span className="font-medium mr-2">type:</span>
            <span className="font-mono">{config.type}</span>
          </div>
        )}
        {config.min_gram && (
          <div className="flex items-center">
            <span className="font-medium mr-2">min_gram:</span>
            <span className="font-mono">{config.min_gram}</span>
          </div>
        )}
        {config.max_gram && (
          <div className="flex items-center">
            <span className="font-medium mr-2">max_gram:</span>
            <span className="font-mono">{config.max_gram}</span>
          </div>
        )}
        {config.token_chars && (
          <div className="flex items-start">
            <span className="font-medium mr-2">token_chars:</span>
            <span className="font-mono">
              {Array.isArray(config.token_chars)
                ? config.token_chars.join(", ")
                : String(config.token_chars)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

type FilterBlockProps = {
  name: string;
  config: FilterConfig;
};

const FilterBlock: React.FC<FilterBlockProps> = ({ name, config }) => {
  return (
    <div
      className={`p-3 my-2 rounded-lg border ${FILTER_COLORS.bg} ${FILTER_COLORS.border} shadow-sm hover:shadow transition-all`}
    >
      <div className="flex items-center flex-wrap gap-2">
        <span className={`font-medium ${FILTER_COLORS.text}`}>{name}</span>
      </div>
      <div className="mt-2 text-sm grid grid-cols-1 gap-1">
        {config.type && (
          <div className="flex items-center">
            <span className="font-medium mr-2">type:</span>
            <span className="font-mono">{config.type}</span>
          </div>
        )}
        {Object.entries(config)
          .filter(([key]) => key !== "type")
          .map(([key, value]) => (
            <div key={key} className="flex items-start">
              <span className="font-medium mr-2">{key}:</span>
              <span className="font-mono">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export type MappingFieldType = {
  type: string;
  analyzer?: string;
  relations?: Record<string, string[]>;
  fields?: Record<string, MappingFieldType>;
  properties?: Record<string, MappingFieldType>;
  path?: string;
  [key: string]: unknown;
};

export type IndexDataType = {
  settings?: {
    number_of_shards?: number;
    number_of_replicas?: number;
    analysis?: {
      analyzer?: Record<string, AnalyzerConfig>;
      tokenizer?: Record<string, TokenizerConfig>;
      filter?: Record<string, FilterConfig>;
    };
    [key: string]: unknown;
  };
  mappings?: {
    properties?: Record<string, MappingFieldType>;
    [key: string]: unknown;
  };
};

type IndexVisualizerProps = {
  indexData: IndexDataType;
};

function addGlobalStyle() {
  if (document.getElementById("alias-connection-style")) return;

  const style = document.createElement("style");
  style.id = "alias-connection-style";
  style.innerHTML = `
    .connection-line {
      position: absolute;
      background-color: #818cf8;
      z-index: 5;
      pointer-events: none;
    }
    .horizontal-line {
      height: 1px;
    }
    .vertical-line {
      width: 1px;
    }
    .alias-box {
      border-color: #818cf8 !important;
      background-color: #f5f5ff !important;
    }
    .target-box {
      background-color: #f0f7ff !important;
    }
  `;
  document.head.appendChild(style);
}

const IndexVisualizer: React.FC<IndexVisualizerProps> = ({ indexData }) => {
  const [t, setT] = useState<TranslateFunction>(() => globalT);
  const [showShards, setShowShards] = useState<boolean>(false);
  const [showFields, setShowFields] = useState<boolean>(true);
  const [showAnalyzers, setShowAnalyzers] = useState<boolean>(true);
  const [showTokenizers, setShowTokenizers] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [aliasConnections, setAliasConnections] = useState<
    { alias: string; target: string; valid: boolean }[]
  >([]);

  const fieldRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const numberOfShards = indexData.settings?.number_of_shards || 1;
  const numberOfReplicas = indexData.settings?.number_of_replicas || 1;

  const totalShards = numberOfShards * (1 + numberOfReplicas);

  useEffect(() => {
    if (indexData.mappings?.properties) {
      const connections: { alias: string; target: string; valid: boolean }[] =
        [];

      const findAliasConnections = (
        fields: Record<string, MappingFieldType>,
        prefix: string = ""
      ) => {
        Object.entries(fields).forEach(([fieldName, fieldData]) => {
          const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;

          if (fieldData.type === "alias" && fieldData.path) {
            const targetPath = fieldData.path.toString();
            const targetExists = findField(
              indexData.mappings?.properties || {},
              targetPath
            );

            connections.push({
              alias: fullPath,
              target: targetPath,
              valid: targetExists !== null,
            });
          }

          if (fieldData.properties) {
            findAliasConnections(fieldData.properties, fullPath);
          }
        });
      };

      const findField = (
        fields: Record<string, MappingFieldType>,
        path: string
      ): MappingFieldType | null => {
        const parts = path.split(".");
        let current = fields;

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!current[part]) {
            return null;
          }

          if (i === parts.length - 1) {
            return current[part];
          }

          if (current[part].properties) {
            current = current[part].properties;
          } else {
            return null;
          }
        }

        return null;
      };

      findAliasConnections(indexData.mappings.properties);
      setAliasConnections(connections);
    }
  }, [indexData.mappings?.properties]);

  const drawAliasConnections = () => {
    console.log("Drawing right bracket connection between fields");

    document
      .querySelectorAll(".connection-line, .simple-arrow")
      .forEach((el) => el.remove());

    document
      .querySelectorAll(".alias-box, .target-highlight, .target-box")
      .forEach((el) => {
        el.classList.remove("alias-box", "target-highlight", "target-box");
      });

    const fieldSection = document.getElementById("field-section");
    if (!fieldSection) {
      console.error("Field section not found");
      return;
    }

    if (window.getComputedStyle(fieldSection).position === "static") {
      fieldSection.style.position = "relative";
    }

    aliasConnections.forEach(({ alias, target, valid }) => {
      const aliasElement = fieldRefs.current[alias];

      if (!aliasElement) {
        console.warn(`Alias element not found: ${alias}`);
        return;
      }

      aliasElement.classList.add("alias-box");

      if (!valid) {
        console.warn(`Target field not found: ${target}`);
        return;
      }

      const targetElement = fieldRefs.current[target];
      if (!targetElement) {
        console.warn(`Target element not found: ${target}`);
        return;
      }

      targetElement.classList.add("target-box");

      try {
        const fieldRect = fieldSection.getBoundingClientRect();
        const aliasRect = aliasElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const aliasRightX =
          aliasRect.right - fieldRect.left + fieldSection.scrollLeft;
        const targetRightX =
          targetRect.right - fieldRect.left + fieldSection.scrollLeft;
        const aliasY =
          aliasRect.top +
          aliasRect.height / 2 -
          fieldRect.top +
          fieldSection.scrollTop;
        const targetY =
          targetRect.top +
          targetRect.height / 2 -
          fieldRect.top +
          fieldSection.scrollTop;

        const aliasHorizontalLine = document.createElement("div");
        aliasHorizontalLine.className = "connection-line horizontal-line";
        aliasHorizontalLine.style.left = `${aliasRightX}px`;
        aliasHorizontalLine.style.top = `${aliasY}px`;
        aliasHorizontalLine.style.width = `10px`;
        fieldSection.appendChild(aliasHorizontalLine);

        const targetHorizontalLine = document.createElement("div");
        targetHorizontalLine.className = "connection-line horizontal-line";
        targetHorizontalLine.style.left = `${targetRightX}px`;
        targetHorizontalLine.style.top = `${targetY}px`;
        targetHorizontalLine.style.width = `10px`;
        fieldSection.appendChild(targetHorizontalLine);

        const verticalLine = document.createElement("div");
        verticalLine.className = "connection-line vertical-line";
        verticalLine.style.left = `342px`;
        verticalLine.style.top = `${Math.min(aliasY, targetY)}px`;
        verticalLine.style.height = `${Math.abs(aliasY - targetY)}px`;
        fieldSection.appendChild(verticalLine);

        console.log(`Created ]-shaped connection: ${alias} -> ${target}`);
      } catch (error) {
        console.error(
          `Error creating connection: ${alias} -> ${target}`,
          error
        );
      }
    });
  };

  useEffect(() => {
    addGlobalStyle();
  }, []);

  useEffect(() => {
    if (showFields && aliasConnections.length > 0) {
      const timer = setTimeout(() => {
        drawAliasConnections();
      }, 800);

      const secondTimer = setTimeout(() => {
        drawAliasConnections();
      }, 1500);

      const handleResize = () => {
        drawAliasConnections();
      };

      window.addEventListener("resize", handleResize);

      const fieldSection = document.getElementById("field-section");
      if (fieldSection) {
        fieldSection.addEventListener("scroll", handleResize);
      }

      return () => {
        clearTimeout(timer);
        clearTimeout(secondTimer);
        window.removeEventListener("resize", handleResize);
        if (fieldSection) {
          fieldSection.removeEventListener("scroll", handleResize);
        }
      };
    }
  }, [showFields, aliasConnections]);

  useEffect(() => {
    const unsubscribe = addTranslationChangeListener(() => {
      setT(() => globalT);
    });

    return unsubscribe;
  }, []);

  const captureImage = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const originalDisplay = element.style.display;
      element.style.display = "block";

      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      element.style.display = originalDisplay;
    } catch (error) {
      console.error("Image capture error:", error);
      alert(safeT("visualizer.capture.error", t));
    }
  };

  const handleFieldToggle = () => {
    if (aliasConnections.length > 0) {
      setTimeout(() => {
        drawAliasConnections();
        console.log("Drawing alias connections after field toggle");
      }, 300);
    }
  };

  const renderNestedFields = (
    fields: Record<string, MappingFieldType>,
    level = 0,
    prefix = ""
  ) => {
    return Object.entries(fields).map(([fieldName, fieldData]) => {
      const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;

      const isAlias = fieldData.type === "alias";
      const path = isAlias ? fieldData.path?.toString() : undefined;
      const pathExists =
        isAlias && path
          ? aliasConnections.some(
              (conn) => conn.alias === fullPath && conn.valid
            )
          : true;

      if (fieldData.properties) {
        const fieldType = fieldData.type || "object";

        return (
          <FieldBlock
            key={fullPath}
            fieldName={fieldName}
            fieldType={fieldType}
            analyzer={fieldData.analyzer}
            relations={
              fieldData.type === "join" ? fieldData.relations : undefined
            }
            fields={fieldData.fields}
            path={path}
            pathExists={pathExists}
            level={level}
            ref={(el) => {
              fieldRefs.current[fullPath] = el;
            }}
            isAlias={fieldType === "alias"}
            onToggle={handleFieldToggle}
            t={t}
          >
            {renderNestedFields(fieldData.properties, level + 1, fullPath)}
          </FieldBlock>
        );
      }

      return (
        <FieldBlock
          key={fullPath}
          fieldName={fieldName}
          fieldType={fieldData.type || "unknown"}
          analyzer={fieldData.analyzer}
          relations={
            fieldData.type === "join" ? fieldData.relations : undefined
          }
          fields={fieldData.fields}
          path={path}
          pathExists={pathExists}
          level={level}
          ref={(el) => {
            fieldRefs.current[fullPath] = el;
          }}
          isAlias={fieldData.type === "alias"}
          onToggle={handleFieldToggle}
          t={t}
        />
      );
    });
  };

  const renderShardGroups = () => {
    return (
      <div>
        {/* 샤드 계산법 섹션 */}
        <div className="grid grid-cols-3 gap-2 mb-4 max-w-lg">
          <div>
            <div className="p-2 bg-blue-100 rounded-md">
              <span className="font-mono font-bold text-blue-700 text-sm">
                Primary
              </span>
            </div>
            <div className="p-2 bg-white rounded-md text-blue-800 text-sm mt-1">
              {numberOfShards}
              {safeT("visualizer.shardFormula.unit", t)}
            </div>
          </div>

          <div>
            <div className="p-2 bg-blue-100 rounded-md">
              <span className="font-mono font-bold text-blue-700 text-sm">
                Replica
              </span>
            </div>
            <div className="p-2 bg-white rounded-md text-blue-800 text-sm mt-1">
              {numberOfReplicas}
              {safeT("visualizer.shardFormula.unit", t)}
            </div>
          </div>

          <div>
            <div className="p-2 bg-blue-100 rounded-md">
              <span className="font-bold text-blue-700 text-sm">
                {safeT("visualizer.shardFormula.totalShards", t)}
              </span>
            </div>
            <div className="p-2 bg-white rounded-md text-blue-800 text-sm mt-1">
              {totalShards}
              {safeT("visualizer.shardFormula.unit", t)}
            </div>
          </div>
        </div>

        {/* 샤드 시각화 레이아웃 - Kibana 스타일 그리드 */}
        <div className="mb-4">
          <div className="font-medium text-gray-700 mb-1 text-sm">
            Primary Shards
          </div>
          <div
            className={`grid gap-2 mb-3 ${getGridColsClass(
              Math.min(numberOfShards, 5) + (numberOfShards > 5 ? 1 : 0)
            )}`}
          >
            {Array.from({ length: Math.min(numberOfShards, 5) }, (_, i) => (
              <Shard
                key={`primary-grid-${i + 1}`}
                isPrimary={true}
                shardNumber={i + 1}
              />
            ))}
            {numberOfShards > 5 && (
              <div className="p-2 rounded-lg shadow-sm border text-center bg-gray-100 border-gray-300 text-gray-700 h-12 flex items-center justify-center">
                <span className="font-bold">...</span>
              </div>
            )}
          </div>

          {numberOfReplicas > 0 && (
            <>
              <div className="font-medium text-gray-700 mb-1 text-sm">
                Replica Shards
              </div>
              <div
                className={`grid gap-2 ${getGridColsClass(
                  Math.min(numberOfShards, 5) + (numberOfShards > 5 ? 1 : 0)
                )}`}
              >
                {/* Replica를 행 단위로 표시 */}
                {Array.from({ length: numberOfReplicas }, (_, replicaIdx) => (
                  <>
                    {Array.from(
                      { length: Math.min(numberOfShards, 5) },
                      (_, primaryIdx) => (
                        <Shard
                          key={`replica-grid-${primaryIdx + 1}-${
                            replicaIdx + 1
                          }`}
                          isPrimary={false}
                          shardNumber={primaryIdx + 1}
                          replicaNumber={replicaIdx + 1}
                        />
                      )
                    )}

                    {/* 샤드가 6개 이상이면 각 Replica 행마다 ...을 표시 */}
                    {numberOfShards > 5 && (
                      <div className="p-2 rounded-lg shadow-sm border text-center bg-gray-100 border-gray-300 text-gray-700 h-12 flex items-center justify-center">
                        <span className="font-bold">...</span>
                      </div>
                    )}
                  </>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAnalyzers = () => {
    const analyzers = indexData.settings?.analysis?.analyzer;

    if (!analyzers || Object.keys(analyzers).length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          {safeT("visualizer.noMapping", t)}
        </div>
      );
    }

    return Object.entries(analyzers).map(([name, config]) => (
      <AnalyzerBlock key={`analyzer-${name}`} name={name} config={config} />
    ));
  };

  const renderTokenizers = () => {
    const tokenizers = indexData.settings?.analysis?.tokenizer;

    if (!tokenizers || Object.keys(tokenizers).length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          {safeT("visualizer.noMapping", t)}
        </div>
      );
    }

    return Object.entries(tokenizers).map(([name, config]) => (
      <TokenizerBlock key={`tokenizer-${name}`} name={name} config={config} />
    ));
  };

  const renderFilters = () => {
    const filters = indexData.settings?.analysis?.filter;

    if (!filters || Object.keys(filters).length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          {safeT("visualizer.noMapping", t)}
        </div>
      );
    }

    return Object.entries(filters).map(([name, config]) => (
      <FilterBlock key={`filter-${name}`} name={name} config={config} />
    ));
  };

  const getGridColsClass = (count: number) => {
    if (count >= 8) return "grid-cols-8";
    if (count >= 6) return "grid-cols-6";
    if (count >= 5) return "grid-cols-5";
    if (count >= 4) return "grid-cols-4";
    if (count >= 3) return "grid-cols-3";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-1";
  };

  return (
    <div className="space-y-8 pt-4 overflow-visible">
      {/* 샤드 구성 */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-black"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            <span>{safeT("visualizer.shardConfig", t)}</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                captureImage("shard-section", "shard-configuration")
              }
              className="text-blue-600 hover:text-blue-800 p-1"
              aria-label={safeT("visualizer.capture.button", t)}
              title={safeT("visualizer.capture.button", t)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowShards(!showShards)}
              className="text-blue-600 hover:text-blue-800"
              aria-label={showShards ? "접기" : "펼치기"}
            >
              {showShards ? "▼" : "▶"}
            </button>
          </div>
        </div>

        <div
          id="shard-section"
          className={`${showShards ? "block" : "hidden"} p-4`}
        >
          {renderShardGroups()}
        </div>
      </div>

      {/* 필드 구조 */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-black"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
                clipRule="evenodd"
              />
            </svg>
            <span>{safeT("visualizer.fieldStructure", t)}</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => captureImage("field-section", "field-structure")}
              className="text-blue-600 hover:text-blue-800 p-1"
              aria-label={safeT("visualizer.capture.button", t)}
              title={safeT("visualizer.capture.button", t)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowFields(!showFields)}
              className="text-blue-600 hover:text-blue-800"
              aria-label={showFields ? "접기" : "펼치기"}
            >
              {showFields ? "▼" : "▶"}
            </button>
          </div>
        </div>

        <div
          id="field-section"
          className={`${showFields ? "block" : "hidden"} p-4`}
        >
          {indexData.mappings?.properties &&
          Object.keys(indexData.mappings.properties).length > 0 ? (
            renderNestedFields(indexData.mappings.properties)
          ) : (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200 my-2">
              {safeT("visualizer.noMapping", t)}
            </div>
          )}
        </div>
      </div>

      {/* 분석기 설정 (설정이 있는 경우에만 표시) */}
      {indexData.settings?.analysis?.analyzer &&
        Object.keys(indexData.settings.analysis.analyzer).length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-black"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Analyzer</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => captureImage("analyzer-section", "analyzers")}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  aria-label={safeT("visualizer.capture.button", t)}
                  title={safeT("visualizer.capture.button", t)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowAnalyzers(!showAnalyzers)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={showAnalyzers ? "접기" : "펼치기"}
                >
                  {showAnalyzers ? "▼" : "▶"}
                </button>
              </div>
            </div>

            <div
              id="analyzer-section"
              className={`${showAnalyzers ? "block" : "hidden"} p-4`}
            >
              {renderAnalyzers()}
            </div>
          </div>
        )}

      {/* 토크나이저 설정 (설정이 있는 경우에만 표시) */}
      {indexData.settings?.analysis?.tokenizer &&
        Object.keys(indexData.settings.analysis.tokenizer).length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-black"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Tokenizer</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    captureImage("tokenizer-section", "tokenizers")
                  }
                  className="text-blue-600 hover:text-blue-800 p-1"
                  aria-label={safeT("visualizer.capture.button", t)}
                  title={safeT("visualizer.capture.button", t)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowTokenizers(!showTokenizers)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={showTokenizers ? "접기" : "펼치기"}
                >
                  {showTokenizers ? "▼" : "▶"}
                </button>
              </div>
            </div>

            <div
              id="tokenizer-section"
              className={`${showTokenizers ? "block" : "hidden"} p-4`}
            >
              {renderTokenizers()}
            </div>
          </div>
        )}

      {/* 필터 설정 (설정이 있는 경우에만 표시) */}
      {indexData.settings?.analysis?.filter &&
        Object.keys(indexData.settings.analysis.filter).length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-black"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Filter</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => captureImage("filter-section", "filters")}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  aria-label={safeT("visualizer.capture.button", t)}
                  title={safeT("visualizer.capture.button", t)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={showFilters ? "접기" : "펼치기"}
                >
                  {showFilters ? "▼" : "▶"}
                </button>
              </div>
            </div>

            <div
              id="filter-section"
              className={`${showFilters ? "block" : "hidden"} p-4`}
            >
              {renderFilters()}
            </div>
          </div>
        )}
    </div>
  );
};

export default IndexVisualizer;
