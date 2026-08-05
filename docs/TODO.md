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
- [ ] `etfs.ts` — ETF 10종 마스터 (§3 표: 그룹/티커/명칭/폴백 배당률/과세유형)
- [ ] `countries.ts` — 국가·통화 18종 (§6.4)
- [ ] `taxPresets.ts` — 국가별 세율 프리셋
- [ ] `fallbackQuotes.ts` — API 실패 시 폴백 배당률
- [ ] `constants.ts` — 매직넘버 명명 상수 (15% 원천징수, 24h/12h 캐시 TTL 등) (§5.1 규칙6)

### 계산 함수 — `lib/calc/` (React·Firebase·fetch import 금지)
- [ ] `allocate.ts` — 자동 배분 알고리즘 STEP1~6 (§6.2)
  - STEP4 동률 처리: 배당률 내림차순, 동률 시 티커 알파벳 오름차순
  - STEP5 이동 단위 1%p, 목표 달성 시점 즉시 정지, 나스닥 상한 70%(주식군 기준)
  - 가드레일: 단일 종목 40% 상한, 그룹 최소 5%(채권 0% 예외), 비중 합계 정확히 100%
- [ ] `tax.ts` — 미국 원천징수 + 거주국 세금, `withholdingExempt`/`creditForeignTax` 분기 (§6.3)
- [ ] `income.ts` — 연/월 세전·세후 산출
- [ ] `currency.ts` — 통화 변환 (내부 계산은 USD 기준, 표시 직전 변환) (§6.4)
- [ ] `feasibility.ts` — 달성 판정 + 미달 시 최대가능액·필요원금 역산·조정 제안
- [ ] `index.ts` — `runPortfolio` 파이프라인 조립

### 스키마·타입
- [ ] `lib/schema/portfolioInput.ts` — Zod 스키마 (`PortfolioInput`/`PortfolioResult` 타입 원천, §6.1)
- [ ] `lib/types/{etf,result,scenario}.ts`

### 단위 테스트 (§13.1) — 전부 통과해야 P1 완료
- [ ] 균등분산으로 목표 달성 → STEP3에서 확정되는가
- [ ] 목표 미달 → 상위 2종목 압축(STEP4) 후 달성되는가
- [ ] 나스닥 상한 70%를 넘지 않는가
- [ ] STEP4 배당률 동률 시 티커 알파벳순으로 동일하게 재현되는가
- [ ] STEP5에서 목표 달성 시점(1%p 단위)에 정확히 정지하는가
- [ ] SGOV 원천징수 면제가 반영되는가
- [ ] 외국납부세액공제 on/off 결과 차이가 있는가
- [ ] 비중 합계가 항상 정확히 100%인가
- [ ] 수동 모드에서 합계 99.9% 입력 시 검증 오류가 나는가
- [ ] **완료 기준**: 테스트 케이스 전부 통과 (계산만으로 결과 도출 가능)

---

## P2. 시세·환율 연동 (§4.2, §11)
- [ ] `src/app/api/quotes/route.ts` — Firestore 캐시(24h) → 외부 API → 정적 폴백 3단 계층
- [ ] `src/app/api/fx/route.ts` — 캐시(12h) → 외부 API → 폴백, `?symbols=` 쿼리 지원
- [ ] `lib/market/{quotesProvider,fxProvider,cache}.ts` — 파일 최상단 `import 'server-only'`
- [ ] 환경변수 등록: `MARKET_API_KEY`, `FX_API_KEY` (`.env.local`, 클라이언트 번들 노출 금지)
- [ ] 폴백 사용 시 UI 배지 문구 연동 준비 ("실시간 시세 연결 실패 — 참고값으로 계산됨")
- [ ] **완료 기준**: API 차단 상태에서도 폴백으로 정상 동작

---

## P3. 위저드 UI (§7, §5 디렉토리)
- [ ] `store/wizardStore.ts` — Zustand 단일 스토어
- [ ] `components/wizard/WizardShell.tsx` — 단계 전환 컨테이너
- [ ] Step 0 `StepModeSelect.tsx` — 자동/수동 선택
- [ ] Step 1 `StepPrincipal.tsx` — 총 투자금
- [ ] Step 2 `StepTargetIncome.tsx` — 목표 월 세후 수령액
- [ ] Step 3 `StepCountry.tsx` — 국가/통화 선택 (한국·미국 고정 + 1개국), 세율 프리셋 자동 채움 트리거
- [ ] Step 4 `StepTaxAndFx.tsx` — 세율·환율 확인/수정
- [ ] Step 5-A `StepBondSlider.tsx` — 채권 비중 슬라이더 (자동 모드, 기본 20%, 0~50%)
- [ ] Step 5-B `StepManualPicker.tsx` — 종목 선택 + 비중 입력 (합 100% 검증)
- [ ] `components/status/StatusBox.tsx` — 누적 요약, 모바일 sticky 접이식 / 데스크톱 사이드 고정, 클릭 시 해당 단계로 복귀
- [ ] `hooks/{useAnonUser,useQuotes,useFxRates,usePortfolioResult}.ts`
- [ ] **완료 기준**: 입력 → 결과 객체 생성까지 연결

---

## P4. 결과 화면 (§8)
- [ ] `ResultSection.tsx` — 결과 영역 조립
- [ ] `FeasibilityAlert.tsx` — 달성(초록)/미달(주황) 배너, 미달 시 대안 2가지(최대가능액+필요원금, 조정 제안) 반드시 동시 표기
- [ ] `AllocationTable.tsx` + `AllocationChart.tsx` (Recharts 도넛)
- [ ] `IncomeByCurrencyTable.tsx` — 국가별 연/월 세전·세후 테이블 (★ 핵심 산출물), 목표 대비 달성률 배지
- [ ] `TaxBreakdown.tsx`
- [ ] `CommentaryCard.tsx` 자리 표시 (내용은 P6에서 연결)
- [ ] 모바일 `md` 미만에서 통화별 카드 스택으로 전환 (가로 스크롤 금지)
- [ ] **완료 기준**: 모바일 카드 전환 확인

---

## P5. 저장/삭제 (§9, §10)
- [ ] `lib/firebase/{client,admin,anonAuth,scenarios}.ts`
- [ ] 앱 최초 진입 시 `signInAnonymously()` 자동 호출
- [ ] `SaveScenarioDialog.tsx` — 제목 입력 모달, 기본값 자동 제안
- [ ] `src/app/saved/page.tsx` + `SavedScenarioTable.tsx` — 저장 목록 테이블
- [ ] `DeleteConfirmDialog.tsx` (AlertDialog) — 삭제 확인 → 토스트
- [ ] "보기" 클릭 시 저장된 입력값으로 위저드 복원 → 재계산
- [ ] Firestore 보안 규칙 배포 (§10.2 — `marketData`는 서버만 write, `scenarios`는 소유자만 read/write)
- [ ] `/saved` 상단 익명 인증 한계 고지 문구 1줄
- [ ] **완료 기준**: 저장·목록·삭제·복원 동작

---

## P6. AI 총평 (§8.3, §11)
- [ ] `src/app/api/commentary/route.ts` (타임아웃 20s)
- [ ] `lib/ai/{commentary,prompt}.ts` — 프롬프트 템플릿 분리
- [ ] 프롬프트 규칙: 숫자 재생성 금지(전달받은 값만 인용), 커버드콜 원금 변동 위험 1문장 필수 포함
- [ ] `CommentaryCard.tsx` 완성 — 실패 시 "다시 시도" 버튼, 결과 테이블은 그대로 유지
- [ ] `ANTHROPIC_API_KEY` 환경변수 등록, 구현 시점 최신 모델 ID로 재확인 (§4.1 — 현재 표기: `claude-sonnet-5`)
- [ ] **완료 기준**: 총평 생성 실패 시에도 앱 정상 동작

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
- [ ] Firebase App Hosting Next.js 16 Deployment Adapter 실제 배포 테스트 (16.2+ 기준선 확인됨, 프로젝트는 16.3.0)
