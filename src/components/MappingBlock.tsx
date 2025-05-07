import React from "react";

type MappingBlockProps = {
  type: string;
  label?: string;
  color: string;
  properties?: Record<string, unknown>;
};

const MappingBlock: React.FC<MappingBlockProps> = ({
  type,
  color,
  properties = {},
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const dragData = {
      type,
      properties,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";

    const target = e.currentTarget;
    setTimeout(() => {
      target.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`p-3 rounded-lg border ${color} shadow-sm cursor-grab transition-all hover:shadow-md hover:-translate-y-0.5 active:shadow-inner`}
    >
      <div className="text-center">
        <div className="px-3 py-1 bg-white bg-opacity-50 rounded-md text-gray-700 font-mono font-medium">
          {type}
        </div>
      </div>
      {Object.keys(properties).length > 1 && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
          {Object.entries(properties)
            .filter(([key]) => key !== "type")
            .map(([key, value]) => (
              <div key={key} className="flex items-start">
                <span className="text-gray-500 font-mono mr-1">{key}:</span>
                {key === "relations" &&
                typeof value === "object" &&
                value !== null ? (
                  <div className="font-medium text-gray-700">
                    {Object.entries(value as Record<string, unknown>).map(
                      ([parent, children], idx) => (
                        <div key={idx} className="ml-1">
                          <span className="font-medium">{parent}</span>
                          <span className="mx-1">→</span>
                          <span>
                            {Array.isArray(children)
                              ? children.join(", ")
                              : String(children)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <span className="font-medium text-gray-700">
                    {String(value)}
                  </span>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MappingBlock;
