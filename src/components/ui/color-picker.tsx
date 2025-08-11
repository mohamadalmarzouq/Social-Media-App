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
    <div className="space-y-4">
      {/* Custom Color Input */}
      <div className="flex gap-2">
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
        >
          Add
        </Button>
      </div>

      {/* Preset Colors Grid */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Or select from presets:</p>
        <div className="grid grid-cols-8 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => addColor(color)}
              disabled={colors.includes(color) || colors.length >= maxColors}
              className={`w-8 h-8 rounded border-2 transition-all ${
                colors.includes(color) 
                  ? 'border-gray-400 opacity-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-gray-500 hover:scale-110'
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
          <p className="text-sm text-gray-600 mb-2">Selected colors ({colors.length}/{maxColors}):</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <div 
                  className="w-6 h-6 rounded border border-gray-300" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-mono text-gray-700">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-red-500 hover:text-red-700 ml-2 text-lg font-bold"
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
