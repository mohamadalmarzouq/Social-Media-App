'use client';

import { useState } from 'react';
import { Button } from './button';

interface FontPickerProps {
  fonts: string[];
  onChange: (fonts: string[]) => void;
  maxFonts?: number;
}

const PRESET_FONTS = [
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { name: 'Times New Roman', family: 'Times New Roman, serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { name: 'Tahoma', family: 'Tahoma, Geneva, sans-serif' },
  { name: 'Trebuchet MS', family: 'Trebuchet MS, sans-serif' },
  { name: 'Impact', family: 'Impact, Charcoal, sans-serif' },
  { name: 'Comic Sans MS', family: 'Comic Sans MS, cursive' },
  { name: 'Courier New', family: 'Courier New, monospace' },
  { name: 'Lucida Console', family: 'Lucida Console, Monaco, monospace' },
  { name: 'Palatino', family: 'Palatino, serif' },
  { name: 'Garamond', family: 'Garamond, serif' },
  { name: 'Bookman', family: 'Bookman, serif' },
  { name: 'Avant Garde', family: 'Avant Garde, sans-serif' },
  { name: 'Futura', family: 'Futura, sans-serif' },
  { name: 'Century Gothic', family: 'Century Gothic, sans-serif' },
  { name: 'Baskerville', family: 'Baskerville, serif' },
  { name: 'Bodoni', family: 'Bodoni, serif' },
  { name: 'Didot', family: 'Didot, serif' },
  { name: 'Optima', family: 'Optima, sans-serif' },
  { name: 'Gill Sans', family: 'Gill Sans, sans-serif' },
  { name: 'Frutiger', family: 'Frutiger, sans-serif' },
  { name: 'Univers', family: 'Univers, sans-serif' },
  { name: 'Futura', family: 'Futura, sans-serif' }
];

export function FontPicker({ fonts, onChange, maxFonts = 5 }: FontPickerProps) {
  const [customFont, setCustomFont] = useState('');

  const addFont = (fontName: string) => {
    if (!fonts.includes(fontName) && fonts.length < maxFonts) {
      onChange([...fonts, fontName]);
    }
  };

  const removeFont = (index: number) => {
    const newFonts = fonts.filter((_, i) => i !== index);
    onChange(newFonts);
  };

  const handleCustomFontAdd = () => {
    if (customFont.trim() && !fonts.includes(customFont.trim())) {
      addFont(customFont.trim());
      setCustomFont('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Custom Font Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customFont}
          onChange={(e) => setCustomFont(e.target.value)}
          placeholder="Enter custom font name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={50}
        />
        <Button 
          type="button" 
          onClick={handleCustomFontAdd}
          variant="outline"
          disabled={fonts.length >= maxFonts || !customFont.trim()}
        >
          Add
        </Button>
      </div>

      {/* Preset Fonts Grid */}
      <div>
        <p className="text-sm text-gray-600 mb-3">Or select from popular fonts:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {PRESET_FONTS.map((font) => (
            <button
              key={font.name}
              type="button"
              onClick={() => addFont(font.name)}
              disabled={fonts.includes(font.name) || fonts.length >= maxFonts}
              className={`p-3 border rounded-lg text-left transition-all ${
                fonts.includes(font.name) 
                  ? 'border-gray-400 bg-gray-100 opacity-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div 
                className="text-lg font-medium mb-1"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </div>
              <div 
                className="text-sm text-gray-600"
                style={{ fontFamily: font.family }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Fonts */}
      {fonts.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Selected fonts ({fonts.length}/{maxFonts}):</p>
          <div className="space-y-2">
            {fonts.map((font, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{font}</span>
                  <span className="text-xs text-gray-500">({font})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFont(index)}
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
