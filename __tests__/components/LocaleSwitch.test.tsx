import { render, screen, fireEvent } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import { LocaleSwitch } from '@/components/features/LocaleSwitch';

// Mock functions need to be defined before the vi.mock calls
const mockReplace = vi.fn();
const mockUsePathname = vi.fn();
const mockUseRouter = vi.fn(() => ({
  replace: mockReplace,
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

// Mock next-intl/navigation
vi.mock('@/i18n/routing', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}));

// Import mocked functions for setup
import { useLocale, useTranslations } from 'next-intl';

describe('LocaleSwitch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('English locale (en)', () => {
    beforeEach(() => {
      (useLocale as Mock).mockReturnValue('en');
      (useTranslations as Mock).mockReturnValue((key: string) => {
        const translations: Record<string, string> = {
          switchLocale: 'Switch language',
          english: 'English',
          chinese: '简体中文',
        };
        return translations[key];
      });
    });

    test('should display "EN" when locale is English', () => {
      render(<LocaleSwitch />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    test('should have correct aria-label', () => {
      render(<LocaleSwitch />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch language');
    });

    test('should have correct title', () => {
      render(<LocaleSwitch />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'English');
    });

    test('should switch to Chinese when clicked', () => {
      render(<LocaleSwitch />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockReplace).toHaveBeenCalledWith('/', { locale: 'zh' });
    });
  });

  describe('Chinese locale (zh)', () => {
    beforeEach(() => {
      (useLocale as Mock).mockReturnValue('zh');
      (useTranslations as Mock).mockReturnValue((key: string) => {
        const translations: Record<string, string> = {
          switchLocale: '切换语言',
          english: 'English',
          chinese: '简体中文',
        };
        return translations[key];
      });
    });

    test('should display "中" when locale is Chinese', () => {
      render(<LocaleSwitch />);
      expect(screen.getByText('中')).toBeInTheDocument();
    });

    test('should have correct aria-label in Chinese', () => {
      render(<LocaleSwitch />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '切换语言');
    });

    test('should have correct title in Chinese', () => {
      render(<LocaleSwitch />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', '简体中文');
    });

    test('should switch to English when clicked', () => {
      render(<LocaleSwitch />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockReplace).toHaveBeenCalledWith('/', { locale: 'en' });
    });
  });

  describe('Pathname preservation', () => {
    beforeEach(() => {
      (useLocale as Mock).mockReturnValue('en');
      (useTranslations as Mock).mockReturnValue((key: string) => key);
    });

    test('should preserve current pathname when switching locale', () => {
      mockUsePathname.mockReturnValue('/games');

      render(<LocaleSwitch />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockReplace).toHaveBeenCalledWith('/games', { locale: 'zh' });
    });

    test('should preserve nested paths when switching locale', () => {
      mockUsePathname.mockReturnValue('/games/wittle-defender');

      render(<LocaleSwitch />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockReplace).toHaveBeenCalledWith(
        '/games/wittle-defender',
        { locale: 'zh' }
      );
    });
  });
});
