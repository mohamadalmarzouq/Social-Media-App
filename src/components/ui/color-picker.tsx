'use client';

import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';

interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}

const PRESET_COLORS = [
  '#FF0000', '#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#9ACD32', '#32CD32',
  '#00FF00', '#00FA9A', '#00CED1', '#00BFFF', '#1E90FF', '#4169E1', '#8A2BE2', '#9370DB',
  '#FF69B4', '#FF1493', '#DC143C', '#B22222', '#8B0000', '#800000', '#2F4F4F', '#696969',
  '#000000', '#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#808080', '#C0C0C0', '#E6E6FA'
];

export function ColorPicker({ colors, onChange, maxColors = 10 }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState('');

  const addColor = (color: string) => {
    if (!colors.includes(color) && colors.length < maxColors) {
      onChange([...colors, color]);
    }
  };

  const removeColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    onChange(newColors);
  };

  const handleCustomColorAdd = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      addColor(customColor.toUpperCase());
      setCustomColor('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Color Input */}
      <div className="flex gap-3">
        <Input
          type="text"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          placeholder="Enter hex color (e.g., #FF5733)"
          className="flex-1"
          maxLength={7}
        />
        <Button 
          type="button" 
          onClick={handleCustomColorAdd}
          variant="outline"
          disabled={colors.length >= maxColors || !customColor}
          size="sm"
        >
          Add Color
        </Button>
      </div>

      {/* Preset Colors Grid */}
      <div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Or select from presets:</p>
        <div className="grid grid-cols-8 gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => addColor(color)}
              disabled={colors.includes(color) || colors.length >= maxColors}
              className={`w-10 h-10 rounded-2xl border-2 transition-all duration-200 ${
                colors.includes(color) 
                  ? 'border-neutral-400 opacity-50 cursor-not-allowed scale-90' 
                  : 'border-neutral-300 hover:border-primary-400 hover:scale-110 hover:shadow-lg'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Selected Colors */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Selected colors ({colors.length}/{maxColors}):
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200">
                <div 
                  className="w-8 h-8 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 shadow-inner" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-danger-500 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 ml-2 text-lg font-bold hover:scale-110 transition-transform duration-150"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
