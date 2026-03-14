# 🏛️ Smart ETF Portfolio Visualizer - 시스템 설계도

## 1. 시스템 아키텍처 (System Architecture)
* **Client (Frontend):** React.js (컴포넌트 기반 UI 구성 및 상태 관리)
* **Data Visualization:** Recharts (React 전용 데이터 시각화 라이브러리 활용)
* **Server (Backend / Data Source):** Finnhub REST API 연동을 통한 실시간 금융 데이터 Fetching
* **Version Control:** GitHub (소스코드 백업 및 마크다운 기반 산출물 관리)

## 2. React 컴포넌트 구조 (Component Tree)
화면의 재사용성과 상태(State) 관리를 최적화하기 위해 다음과 같이 컴포넌트를 분리하여 설계한다.

```text
App (최상위 부모 컴포넌트)
 ├── Header (타이틀 및 네비게이션)
 └── Dashboard (메인 화면 컴포넌트)
      ├── PortfolioInput (사용자 입력 폼: ETF 티커 및 수량 입력)
      ├── AssetSummary (총 자산 가치 및 예상 배당금 텍스트 출력)
      └── PieChartDisplay (Recharts를 활용한 포트폴리오 비중 시각화 영역)
