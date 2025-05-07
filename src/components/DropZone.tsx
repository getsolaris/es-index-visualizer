import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';

type MappingItem = {
  type: string;
  label: string;
  properties: Record<string, unknown>;
}

type DropZoneProps = {
  onDrop: (item: MappingItem) => void;
};

const DropZone: React.FC<DropZoneProps> = ({ onDrop }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'mappingBlock',
    drop: (item: MappingItem) => {
      onDrop(item);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  dropRef(elementRef);

  return (
    <div
      ref={elementRef}
      className={`h-full w-full flex flex-col items-center justify-center rounded-lg p-5 transition-all ${
        isOver 
          ? 'border-2 border-dashed border-blue-500 bg-blue-50' 
          : 'border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
      }`}
    >
      <div className={`text-center transition-transform ${isOver ? 'scale-105' : ''}`}>
        <div className="flex justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className={`w-10 h-10 ${isOver ? 'text-blue-500' : 'text-gray-400'}`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-base font-medium text-gray-700 mb-1">필드 매핑 블록을 여기에 드롭하세요</p>
        <p className="text-xs text-gray-500">
          좌측 사이드바에서 블록을 드래그하여 JSON에 필드를 추가할 수 있습니다
        </p>
      </div>
    </div>
  );
};

export default DropZone; 