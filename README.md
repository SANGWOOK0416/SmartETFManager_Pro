# 📊 Smart ETF Manager Pro
> **실시간 데이터 분석 기반의 지능형 ETF 포트폴리오 관리 플랫폼**

단순한 자산 기록을 넘어, 실시간 시장 데이터를 바탕으로 포트폴리오의 **리스크를 진단**하고 **섹터 비중을 분석**하여 투자 의사결정을 돕는 풀스택 웹 애플리케이션입니다.

## ✨ 핵심 기능 (Key Features)
- **실시간 P&L 대시보드:** Yahoo Finance API 연동을 통한 실시간 수익률 및 평가 손익 계산
- **스마트 리스크 스코어링:** 보유 종목의 변동성 데이터를 기반으로 포트폴리오 위험도(1~10점) 산출
- **섹터 분산도 시각화:** 포트폴리오의 산업군(Tech, Dividend, Bond 등) 쏠림 현상을 Pie Chart로 분석
- **수익률 정규화 비교:** 서로 다른 가격대의 ETF 성과를 시작점 기준(0%)으로 변환하여 오버레이 차트 제공
- **데이터 기반 AI 인사이트:** 수익률 및 리스크 지표를 분석하여 자연어 형태의 투자 조언 자동 생성
- **성능 최적화:** `node-cache`를 활용한 인메모리 캐싱으로 API 호출 속도 개선 및 서버 과부하 방지

## 🛠 Tech Stack
- **Frontend:** React, Recharts, React-Toastify
- **Backend:** Node.js, Express, MySQL, Yahoo-Finance2
- **Database:** MySQL (Portfolio CRUD & Average Price Logic)

## 🚀 Troubleshooting (문제 해결 경험)
- **CORS 에러 해결:** 프론트엔드 직접 호출 방식에서 Node.js 프록시 서버 아키텍처로 전환하여 보안 및 통신 이슈 해결
- **API 버전 마이그레이션:** `yahoo-finance2` 라이브러리의 v3 업데이트에 따른 데이터 파싱 이슈를 직접 가공 로직으로 해결
- **데이터 무결성 유지:** 추가 매수 시 평단가 계산 로직을 서버 단에서 처리하여 DB 정합성 확보