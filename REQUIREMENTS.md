# 📊 Smart ETF Portfolio Visualizer - 요구사항 정의서

## 1. 프로젝트 개요
  프로젝트명: Smart ETF Portfolio Visualizer
  목적: 사용자가 보유한 주요 미국 ETF(VOO, JEPI, QQQ 등)의 실시간 가치를 분석하고, 자산 비중을 시각화하여 직관적인 투자 인사이트를 제공하는 브라우저 기반 웹 애플리케이션.

## 2. 핵심 요구사항 (Functional Requirements)
  1. 실시간 주가 조회: 사용자가 입력한 ETF 티커(Ticker)를 기반으로 현재 주가(Current Price)를 실시간으로 가져와야 한다.
  2. 포트폴리오 비중 시각화: 사용자가 입력한 각 ETF의 보유 수량과 실시간 주가를 곱하여 총자산을 계산하고, 각 종목이 차지하는 비중을 파이 차트(Pie Chart)로 렌더링해야 한다.
  3. 수익 및 배당금 예측: 과거 데이터 또는 평균 배당률을 기반으로 예상 배당 수익을 계산하여 텍스트로 제공해야 한다.

## 3. 비기능적 요구사항 (Non-Functional Requirements)
  프론트엔드 환경: React 기반의 Single Page Application(SPA) 구성
  반응형 UI: 데스크톱 및 모바일 브라우저 환경을 모두 지원하는 반응형 웹 레이아웃 적용

## 4. REST API 명세서 (Finnhub 연동)
  Base URL: `https://finnhub.io/api/v1`
  인증 방식: API Key를 쿼리 파라미터(`&token=YOUR_API_KEY`)로 포함하여 전송

## 4.1. 실시간 주가 조회 (Quote API)
  Endpoint: `/quote`
  Method: `GET`
  Parameters:
    * `symbol` (Required): 조회할 주식/ETF 티커 (예: `VOO`, `QQQ`)
    * `token` (Required): 발급받은 Finnhub API Key
  Response Data (주요 항목):**
    * `c`: Current price (현재가)
    * `d`: Change (변동폭)
    * `dp`: Percent change (변동률)
