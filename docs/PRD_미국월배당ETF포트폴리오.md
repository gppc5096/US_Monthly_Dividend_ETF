# 미국 월배당 ETF 포트폴리오 웹앱 — 개발계획서 (PRD)

- **제품명**: US Monthly Dividend ETF
- **앱 명칭(한글)**: 미국 월배당 ETF
- **문서 버전**: v1.1
- **작성일**: 2026-08-05
- **저장소**: https://github.com/gppc5096/US_Monthly_Dividend_ETF.git
- **Firebase 프로젝트 번호**: 587298984700

---

## 1. 제품 개요

### 1.1 한 줄 정의
투자 원금과 목표 월 수령액을 입력하면, 미국 월배당 ETF 10종을 조합해 **국가별 통화 기준 세후 현금흐름 테이블**을 즉시 계산해 주는 은퇴 설계 계산기.

### 1.2 해결하는 문제
월배당 ETF로 생활비를 만들려는 투자자는 다음 계산을 매번 수기로 해야 한다.

1. 종목별 배당률이 달라 조합에 따라 결과가 크게 달라진다.
2. 미국 원천징수 15%와 거주국 세금이 이중으로 걸린다.
3. 해외 거주 시 현지 통화로 얼마가 들어오는지 환율을 다시 계산해야 한다.
4. "목표 월 300만원"을 만들려면 원금이 얼마나 필요한지 역산이 어렵다.

이 앱은 위 4개를 하나의 흐름에서 처리한다.

### 1.3 목표 (Goals)
- G1. 6단계 이내 입력(모드 선택 → 투자금 → 목표수령액 → 국가/통화 → 세율·환율 → 배분방식[자동 슬라이더|수동 선택])으로 결과 테이블 도출 — 세부 순서는 §7.2 확정 플로우와 반드시 일치시킨다.
- G2. 자동(알고리즘 배분) / 수동(직접 선택) 두 모드 모두 지원
- G3. 최대 3개 통화 동시 표기 (한국 원화·미국 달러 고정 + 1개국 선택)
- G4. 목표 달성 불가 시에도 "최대 가능액 + 필요 원금 역산"을 제시해 빈손으로 끝내지 않음
- G5. 결과 시나리오를 제목과 함께 저장·삭제 (로그인 화면 없이)
- G6. 모바일 우선 UI, 사후 리팩토링이 필요 없는 계층 분리 코드

### 1.4 비목표 (Non-Goals) — v1에서 하지 않는 것
- 실제 매매 주문 연동, 증권사 계좌 연결
- 개인 맞춤 투자 자문 및 세무 자문 (계산기이며 참고 도구임)
- 백테스팅, 과거 성과 차트, NAV 변동 시뮬레이션
- 다국어 지원 (v1은 한국어 전용)
- ETF 종목 사용자 추가 (v1은 지정된 10종 고정)

### 1.5 사용자
| 구분 | 설명 |
|---|---|
| 주 사용자 | 배당 현금흐름 기반 은퇴/해외거주를 설계하는 개인 투자자 |
| 사용 기기 | 스마트폰(주) + PC(보조) |
| 사용 빈도 | 조건을 바꿔가며 반복 시뮬레이션, 마음에 드는 결과만 저장 |

---

## 2. 인터뷰 확정 사항 (설계 근거)

| # | 항목 | 확정 |
|---|---|---|
| 1 | 시세·배당률 데이터 | 외부 시세 API 실시간 연동 (+ Firestore 캐시 + 정적 폴백) |
| 2 | 자동 선정 로직 | 알고리즘이 배분 계산 → Claude는 총평 문장만 작성 |
| 3 | 과세 방식 | 미국 원천징수 15% + 거주국 세율 분리 계산 |
| 4 | 프레임워크·배포 | Next.js 16 (App Router) + Firebase App Hosting |
| 5 | 인증 | 로그인 화면 없음, Firebase 익명 인증 자동 처리 |
| 6 | 저장 | Firestore에 시나리오(제목+결과+총평) 저장/삭제 |
| 7 | 자동 배분 기준 | 3그룹 분산, **채권 비중은 사용자 슬라이더로 직접 조절** |
| 8 | 환율 | API 자동 조회 + 사용자 수동 수정 허용 |

---

## 3. 대상 ETF 마스터 데이터

정적 정의(종목코드·이름·그룹·과세유형)는 코드 상수로 고정하고, **배당률·주가는 API로 갱신**한다.

| 그룹 | 티커 | 명칭 | 기준 배당률(폴백값) | 과세유형 |
|---|---|---|---|---|
| S&P 500 | SPYI | NEOS S&P 500 High Income ETF | 11% | 배당 |
| S&P 500 | JEPI | JPMorgan Equity Premium Income ETF | 7% | 배당 |
| S&P 500 | XYLD | Global X S&P 500 Covered Call ETF | 9% | 배당 |
| S&P 500 | IVVW | iShares S&P 500 Top 20 Covered Call ETF | 10% | 배당 |
| 나스닥100 | QQQI | NEOS Nasdaq-100 High Income ETF | 14% | 배당 |
| 나스닥100 | JEPQ | JPMorgan Nasdaq Equity Premium Income ETF | 9% | 배당 |
| 나스닥100 | QYLD | Global X Nasdaq 100 Covered Call ETF | 11% | 배당 |
| 나스닥100 | QNTA | iShares Nasdaq 100 High Income ETF | 11% | 배당 |
| 채권 | TLTW | iShares 20+ Year Treasury BuyWrite ETF | 13% | 배당 |
| 채권 | SGOV | iShares 0-3 Month Treasury Bond ETF | 4% | 이자성(원천징수 예외 플래그) |

> **중요**: 표의 배당률은 문서 작성 시점 참고값이며 폴백 전용이다. 화면에는 항상 API 조회 시각(`asOf`)을 함께 노출한다. SGOV 등 국채형 상품은 미국 원천징수 취급이 배당과 다를 수 있어 `withholdingExempt` 플래그로 분기 처리한다.

---

## 4. 기술 스택 및 아키텍처

### 4.1 스택
| 레이어 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) | Route Handler로 서버 로직 내장. Firebase App Hosting은 16.2+를 stable Deployment Adapter 기준선으로 채택 |
| 언어 | TypeScript (strict) | `any` 금지 |
| 스타일 | Tailwind CSS + ShadCN UI | Dialog / Sonner(Toast) / Slider / Table 등 |
| 상태관리 | Zustand | 위저드 입력 상태 단일 스토어 |
| 폼 검증 | React Hook Form + Zod | 스키마 1곳에서 타입 파생 |
| 차트 | Recharts | 배분 도넛 차트 |
| 백엔드 | Firebase Firestore | 시나리오 저장, 시세 캐시 |
| 인증 | Firebase Anonymous Auth | 로그인 화면 없음 |
| 배포 | Firebase App Hosting | SSR 지원 |
| 시세 API | FMP 또는 Finnhub | 서버에서만 호출 |
| 환율 API | exchangerate.host 등 | 서버에서만 호출 |
| AI 총평 | Anthropic API (claude-sonnet-5) | 서버 Route — 구현 시점에 최신 모델 ID로 재확인 |

### 4.2 데이터 3단 계층 (핵심 아키텍처)

```
[클라이언트] --(fetch)--> [/api/quotes] --> ① Firestore 캐시 확인 (24h 이내면 즉시 반환)
                                          --> ② 만료 시 외부 시세 API 호출 → Firestore 갱신
                                          --> ③ API 실패 시 코드 내 정적 폴백값 반환 (isFallback: true)
```

- API 키는 **서버 환경변수에만** 존재하며 클라이언트 번들에 절대 포함하지 않는다.
- 10개 종목을 1일 1회만 실제 호출하므로 무료 티어 한도 내에서 운영 가능하다.
- 폴백이 사용된 경우 UI에 "실시간 시세 연결 실패 — 참고값으로 계산됨" 배지를 표시한다.

### 4.3 AI 총평 분리 원칙
계산은 순수 함수가 전담하고, Claude는 **완성된 계산 결과를 입력받아 문장만 생성**한다.
→ AI 응답이 실패해도 결과 테이블은 정상 표시된다(총평 영역만 "총평 생성 실패, 다시 시도" 버튼 노출).

---

## 5. 디렉토리 구조 (파일 분리 계획)

> 요구사항: "한 파일에 로직을 몰아넣지 않고, 완료 후 리팩토링이 불필요한 상태"
> → **역할별 계층 분리**를 처음부터 강제한다: `data`(순수 상수) / `calc`(순수 계산 함수) / `market`·`firebase`·`ai`(외부 I/O) / `schema`·`types`·`format`(스키마·타입·포맷 유틸) / `components`·`hooks`·`store`(UI). 정확한 하위 폴더 구성은 아래 트리를 기준으로 한다. 위저드 단계 파일(`wizard/Step*.tsx`)의 번호는 §7.2 확정 플로우의 [0]~[5A/5B]와 동일하게 맞춘다.

```
src/
├── app/
│   ├── layout.tsx                     # 루트 레이아웃, Toaster 마운트
│   ├── page.tsx                       # 메인 — WizardShell만 렌더 (로직 없음)
│   ├── saved/page.tsx                 # 저장 시나리오 목록
│   └── api/
│       ├── quotes/route.ts            # 시세·배당률 (캐시 경유)
│       ├── fx/route.ts                # 환율
│       └── commentary/route.ts        # Claude 총평 생성
│
├── components/
│   ├── ui/                            # ShadCN 생성물 (수정 최소화)
│   ├── wizard/
│   │   ├── WizardShell.tsx            # 단계 전환 컨테이너
│   │   ├── StepModeSelect.tsx         # 0. 자동/수동
│   │   ├── StepPrincipal.tsx          # 1. 총 투자금
│   │   ├── StepTargetIncome.tsx       # 2. 목표 월 세후 수령액
│   │   ├── StepCountry.tsx            # 3. 국가/통화 선택
│   │   ├── StepTaxAndFx.tsx           # 4. 세율·환율 확인/수정
│   │   ├── StepBondSlider.tsx         # 5-A. 채권 비중 슬라이더 (자동)
│   │   └── StepManualPicker.tsx       # 5-B. 종목·비중 직접 입력 (수동)
│   ├── status/
│   │   └── StatusBox.tsx              # 입력 현황 실시간 요약 박스
│   ├── result/
│   │   ├── ResultSection.tsx          # 결과 영역 조립
│   │   ├── FeasibilityAlert.tsx       # 달성/미달성 판정 배너
│   │   ├── AllocationTable.tsx        # 종목별 배분 테이블
│   │   ├── AllocationChart.tsx        # 배분 도넛 차트
│   │   ├── IncomeByCurrencyTable.tsx  # 국가별 연/월 세전·세후 테이블
│   │   ├── TaxBreakdown.tsx           # 세금 분해 표시
│   │   └── CommentaryCard.tsx         # AI 총평
│   └── saved/
│       ├── SaveScenarioDialog.tsx     # 제목 입력 모달
│       ├── SavedScenarioTable.tsx     # 저장 목록 테이블
│       └── DeleteConfirmDialog.tsx    # 삭제 확인 모달
│
├── lib/
│   ├── data/                          # 순수 상수 (변경 빈도 낮음)
│   │   ├── etfs.ts                    # ETF 10종 마스터
│   │   ├── countries.ts               # 국가·통화 18종
│   │   ├── taxPresets.ts              # 국가별 세율 프리셋
│   │   └── fallbackQuotes.ts          # API 실패 시 폴백 배당률
│   ├── calc/                          # 순수 함수 — React import 금지
│   │   ├── allocate.ts                # 자동 배분 알고리즘
│   │   ├── tax.ts                     # 원천징수 + 거주국 세금
│   │   ├── income.ts                  # 연/월 세전·세후 산출
│   │   ├── currency.ts                # 통화 변환
│   │   ├── feasibility.ts             # 달성 판정 + 필요원금 역산
│   │   └── index.ts                   # 파이프라인 조립 (runPortfolio)
│   ├── market/                        # 서버 전용 I/O
│   │   ├── quotesProvider.ts
│   │   ├── fxProvider.ts
│   │   └── cache.ts
│   ├── firebase/
│   │   ├── client.ts                  # 클라이언트 SDK 초기화
│   │   ├── admin.ts                   # Admin SDK (서버 전용)
│   │   ├── anonAuth.ts                # 익명 인증 보장
│   │   └── scenarios.ts               # 시나리오 CRUD
│   ├── ai/
│   │   ├── commentary.ts              # Claude 호출
│   │   └── prompt.ts                  # 프롬프트 템플릿 분리
│   ├── schema/
│   │   └── portfolioInput.ts          # Zod 스키마 (타입 원천)
│   ├── types/
│   │   ├── etf.ts  ├── result.ts  └── scenario.ts
│   └── format/
│       ├── currencyFormat.ts
│       └── percentFormat.ts
│
├── hooks/
│   ├── useAnonUser.ts
│   ├── useQuotes.ts
│   ├── useFxRates.ts
│   ├── useScenarios.ts
│   └── usePortfolioResult.ts          # 입력 → 계산 결과 파생
│
└── store/
    └── wizardStore.ts                 # Zustand 단일 스토어
```

### 5.1 파일 분리 규칙 (개발 중 준수)
1. **파일당 200줄 상한.** 초과 시 무조건 분할한다.
2. **컴포넌트 1개 = 파일 1개.** 한 파일에 두 개 이상의 export 컴포넌트를 두지 않는다.
3. `lib/calc/**` 는 순수 함수만 — React, Firebase, fetch를 import하지 않는다. (테스트 가능성 보장)
4. `lib/market/**`, `lib/firebase/admin.ts` 는 파일 최상단에 `import 'server-only'` 를 선언한다.
5. UI 컴포넌트는 **계산하지 않는다.** 값을 받아 그리기만 한다. 컴포넌트 내부의 `useMemo` 산술 계산 금지.
6. 매직넘버 금지 — 15% 원천징수, 24시간 캐시 TTL 등은 모두 `lib/data/constants.ts` 에 명명 상수로 둔다.
7. 타입은 Zod 스키마에서 `z.infer` 로 파생시키고, 동일 개념을 두 번 선언하지 않는다.

---

## 6. 계산 엔진 명세

### 6.1 입출력 타입

```ts
// lib/schema/portfolioInput.ts
type PortfolioInput = {
  mode: 'auto' | 'manual';
  principal: { amount: number; currency: CurrencyCode };  // 총 투자금
  targetMonthlyNet: { amount: number; currency: CurrencyCode }; // 목표 월 세후
  residenceCountry: CountryCode;        // 거주국 (세금 기준)
  displayCurrencies: CurrencyCode[];    // ['KRW','USD', +1]
  tax: {
    usWithholdingRate: number;          // 기본 0.15
    residentTaxRate: number;            // 국가 프리셋에서 자동, 수정 가능
    creditForeignTax: boolean;          // 외국납부세액공제 적용 여부
  };
  fxRates: Record<CurrencyCode, number>; // USD 기준 환산율 (수정 가능)
  bondRatio?: number;                    // auto 모드: 0~0.5 슬라이더
  manualHoldings?: { ticker: string; weight: number }[]; // manual 모드
};

type PortfolioResult = {
  holdings: HoldingResult[];       // 종목별 금액·비중·연배당
  gross: MoneyByPeriod;            // 세전 연/월
  net: MoneyByPeriod;              // 세후 연/월
  taxDetail: { usWithheld: number; residentTax: number; effectiveRate: number };
  byCurrency: CurrencyRow[];       // 통화별 연/월 세전·세후
  feasibility: FeasibilityResult;
  meta: { asOf: string; isFallback: boolean };
};
```

### 6.2 자동 배분 알고리즘 (`lib/calc/allocate.ts`)

**설계 원칙**: 채권 비중은 사용자가 슬라이더로 정하고, 나머지 주식 비중을 알고리즘이 목표에 맞춰 조정한다.

```
STEP 1. 채권군 비중 = bondRatio (사용자 슬라이더, 기본 20%, 범위 0~50%)
        주식군 비중 = 1 - bondRatio

STEP 2. 각 그룹 내 기본 배분 = 그룹 내 전 종목 균등분산
        - S&P군 4종목 균등, 나스닥군 4종목 균등, 채권군 2종목 균등
        - 이 상태의 포트폴리오 세후 수익률을 계산

STEP 3. 목표 달성 여부 판정
        달성 → 그대로 확정 (분산도가 가장 높은 안이므로 우선)
        미달 → STEP 4로

STEP 4. 1차 조정 — 그룹 내 고배당 상위 2종목으로 압축
        정렬 기준: API 실시간 배당률(quotes.yield), 값 없으면 폴백값 사용, 내림차순
        동률 시: 티커 알파벳 오름차순으로 우선순위 결정 (재현성 보장)
        선정된 2종목은 STEP 2와 동일하게 그룹 내 균등분산(50:50)
        (예: S&P군 → 배당률 상위 2종 / 나스닥군 → 배당률 상위 2종)
        재계산 후 달성 시 확정

STEP 5. 2차 조정 — 주식군 내부에서 S&P → 나스닥으로 비중 이동
        이동 단위: 주식군 비중의 1%p씩 S&P→나스닥으로 이동, 매 반복마다 재계산
        정지 조건: 목표 달성 시점의 비중에서 즉시 확정 (그 이상 이동하지 않음 → "최소 이동량")
        나스닥 비중 상한 = 주식군의 70% (안정성 가드레일) — 도달 시 이동 중단
        그룹 내부 비중은 STEP 4에서 확정된 종목 구성(상위 2종목 50:50)을 유지한 채 그룹 비중만 변경
        각 반복마다 §6.2 가드레일(단일 종목 40%, 그룹 최소 5%)을 재검증

STEP 6. 그래도 미달 → 달성 불가 판정
        반환값: { achievable: false,
                  maxMonthlyNet,              // 현 조건 최대 달성액
                  requiredPrincipal,          // 목표 달성에 필요한 원금
                  suggestion }                // "채권 비중을 X%로 낮추면 달성 가능" 등
```

**가드레일**
- 단일 종목 최대 비중 40% 초과 금지
- 각 그룹 최소 비중 5% (채권 슬라이더가 0%인 경우 제외)
- 최종 비중 합계는 소수점 보정 후 정확히 100%

### 6.3 세금 계산 (`lib/calc/tax.ts`)

```
종목별 세전 연배당 D
  ├─ withholdingExempt = true (SGOV 등)  → 미국 원천징수 0
  └─ 그 외                                → 미국 원천징수 = D × usWithholdingRate (기본 15%)

거주국 추가 과세:
  creditForeignTax = true (한국 등 외국납부세액공제 적용)
      → 추가세 = max(0, D × residentTaxRate − 미국원천징수액)
  creditForeignTax = false (해외소득 비과세/분리 국가)
      → 추가세 = D × residentTaxRate

세후 = D − 미국원천징수 − 추가세
```

> **면책 처리 필수**: 화면 하단과 결과 카드에 다음 문구를 상시 노출한다.
> "본 계산은 단순화된 모델이며 실제 세액은 거주 상태, 조세조약, 개인 소득 구간에 따라 달라집니다. 세율은 직접 확인·수정하여 사용하시고, 실제 신고는 세무 전문가와 상담하십시오."

### 6.4 통화 변환 (`lib/calc/currency.ts`)
- 모든 내부 계산은 **USD 기준**으로 수행하고, 표시 직전에만 변환한다.
- 표시 통화는 KRW·USD 고정 + 사용자 선택 1개 = 최대 3개.
- 환율 소스는 API 자동 조회값을 기본으로 하되, 각 통화별로 수동 입력 필드를 제공한다. 수동 수정 시 해당 행에 "수동" 배지를 표시한다.
- 지원 통화 18종: USD, EUR, JPY, GBP, AUD, CAD, CHF, NZD, SGD, MXN, INR, RUB, GEL, BRL, TWD, THB, TRY, PHP, KRW.

---

## 7. 사용자 플로우 (원안 검토·재설계)

### 7.1 원안의 문제점과 수정
| 원안 | 문제 | 수정안 |
|---|---|---|
| 투자금 → 목표수령액 → 과세율 → 국가 | 과세율이 국가에 종속되는데 순서가 반대 | **국가를 먼저** 선택 → 세율 프리셋 자동 제시 |
| 투자금과 목표액 동시 입력 | 두 값이 모순될 수 있음 | 충돌 시 "최대 달성액 + 필요 원금" 동시 제시 |
| 수동 모드: 종목만 선택 | 비중이 없으면 계산 불가 | 종목 선택 후 **비중 입력 + 합계 100% 검증** 단계 추가 |
| 환율 사용자 입력 | 매번 조회가 번거로움 | API 자동 조회 + 수동 오버라이드 |
| 자동 모드에 배분 취향 없음 | 안정성 조절 불가 | **채권 비중 슬라이더** 단계 추가 |

### 7.2 확정 플로우

> 아래 [0]~[5A/5B]가 §1.3 G1의 "6단계 입력"에 대응한다. 단계 수를 변경할 경우 G1도 함께 갱신한다.

```
[0] 모드 선택 ─── 자동 / 수동 (필수)
        │
[1] 총 투자금 입력 ────────────────┐
        │                          │
[2] 목표 월 세후 수령액 입력       │  각 단계 완료 시마다
        │                          ├─ '현황 박스'에 항목이
[3] 국가/통화 선택                 │   한 줄씩 누적 표시
     (한국·미국 고정 + 1개국)      │
        │                          │
[4] 세율·환율 확인 및 수정 ────────┘
     (프리셋 자동 채움)
        │
        ├─[자동]→ [5A] 채권 비중 슬라이더 → 자동 계산 실행
        └─[수동]→ [5B] 종목 선택 + 비중 입력(합 100%) → 계산 실행
        │
[6] 결과 화면
     ├ 달성 판정 배너 (달성 / 미달성+역산)
     ├ 종목별 배분 테이블 + 도넛 차트
     ├ 국가별 연/월 세전·세후 테이블  ★ 핵심 산출물
     ├ 세금 분해
     └ AI 총평 (자동 모드 우선, 수동 모드도 생성 가능)
        │
[7] 저장 → 제목 입력 모달 → Firestore 저장 → 토스트 "저장했습니다"
```

### 7.3 현황 박스(StatusBox) 동작
- 입력이 하나씩 확정될 때마다 항목이 추가되는 누적 요약 패널.
- 모바일에서는 상단 고정(sticky) 축약형, 데스크톱에서는 우측 사이드 고정.
- 각 항목은 클릭 시 해당 단계로 되돌아가 수정 가능.

---

## 8. 결과 화면 명세

### 8.1 국가별 연/월 세전·세후 테이블 (핵심 산출물)

| 통화 | 연 세전 | 연 세후 | 월 세전 | 월 세후 |
|---|---|---|---|---|
| KRW (원) | ... | ... | ... | ... |
| USD ($) | ... | ... | ... | ... |
| PHP (₱) | ... | ... | ... | ... |

- 목표 대비 달성률을 월 세후 셀 옆에 배지로 표기 (예: `목표의 104%`)
- 모바일에서는 가로 스크롤 대신 **통화별 카드 스택**으로 전환한다.

### 8.2 달성 판정 배너 (FeasibilityAlert)
- **달성**: 초록 배너 — "목표 월 세후 ₩3,000,000 대비 ₩3,120,000 (104%) 달성"
- **미달**: 주황 배너 — "현재 조건으로는 월 세후 ₩2,410,000까지 가능합니다. 목표 달성에는 약 ₩□□□의 원금이 필요하며, 채권 비중을 10%로 낮추면 달성 가능합니다."
  (실패로 처리하지 않고 반드시 대안 2가지를 함께 제시)

### 8.3 AI 총평 (CommentaryCard)
- 입력: 계산 완료된 `PortfolioResult` 요약 JSON
- 출력: 3~5문장 (선정 배경 / 위험 요인 / 조정 제안)
- 프롬프트 원칙: **숫자를 새로 만들지 말고 전달받은 값만 인용**할 것을 명시한다.
- 커버드콜 ETF의 원금 변동 가능성을 반드시 1문장 포함하도록 지시한다.
- 실패 시 재시도 버튼 노출, 결과 테이블은 그대로 유지.

---

## 9. 시나리오 저장/삭제 기능

### 9.1 요구사항
로그인 화면 없이 사용하되, **결과값과 총평을 제목과 함께 테이블에 저장**하고 **삭제**할 수 있어야 한다.

### 9.2 동작
1. 앱 최초 진입 시 `signInAnonymously()` 를 자동 호출해 uid를 확보한다 (사용자는 인지하지 못함).
2. 결과 화면의 "결과 저장" 버튼 → ShadCN Dialog로 제목 입력 (기본값 자동 제안: `2026-08-05 자동배분 월$2,500`).
3. 저장 완료 → Sonner 토스트 "저장했습니다" + 목록 보기 링크.
4. `/saved` 페이지에서 테이블 형태로 목록 표시.

| 제목 | 모드 | 원금 | 월 세후 | 저장일 | 동작 |
|---|---|---|---|---|---|
| 필리핀 기준안 | 자동 | ... | ... | ... | 보기 / 삭제 |

5. 삭제 → 확인 모달(AlertDialog) → 삭제 후 토스트 "삭제했습니다".
6. "보기" 클릭 시 저장된 입력값으로 위저드를 복원해 재계산 가능하게 한다.

### 9.3 익명 인증의 한계 고지
브라우저 데이터를 삭제하거나 다른 기기로 접속하면 저장 목록이 보이지 않는다. `/saved` 페이지 상단에 안내 문구를 1줄 배치한다. (v2에서 계정 연결(linkWithCredential)로 승격 지원)

---

## 10. Firestore 스키마 및 보안 규칙

### 10.1 컬렉션 구조
```
/marketData/etfQuotes            # 공용 시세 캐시 (서버만 write)
    { updatedAt, quotes: { SPYI: {price, yield}, ... } }
/marketData/fxRates              # 공용 환율 캐시
    { updatedAt, base: 'USD', rates: { KRW: 1380, PHP: 58.2, ... } }

/users/{uid}/scenarios/{scenarioId}
    {
      title: string,
      createdAt: Timestamp,
      input: PortfolioInput,     # 재계산용 원본 입력
      result: PortfolioResult,   # 저장 시점 스냅샷
      commentary: string | null,
      asOf: string               # 시세 기준 시각
    }
```

### 10.2 보안 규칙
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /marketData/{doc} {
      allow read: if true;
      allow write: if false;            // 서버(Admin SDK)만 기록
    }
    match /users/{uid}/scenarios/{id} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 11. API 라우트 명세

| 라우트 | 메서드 | 입력 | 출력 | 비고 |
|---|---|---|---|---|
| `/api/quotes` | GET | — | `{ quotes, asOf, isFallback }` | 24h 캐시 |
| `/api/fx` | GET | `?symbols=KRW,PHP` | `{ rates, asOf, isFallback }` | 12h 캐시 |
| `/api/commentary` | POST | `PortfolioResult` 요약 | `{ text }` | 타임아웃 20s |

**환경변수** (`.env.local` / App Hosting Secret)
```
MARKET_API_KEY=          # FMP 또는 Finnhub
FX_API_KEY=
ANTHROPIC_API_KEY=
FIREBASE_ADMIN_CREDENTIALS=
NEXT_PUBLIC_FIREBASE_*=  # 클라이언트 SDK 설정값만 PUBLIC
```
`NEXT_PUBLIC_` 접두사는 Firebase 클라이언트 설정에만 사용하며, 시세·AI 키에는 절대 붙이지 않는다.

---

## 12. UI/UX 및 디자인 방향

### 12.1 디자인 컨셉
**"통장 잔고가 아니라 월급 명세서처럼"** — 투자 대시보드의 화려한 차트보다, 매월 들어올 금액을 담담하게 확인하는 명세서의 정확함을 우선한다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#0F1720` | 다크 기본 배경 |
| `--surface` | `#18222E` | 카드 |
| `--ink` | `#E8EDF2` | 본문 |
| `--accent` | `#3E8E7E` | 수령액·달성 (차분한 청록) |
| `--warn` | `#C4703A` | 미달성·경고 |
| `--muted` | `#7C8B9A` | 보조 텍스트·단위 |

- 라이트/다크 모드 모두 지원, 시스템 설정 추종.
- **타이포**: 금액은 tabular-nums 고정폭 숫자를 적용해 자릿수가 흔들리지 않게 한다. 제목은 산세리프 볼드, 금액은 한 단계 큰 스케일로 위계를 준다.
- **시그니처 요소**: 결과 화면의 "월 세후 수령액" 단일 대형 숫자 — 통화 전환 시 숫자가 롤링 애니메이션으로 바뀐다. 화려함은 이 한 곳에만 쓰고 나머지는 절제한다.
- `prefers-reduced-motion` 존중, 키보드 포커스 링 유지.

### 12.2 ShadCN 컴포넌트 매핑
| 용도 | 컴포넌트 |
|---|---|
| 저장 제목 입력 | `Dialog` |
| 삭제 확인 | `AlertDialog` |
| 알림 메시지 | `Sonner (Toast)` |
| 채권 비중 조절 | `Slider` |
| 모드/국가 선택 | `RadioGroup`, `Select` |
| 결과 표 | `Table` |
| 단계 진행 | `Tabs` 또는 커스텀 Stepper |
| 세율·환율 수정 | `Input` + `Popover` |

### 12.3 모바일 대응 규칙
1. **모바일 우선 작성** — 기본 스타일이 모바일, `md:` 이상에서 확장.
2. 위저드는 모바일에서 **한 화면 1단계**, 하단 고정 버튼 바(다음/이전).
3. 결과 테이블은 `md` 미만에서 **카드 스택**으로 전환 (가로 스크롤 금지).
4. 모든 터치 타깃 최소 44×44px.
5. 숫자 입력 필드는 `inputMode="decimal"` 로 숫자 키패드 유도.
6. 현황 박스는 모바일에서 접이식(sticky, 기본 접힘).
7. iOS 입력 확대 방지를 위해 입력 폰트 16px 이상.
8. 하단 안전영역(safe-area-inset) 패딩 적용.

---

## 13. 개발 단계 계획

| Phase | 산출물 | 완료 기준 |
|---|---|---|
| **P0. 셋업** | Next.js 16 + TS + Tailwind + ShadCN 초기화, GitHub 연결, Firebase 웹앱 등록 | 빈 화면 배포 성공 |
| **P1. 데이터·계산 엔진** | `lib/data/*`, `lib/calc/*`, 단위 테스트 | 테스트 케이스 전부 통과 (계산만으로 결과 도출 가능) |
| **P2. 시세·환율 연동** | `/api/quotes`, `/api/fx`, 캐시·폴백 | API 차단 상태에서도 폴백으로 동작 |
| **P3. 위저드 UI** | Step 0~5, StatusBox, Zustand 스토어 | 입력 → 결과 객체 생성까지 연결 |
| **P4. 결과 화면** | 테이블·차트·판정 배너·세금 분해 | 모바일 카드 전환 확인 |
| **P5. 저장/삭제** | 익명 인증, Firestore CRUD, 모달·토스트 | 저장·목록·삭제·복원 동작 |
| **P6. AI 총평** | `/api/commentary`, CommentaryCard | 실패 시에도 앱 정상 동작 |
| **P7. 마감** | 접근성·반응형 점검, 면책 문구, README | Lighthouse 모바일 90+ |

### 13.1 P1 단위 테스트 필수 케이스
- 균등분산으로 목표 달성 → STEP 3에서 확정되는가
- 목표 미달 → 상위 2종목 압축 후 달성되는가
- 나스닥 상한 70% 를 넘지 않는가
- STEP 4 배당률 동률 시 티커 알파벳 순으로 동일하게 재현되는가
- STEP 5에서 목표 달성 시점(1%p 단위)에 정확히 정지하고 더 이동하지 않는가
- SGOV 원천징수 면제가 반영되는가
- 외국납부세액공제 on/off 결과 차이
- 비중 합계가 항상 정확히 100%인가
- 수동 모드에서 합계 99.9% 입력 시 검증 오류가 나는가

---

## 14. 배포 절차

### 14.1 GitHub 초기화
```bash
echo "# US_Monthly_Dividend_ETF" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/gppc5096/US_Monthly_Dividend_ETF.git
git push -u origin main
```

### 14.2 Firebase
```bash
claude plugin marketplace add firebase/agent-skills
claude plugin install firebase@firebase
```
- 기존 프로젝트(번호 `587298984700`)에 **웹앱 등록** 후 설정값을 `.env.local` 에 반영
- Firebase Authentication에서 **익명 로그인 활성화**
- Firestore 생성 + 위 보안 규칙 배포
- App Hosting에 GitHub 저장소 연결 → `main` 브랜치 푸시 시 자동 배포
- 시크릿은 App Hosting Secret Manager로 등록 (저장소에 커밋 금지)

---

## 15. 리스크 및 면책

| 리스크 | 대응 |
|---|---|
| 시세 API 무료 티어 한도 초과 | Firestore 24h 캐시로 호출 최소화, 폴백 상시 유지 |
| 배당률 급변으로 계산 결과 왜곡 | `asOf` 시각 상시 노출, 참고값 안내 |
| 커버드콜 ETF 원금 감소 위험 | 결과 화면과 AI 총평에 위험 고지 포함 |
| 세율 모델 단순화 | 사용자 수정 허용 + 세무 상담 권고 문구 상시 노출 |
| 익명 인증 데이터 유실 | 목록 페이지에 한계 안내, v2 계정 연결 지원 |

**상시 면책 문구 (푸터 고정)**
> 본 서비스는 정보 제공 및 계산 목적의 도구이며 투자 권유나 세무 자문이 아닙니다. 표시된 배당수익률은 과거·현재 기준 참고값으로 미래 수익을 보장하지 않으며, 커버드콜 상품은 원금 손실 가능성이 있습니다. 투자 판단과 세금 신고의 책임은 이용자 본인에게 있습니다.

---

## 16. 향후 확장 (v2)
- 익명 계정 → 정식 계정 연결(기기 간 동기화)
- 시나리오 A/B 비교 화면
- 배당 지급월 캘린더 (월별 현금흐름 균등화)
- 환율 변동 민감도 분석
- ETF 종목 사용자 추가/편집
