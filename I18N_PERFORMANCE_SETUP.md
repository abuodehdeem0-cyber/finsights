# FinSight Arabic (RTL) & Performance Optimization Setup

## ✅ Completed Implementations

### 1. Internationalization (i18n) Setup

**Files Created:**
- `src/i18n/config.ts` - Locale configuration (EN/AR)
- `src/i18n/request.ts` - Next-intl request handler
- `src/i18n/routing.ts` - Routing utilities with locale support
- `src/middleware.ts` - Locale detection and routing middleware

**Translation Files:**
- `messages/en.json` - Complete English translations
- `messages/ar.json` - Complete Arabic translations

**Supported Locales:**
- 🇺🇸 English (en) - LTR
- 🇸🇦 Arabic (ar) - RTL

### 2. RTL (Right-to-Left) Support

**Components Created:**
- `src/lib/language-context.tsx` - Language context provider with RTL detection
- `src/components/language-switcher.tsx` - Language toggle component
- Updated `src/components/navigation.tsx` - Added language switcher with translations

**Features:**
- Automatic RTL layout switching when Arabic is selected
- Tajawal & Cairo Arabic fonts loaded dynamically
- CSS mirroring for all layout elements
- Space reversal for RTL mode

### 3. Performance Optimization (SWR)

**Files Created:**
- `src/lib/swr-hooks.ts` - Data fetching hooks with caching
- `src/components/swr-provider.tsx` - SWR configuration provider
- `src/lib/format-utils.ts` - Locale-aware number/date formatting

**SWR Hooks Available:**
- `useMarketQuote(symbol)` - Cached stock quotes (30s refresh)
- `useMarketOverview()` - Market overview data (60s refresh)
- `useHistoricalData(symbol, timeframe)` - Historical chart data
- `useStockSearch(query)` - Debounced search (1s)
- `usePortfolio()` - Portfolio positions (30s refresh)
- `useSectorData(sectorId)` - Sector data (60s refresh)
- `useStockAnalysis(symbol)` - AI analysis with caching
- `useMultipleQuotes(symbols[])` - Batch quote fetching

**Caching Strategy:**
- Automatic deduplication (5s interval)
- Background revalidation on focus
- 30-60 second refresh intervals for live data
- 1-minute cache for historical/analysis data
- Error retry with exponential backoff

### 4. Updated Dependencies

**Added to package.json:**
```json
{
  "dependencies": {
    "next-intl": "^3.5.0",
    "swr": "^2.2.0"
  },
  "devDependencies": {
    "tailwindcss-rtl": "^0.9.0"
  }
}
```

### 5. RTL CSS Support

**Added to globals.css:**
- RTL font family (Tajawal, Cairo)
- Space reversal utilities
- Text alignment flipping
- Margin/padding mirroring
- Border radius adjustments

### 6. Locale-Based Routing Structure

**Created [locale] folder structure:**
```
src/app/[locale]/
├── layout.tsx          # Locale-aware layout
├── page.tsx            # Dashboard
├── analysis/
│   └── page.tsx
├── login/
│   └── page.tsx
├── portfolio/
│   └── page.tsx
├── register/
│   └── page.tsx
├── sectors/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd C:\Users\abuod\CascadeProjects\finsight
npm install
```

### 2. Update Next.js Config

Create/Update `next.config.js`:

```javascript
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
};

module.exports = withNextIntl(nextConfig);
```

### 3. Run Development Server

```bash
npm run dev
```

## 🌐 Using the Language Toggle

The language switcher is located in the navbar (near the user profile):

1. Click the globe icon with flag (🇺🇸/🇸🇦)
2. Select English or Arabic
3. The entire UI will:
   - Flip to RTL (for Arabic)
   - Load Arabic fonts (Tajawal/Cairo)
   - Translate all text
   - Format numbers/currency for locale
   - Persist preference in localStorage

## 📊 Performance Benefits

### Before (Lag Issues):
- Each page navigation = fresh API calls
- No caching between page switches
- Charts re-rendered unnecessarily
- Multiple duplicate requests

### After (Optimized):
- SWR caching prevents duplicate requests
- Data persists between page navigations
- Automatic background refresh
- Stale-while-revalidate pattern
- 30-60 second refresh intervals

## 📝 Translation Usage

### In Components:

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations();
  
  return (
    <h1>{t('navigation.dashboard')}</h1>
    <p>{t('dashboard.totalValue')}</p>
  );
}
```

### Available Translation Keys:

**Navigation:**
- `navigation.dashboard` - لوحة التحكم
- `navigation.analysis` - التحليل
- `navigation.portfolio` - المحفظة
- `navigation.sectorHub` - القطاعات
- `navigation.login` - تسجيل الدخول
- `navigation.register` - إنشاء حساب

**Dashboard:**
- `dashboard.marketIndices`
- `dashboard.marketPerformance`
- `dashboard.topMovers`
- `dashboard.portfolioSummary`

**Portfolio:**
- `portfolio.totalValue`
- `portfolio.totalPL`
- `portfolio.dayPL`
- `portfolio.addPosition`

## 🔧 Using SWR Hooks

```tsx
import { useMarketQuote, usePortfolio } from '@/lib/swr-hooks';

function StockCard({ symbol }: { symbol: string }) {
  const { quote, isLoading, isError } = useMarketQuote(symbol);
  const { portfolio, isLoading: portfolioLoading } = usePortfolio();
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;
  
  return (
    <div>
      <h2>{quote.symbol}</h2>
      <p>${quote.price}</p>
    </div>
  );
}
```

## 🎨 RTL-Aware Formatting

```tsx
import { useFormatter } from '@/lib/format-utils';

function PriceDisplay({ value, currency }: { value: number; currency: string }) {
  const { currency: formatCurrency, locale } = useFormatter();
  
  // Automatically formats based on locale (EN/AR)
  return <span>{formatCurrency(value, currency)}</span>;
  // EN: $1,234.56
  // AR: ١٬٢٣٤٫٥٦ ر.س
}
```

## 🔍 File Structure Summary

```
src/
├── i18n/
│   ├── config.ts
│   ├── request.ts
│   └── routing.ts
├── lib/
│   ├── language-context.tsx
│   ├── swr-hooks.ts
│   └── format-utils.ts
├── components/
│   ├── language-switcher.tsx
│   ├── swr-provider.tsx
│   └── navigation.tsx (updated)
├── app/
│   ├── [locale]/           # Locale-based routing
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── analysis/
│   │   ├── login/
│   │   ├── portfolio/
│   │   ├── register/
│   │   └── sectors/
│   ├── layout.tsx          # Root layout (updated)
│   └── globals.css         # RTL styles added
├── middleware.ts
└── messages/
    ├── en.json
    └── ar.json
```

## ⚠️ Notes

1. **Dependencies Not Yet Installed**: Run `npm install` to install `next-intl`, `swr`, and `tailwindcss-rtl`

2. **Build Errors Expected**: Until dependencies are installed, you'll see TypeScript errors about missing modules

3. **next.config.js Update Required**: Add the next-intl plugin wrapper as shown above

4. **Font Loading**: Arabic fonts (Tajawal, Cairo) load automatically when switching to Arabic

5. **Currency in Arabic Mode**: When in Arabic mode, prices show SAR (ر.س) with localized number formatting

## ✅ Testing Checklist

- [ ] Click language toggle in navbar
- [ ] Verify RTL layout in Arabic mode
- [ ] Check Arabic fonts are applied
- [ ] Verify translations appear correctly
- [ ] Test SAR currency formatting in AR mode
- [ ] Navigate between pages - verify no loading delays
- [ ] Check network tab - verify SWR caching works
- [ ] Refresh page - verify locale preference persists

---

**Ready to run:**
```bash
npm install
npm run dev
```

Visit `http://localhost:3000/en` or `http://localhost:3000/ar`
