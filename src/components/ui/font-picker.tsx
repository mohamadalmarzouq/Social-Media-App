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
    <div className="space-y-6">
      {/* Custom Font Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={customFont}
          onChange={(e) => setCustomFont(e.target.value)}
          placeholder="Enter custom font name"
          className="flex-1 h-11 px-4 py-3 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
          maxLength={50}
        />
        <Button 
          type="button" 
          onClick={handleCustomFontAdd}
          variant="outline"
          disabled={fonts.length >= maxFonts || !customFont.trim()}
          size="sm"
        >
          Add Font
        </Button>
      </div>

      {/* Preset Fonts Grid */}
      <div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Or select from popular fonts:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
          {PRESET_FONTS.map((font) => (
            <button
              key={font.name}
              type="button"
              onClick={() => addFont(font.name)}
              disabled={fonts.includes(font.name) || fonts.length >= maxFonts}
              className={`p-4 border-2 rounded-2xl text-left transition-all duration-200 ${
                fonts.includes(font.name) 
                  ? 'border-neutral-400 bg-neutral-100 dark:bg-neutral-800 opacity-50 cursor-not-allowed scale-95' 
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:shadow-md hover:scale-105'
              }`}
            >
              <div 
                className="text-lg font-semibold mb-2 text-neutral-900 dark:text-neutral-100"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </div>
              <div 
                className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed"
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
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Selected fonts ({fonts.length}/{maxFonts}):
          </p>
          <div className="space-y-3">
            {fonts.map((font, index) => (
              <div key={index} className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{font}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">({font})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFont(index)}
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
