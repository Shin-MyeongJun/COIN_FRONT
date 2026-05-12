# Project Structure

Use a feature-based structure. Keep API logic, stream logic, charts, and page components separated.

## Recommended Tree

```text
coindata-web/
  public/

  src/
    app/
      App.tsx
      router.tsx
      providers/
        QueryProvider.tsx

    pages/
      DashboardPage.tsx
      MarketDetailPage.tsx
      EconomicTimelinePage.tsx

    features/
      dashboard/
        components/
          DashboardHeader.tsx
          MarketStatStrip.tsx
          StreamStatusPill.tsx

      premium/
        api/
          premiumApi.ts
          premiumTypes.ts
        components/
          PremiumFilterBar.tsx
          PremiumTable.tsx
          PremiumMetricCell.tsx
          PremiumSparkline.tsx
        model/
          premiumFilters.ts
          premiumMappers.ts
          premiumViewTypes.ts

      market/
        api/
          marketApi.ts
          marketTypes.ts
        components/
          MarketPairHeader.tsx
          PremiumSummaryStrip.tsx

      chart/
        components/
          CandlestickChart.tsx
          IndicatorOverlayControls.tsx
          TimelineMarkers.tsx
          ChartToolbar.tsx
        model/
          chartTypes.ts
          markerTypes.ts

      stream/
        api/
          sseClient.ts
          premiumStream.ts
          tickStream.ts
          candleStream.ts
          indicatorStream.ts
        model/
          streamTypes.ts
          streamStore.ts

      economic/
        api/
          economicApi.ts
          economicTypes.ts
        components/
          EconomicTimeline.tsx
          EconomicEventMarker.tsx

      news/
        api/
          newsApi.ts
          newsTypes.ts
        components/
          NewsTimeline.tsx
          NewsMarker.tsx

    shared/
      api/
        httpClient.ts
        queryKeys.ts
      config/
        env.ts
      ui/
        Badge.tsx
        Button.tsx
        Checkbox.tsx
        EmptyState.tsx
        Input.tsx
        Select.tsx
        Skeleton.tsx
        Table.tsx
      lib/
        formatNumber.ts
        formatPremium.ts
        formatPrice.ts
        formatTime.ts
      types/
        common.ts

    styles/
      globals.css
      tokens.css
```

## Naming Rules

- Pages: `*Page.tsx`
- API clients: `*Api.ts`
- API types: `*Types.ts`
- React components: `PascalCase.tsx`
- Formatters: `format*.ts`
- Feature state and mappers: `model/`
- Shared UI primitives: `shared/ui`

## Data Flow

REST data:

```text
REST API
  -> feature/api
  -> TanStack Query
  -> mapper/view model
  -> page/component
```

SSE data:

```text
SSE endpoint
  -> stream/api
  -> stream model/store
  -> table/chart live update
```

Chart data:

```text
market/premium/analytics API
  -> chart model
  -> CandlestickChart
  -> overlays and timeline markers
```

## Premium Model Rule

Do not use a single generic `premiumRate` field in UI-facing models if the value is ambiguous.

Prefer:

```ts
export type PremiumSide = "BUY" | "SELL";

export interface PremiumPairView {
  asset: string;
  domesticExchange: string;
  offshoreExchange: string;
  domesticBid: number;
  offshoreAsk: number;
  buyPremiumRate: number;
  domesticAsk: number;
  offshoreBid: number;
  sellPremiumRate: number;
  oneHourChangeRate: number;
  twentyFourHourChangeRate: number;
  volume: number;
  lastUpdatedAt: number;
}
```

Display labels:

```text
매수 프리미엄
매도 프리미엄
```

Short display:

```text
매수 +4.12%
매도 +3.86%
```

## Dashboard Layout Rule

The dashboard should be built around:

1. Search
2. Detailed filters
3. Sortable premium table
4. Chart preview/detail entry
5. Live stream state

Do not include:

- Premium heatmap
- Generic category tabs
- Marketing hero
- Decorative background effects

## Filter Model

Suggested filter shape:

```ts
export interface PremiumFilters {
  keyword: string;
  domesticExchange?: string;
  offshoreExchange?: string;
  quoteCurrency?: string;
  minBuyPremiumRate?: number;
  maxBuyPremiumRate?: number;
  minSellPremiumRate?: number;
  maxSellPremiumRate?: number;
  minVolume?: number;
  minFreshnessMs?: number;
  elevatedOnly: boolean;
}
```

## Timeline Marker Model

Economic and news events should share a common marker shape where possible.

```ts
export type TimelineMarkerType =
  | "ECONOMIC"
  | "NEWS"
  | "EXCHANGE"
  | "REGULATION"
  | "SYSTEM";

export interface TimelineMarker {
  id: string;
  timestamp: number;
  type: TimelineMarkerType;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  source?: string;
  url?: string;
}
```

Markers should be usable both in:

- chart overlays
- timeline panels

