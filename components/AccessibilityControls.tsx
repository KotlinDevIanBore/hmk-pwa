'use client';

import React from 'react';
import { useAccessibility, type FontSize } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Type, Contrast } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function AccessibilityControls() {
  const { fontSize, setFontSize, highContrast, setHighContrast, announceMessage } =
    useAccessibility();
  const t = useTranslations('accessibility');

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    announceMessage(t('fontSizeChanged', { size: t(`fontSize.${size}`) }));
  };

  const handleContrastToggle = (checked: boolean) => {
    setHighContrast(checked);
    announceMessage(
      checked ? t('highContrastEnabled') : t('highContrastDisabled')
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('accessibilitySettings')}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t('accessibilitySettings')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('accessibilitySettings')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Font Size Control */}
        <div className="px-2 py-2">
          <Label className="text-sm font-medium flex items-center gap-2 mb-2">
            <Type className="h-4 w-4" />
            {t('fontSize.label')}
          </Label>
          <div className="flex flex-col gap-1">
            <Button
              variant={fontSize === 'normal' ? 'default' : 'ghost'}
              size="sm"
              className="justify-start"
              onClick={() => handleFontSizeChange('normal')}
              aria-pressed={fontSize === 'normal'}
            >
              {t('fontSize.normal')}
            </Button>
            <Button
              variant={fontSize === 'large' ? 'default' : 'ghost'}
              size="sm"
              className="justify-start"
              onClick={() => handleFontSizeChange('large')}
              aria-pressed={fontSize === 'large'}
            >
              {t('fontSize.large')}
            </Button>
            <Button
              variant={fontSize === 'xlarge' ? 'default' : 'ghost'}
              size="sm"
              className="justify-start"
              onClick={() => handleFontSizeChange('xlarge')}
              aria-pressed={fontSize === 'xlarge'}
            >
              {t('fontSize.xlarge')}
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* High Contrast Toggle */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="high-contrast"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Contrast className="h-4 w-4" />
              {t('highContrast')}
            </Label>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={handleContrastToggle}
              aria-label={t('highContrast')}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


