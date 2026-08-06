# TODO — 미국 월배당 ETF 포트폴리오 개발 체크리스트

> 기준 문서: [`PRD_미국월배당ETF포트폴리오.md`](./PRD_미국월배당ETF포트폴리오.md) (v1.1)
> 각 항목의 `§n`은 PRD 섹션 번호. Phase 순서(P0→P7)와 완료 기준은 PRD §13과 동일하게 유지한다.

---

## P0. 셋업 (§13, §14)
- [x] Next.js 16 (App Router) + TypeScript + Tailwind CSS 초기화
- [x] ShadCN UI 초기화 (`components.json`, `lib/utils.ts`)
- [x] 개발 서버 기동 및 브라우저 확인 (`localhost:3000`, 에러 오버레이 없음)
- [x] GitHub 저장소 연결 (§14.1 — `git init` → `gppc5096/US_Monthly_Dividend_ETF` 원격 연결, push 완료)
- [x] Firebase 웹앱 등록 (프로젝트 번호 `587298984700`) (§14.2) + `.env.local` 반영
- [x] Firestore 생성(서울, asia-northeast3) + 보안 규칙 배포
- [x] 익명 로그인 활성화
- [x] **완료 기준**: 빈 화면 배포 성공 — https://us-monthly-dividend-etf--usmonthlydividendetf.asia-east1.hosted.app (App Hosting, asia-east1, CLI 로컬 소스 배포)
- [ ] App Hosting ↔ GitHub 저장소 연결 (push 시 자동 배포) — **보류**: Developer Connect GitHub 연동 단계에서 브라우저가 잘못된 GitHub 계정(namsabo180708-prog)으로 연결되는 문제로 중단. gppc5096 계정으로만 로그인한 상태에서 재시도 필요

---

## P1. 데이터·계산 엔진 (§3, §6)

### 데이터 상수 — `lib/data/`
- [x] `etfs.ts` — ETF 10종 마스터 (§3 표: 그룹/티커/명칭/폴백 배당률/과세유형)
- [x] `countries.ts` — 국가·통화 18종 (§6.4)
- [x] `taxPresets.ts` — 국가별 세율 프리셋
- [x] `fallbackQuotes.ts` — API 실패 시 폴백 배당률
- [x] `constants.ts` — 매직넘버 명명 상수 (원천징수율, 캐시 TTL, 나스닥 상한, 단일종목 상한, 그룹 최소비중, 채권비중 기본/범위, STEP5 이동단위 등) (§5.1 규칙6)

### 계산 함수 — `lib/calc/` (React·Firebase·fetch import 금지, 검증 완료)
- [x] `allocate.ts` — 자동 배분 알고리즘 STEP1~6 (§6.2)
  - STEP4 동률 처리: 배당률 내림차순, 동률 시 티커 알파벳 오름차순 ✓ (`rankByYield`)
  - STEP5 이동 단위 1%p, 목표 달성 시점 즉시 정지, 나스닥 상한 70%(주식군 기준) ✓
  - 가드레일: 단일 종목 40% 상한, 그룹 최소 5%(채권 0% 예외), 비중 합계 정확히 100%(bp 단위 정수 연산) ✓
- [x] `tax.ts` — 미국 원천징수 + 거주국 세금, `withholdingExempt`/`creditForeignTax` 분기 (§6.3)
- [x] `income.ts` — 연/월 세전·세후 산출
- [x] `currency.ts` — 통화 변환 (내부 계산은 USD 기준, 표시 직전 변환) (§6.4)
- [x] `feasibility.ts` — 달성 판정 + 미달 시 최대가능액·필요원금 역산·조정 제안
- [x] `index.ts` — `runPortfolio` 파이프라인 조립 (112줄)

### 스키마·타입
- [x] `lib/schema/portfolioInput.ts` — Zod 스키마 (`PortfolioInput`/`PortfolioResult` 타입 원천, §6.1)
- [x] `lib/types/{etf,result,scenario}.ts`

### 단위 테스트 (§13.1) — 전부 통과 확인 (vitest, 3 파일 / 21 테스트, `npm run test`)
- [x] 균등분산으로 목표 달성 → STEP3에서 확정되는가
- [x] 목표 미달 → 상위 2종목 압축(STEP4) 후 달성되는가
- [x] 나스닥 상한 70%를 넘지 않는가
- [x] STEP4 배당률 동률 시 티커 알파벳순으로 동일하게 재현되는가
- [x] STEP5에서 목표 달성 시점(1%p 단위)에 정확히 정지하는가
- [x] SGOV 원천징수 면제가 반영되는가
- [x] 외국납부세액공제 on/off 결과 차이가 있는가
- [x] 비중 합계가 항상 정확히 100%인가
- [x] 수동 모드에서 합계 99.9% 입력 시 검증 오류가 나는가
- [x] **완료 기준**: 테스트 케이스 전부 통과 (`npm run test` 21 passed, `npx tsc --noEmit` 에러 없음)

---

## P2. 시세·환율 연동 (§4.2, §11)
- [x] `src/app/api/quotes/route.ts` — Firestore 캐시(24h) → 외부 API → 정적 폴백 3단 계층
- [x] `src/app/api/fx/route.ts` — 캐시(12h) → 외부 API → 폴백, `?symbols=` 쿼리 지원
- [x] `lib/market/{quotesProvider,fxProvider,cache}.ts` — 파일 최상단 `import 'server-only'` 확인
- [x] `lib/firebase/admin.ts` — 자격증명 없으면 예외 없이 null 반환(캐시 계층만 스킵), P5에서 확장 예정
- [ ] 환경변수 등록: `MARKET_API_KEY`, `FX_API_KEY` (아직 실제 키 미발급 — 발급 시 `.env.local`에 채우면 바로 동작)
- [x] 폴백 사용 시 UI 배지 문구 연동 (P3에서 연결 완료)
- [x] **완료 기준**: API 차단 상태에서도 폴백으로 정상 동작 — 실키 없이 `curl localhost:3000/api/quotes`, `/api/fx?symbols=KRW,PHP` 로 200 + `isFallback:true` 확인, 서버 에러 없음, tsc/lint 클린

---

## P3. 위저드 UI (§7, §5 디렉토리)
- [x] `store/wizardStore.ts` — Zustand 단일 스토어 (174줄) + `store/wizardSelectors.ts` 파생 셀렉터 분리(200줄 상한 준수)
- [x] `components/wizard/WizardShell.tsx` — 단계 전환 컨테이너, 진행 룰 표시
- [x] Step 0 `StepModeSelect.tsx` — 자동/수동 카드형 RadioGroup
- [x] Step 1 `StepPrincipal.tsx` — 총 투자금 (RHF + Zod, `inputMode="decimal"`)
- [x] Step 2 `StepTargetIncome.tsx` — 목표 월 세후 수령액 (RHF + Zod)
- [x] Step 3 `StepCountry.tsx` — 한국·미국 고정 행 + 거주국 Select, 선택 시 세율 프리셋·표시통화 자동 반영
- [x] Step 4 `StepTaxAndFx.tsx` — 세율 %필드 + 외국납부세액공제 스위치 + `/api/fx` 초기값, 수동 수정 시 "수동" 배지·되돌리기
- [x] Step 5-A `StepBondSlider.tsx` — 채권 비중 슬라이더 (기본 20%, 0~50%)
- [x] Step 5-B `StepManualPicker.tsx` — 종목 선택 + 비중 입력, 합계 100% 실시간 검증
- [x] `components/status/StatusBox.tsx` — 누적 요약, 모바일 sticky 접이식(기본 접힘) / 데스크톱 사이드 고정, 클릭 시 해당 단계로 복귀
- [x] `hooks/{useAnonUser,useQuotes,useFxRates,usePortfolioResult}.ts` (`useAnonUser`는 P5 Firebase 연동 전 스텁)
- [x] 디자인 토큰(§12.1) `globals.css` 적용 + IBM Plex Sans KR / IBM Plex Mono, 다크 우선·시스템 추종
- [x] 폴백 배지 문구 연동 (§4.2 — 결과 미리보기 "실시간 시세 연결 실패 — 참고값으로 계산됨", 환율 "참고값 · 연결 실패")
- [x] **완료 기준**: 입력 → 결과 객체 생성까지 연결 — 자동/수동 모두 브라우저에서 완주 확인. 자동(₩5억/목표 ₩300만/필리핀, 채권 20%) → 월 세후 ₩3,531,250(목표의 118%, STEP3), 수동(₩3억/QQQI 60%·TLTW 40%/한국) → ₩2,876,400(목표의 144%). 모바일 375×812 무횡스크롤, 콘솔 에러 0, `npx tsc --noEmit`/`npm run lint` 클린
- [x] 접근성 보정: `globals.css` 다크모드 `--surface`/`--rule`/`--hover-surface`/`--muted-surface` 명도 상향 (배경과 거의 구분 안 되던 카드·입력창·슬라이더 경계 문제 해결, PRD §12.1 갱신 완료)

---

## P4. 결과 화면 (§8)
- [x] `ResultSection.tsx` — 결과 영역 조립, 위저드 계산완료 단계에서 렌더 (기존 임시 `CalcPreview.tsx`는 삭제)
- [x] `FeasibilityAlert.tsx` — 달성(초록)/미달(주황) 배너. 검증: 달성 시 "목표 월 세후 ₩3,000,000 대비 ₩3,531,250 (118%) 달성", 미달 시 "대안 1·원금 조정(약 ₩6,321,032,604 필요)"+"대안 2·배분 조정" 동시 표기 확인
- [x] `AllocationTable.tsx` + `AllocationChart.tsx` (Recharts 도넛) — 종목 10개 테이블 + 그룹별 비중 도넛, 미달 시나리오에서 STEP5 나스닥 70% 상한(56/80%)까지 이동한 배분도 정상 반영
- [x] `IncomeByCurrencyTable.tsx` — 통화별(KRW/USD/PHP) 연/월 세전·세후 테이블 (★ 핵심 산출물), 월 세후 셀 옆 "목표의 N%" 배지 확인
- [x] `TaxBreakdown.tsx` — 연 세전배당/미국 원천징수/거주국 추가세/연 세후배당/실효세율 확인
- [x] `CommentaryCard.tsx` — "준비 중" 배지의 플레이스홀더 카드 (실제 생성은 P6에서 연결)
- [x] 모바일 대응 (`md` 미만 카드 스택)
- [x] **완료 기준**: 달성(자동/₩5억/필리핀/목표₩300만/채권20% → ₩3,531,250, 118%, STEP3)·미달(자동/₩1000만/한국/목표₩5000만/채권20% → ₩79,101, 0%, STEP6) 두 시나리오 모두 브라우저 실클릭으로 완주 확인. 콘솔 에러 0, `npx tsc --noEmit`/`npm run lint`/`npm run test`(21 passed) 클린, 전 파일 200줄 이하(`ResultSection.tsx` 115줄 최대)

---

## P5. 저장/삭제 (§9, §10)
- [x] `lib/firebase/{client,admin,anonAuth,scenarios}.ts` — client.ts는 `ignoreUndefinedProperties: true`로 초기화(옵션 필드 undefined 대응)
- [x] 앱 최초 진입 시 `signInAnonymously()` 자동 호출 (`useAnonUser` 완성)
- [x] `SaveScenarioDialog.tsx` — 제목 입력 모달, 기본값 자동 제안(`2026-08-06 자동배분 월₩3,000,000` 형식 확인)
- [x] `src/app/saved/page.tsx` + `SavedScenarioTable.tsx` — 저장 목록 테이블 (제목/모드/원금/월세후/저장일/동작)
- [x] `DeleteConfirmDialog.tsx` (AlertDialog) — 삭제 확인("되돌릴 수 없습니다") → 토스트 "삭제했습니다"
- [x] "보기" 클릭 시 저장된 입력값으로 위저드 복원 → 재계산 (복원 후 재계산 결과가 저장 시점과 정확히 일치 확인: ₩3,489,750/116%/STEP3)
- [x] Firestore 보안 규칙 배포 (§10.2 — 이미 배포됨, 실제 익명 인증 uid로 CRUD 성공 확인)
- [x] `/saved` 상단 익명 인증 한계 고지 문구 1줄 (§9.3 그대로)
- [x] **완료 기준**: 저장→목록→보기→삭제 전체 플로우를 실제 Firestore(`usmonthlydividendetf`)에 대해 브라우저 실클릭으로 확인. 콘솔 에러 0, `npx tsc --noEmit`/`npm run lint`/`npm run test`(21 passed) 클린, 전 파일 200줄 이하
- [ ] **완료 기준**: 저장·목록·삭제·복원 동작

---

## P6. AI 총평 (§8.3, §11)
- [x] `src/app/api/commentary/route.ts` (타임아웃 20s, `COMMENTARY_TIMEOUT_MS`)
- [x] `lib/ai/{commentary,prompt}.ts` — 프롬프트 템플릿 분리, `@anthropic-ai/sdk` 연동(키 없으면 서버가 죽지 않고 에러 응답)
- [x] 프롬프트 규칙: 숫자 재생성 금지(전달받은 값만 인용), 커버드콜 원금 변동 위험 1문장 필수 포함(`isCoveredCall` + `hasCoveredCall` 플래그로 강제), 3~5문장
- [x] `CommentaryCard.tsx` 완성 — 결과 진입 시 자동 호출, 실패 시 "총평 생성에 실패했습니다. 아래 결과 표와 차트는 그대로 유효합니다." + "다시 시도" 버튼
- [ ] `ANTHROPIC_API_KEY` 환경변수 등록 — 아직 실제 키 미발급(`.env.local` 빈 값 유지), 발급 시 즉시 동작
- [x] **완료 기준**: 총평 생성 실패 시에도 앱 정상 동작 — 키 없는 상태로 브라우저 실클릭 검증: 총평만 실패 처리되고 배분표/차트/통화별테이블/세금분해/달성배너는 전부 정상, "다시 시도" 재클릭 후에도 앱 정상, 콘솔 에러 0, `npx tsc --noEmit`/`npm run lint`/`npm run test`(21 passed) 클린

---

## P7. 마감 (§12, §15)
- [ ] 접근성: 키보드 포커스 링 유지, `prefers-reduced-motion` 존중, 터치 타깃 44×44px 이상
- [ ] 반응형 전 구간 점검 (모바일 1단계 화면, 하단 고정 버튼 바, safe-area-inset)
- [ ] 면책 문구 푸터 고정 배치 (§15 상시 면책 문구)
- [ ] README 작성
- [ ] Lighthouse 모바일 90+ 확인
- [ ] **완료 기준**: Lighthouse 모바일 90+

---

## 전 단계 공통 규칙 (§5.1, 매 PR마다 확인)
- [ ] 파일당 200줄 상한 — 초과 시 분할
- [ ] 컴포넌트 1개 = 파일 1개
- [ ] `lib/calc/**`는 순수 함수만 (React/Firebase/fetch import 금지)
- [ ] `lib/market/**`, `lib/firebase/admin.ts` 최상단 `import 'server-only'` 선언
- [ ] UI 컴포넌트는 계산하지 않음 — 내부 `useMemo` 산술 계산 금지
- [ ] 매직넘버 금지 — 전부 `lib/data/constants.ts`에 명명 상수로 관리
- [ ] 타입은 Zod `z.infer`로 파생, 동일 개념 중복 선언 금지

---

## 미해결/확인 필요 (진행 중 재확인)
- [ ] 시세 API 공급자 최종 확정 (FMP vs Finnhub) — 무료 티어 한도 비교
- [ ] 환율 API 공급자 최종 확정 (exchangerate.host 등)
- [x] Firebase App Hosting Next.js 16 Deployment Adapter 실제 배포 테스트 (16.2+ 기준선 확인됨, 프로젝트는 16.3.0 — P0~P4 로컬소스 배포로 검증 완료)
- [ ] `ANTHROPIC_API_KEY` 실제 키 발급 및 등록 (P6 로직은 완성, 키만 넣으면 동작)
- [ ] App Hosting ↔ GitHub 자동배포 연결 (§14.2) — P0에서 보류된 상태 그대로, gppc5096 계정으로만 로그인한 브라우저에서 재시도 필요
