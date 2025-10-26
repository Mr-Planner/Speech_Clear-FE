## Libraries

**Core features Library**

`npm install react-router-dom` : 리액트 라우터

`npm install @reduxjs/toolkit react-redux` : 전역 상태 관리

`npm install @tanstack/react-query` : 서버 상태 관리, 데이터 캐싱

`npm install axios` : API 요청 관리

`npm install -D msw` : API mockiing

`npm install dayjs` : 날짜표시

**UI & Style**

`npm i tailwindcss @tailwindcss/vite` : tailwindcss 사용

`npm install clsx` : 조건부 className 기능

`npm install react-icons` : 아이콘 넣기

`npm i chart.js react-chartjs-2 chartjs-plugin-streaming` : chart.js 사용 (실시간 dB그래프)

`npm i wavesurfer.js` : 파형 시각화 (녹음시에)

## 📂 Project Structure

src/

├── assets/ # 이미지, 아이콘, 폰트, static 리소스

├── components/ # 재사용 가능한 UI 컴포넌트

├── constants/ # 상수 정의

├── hooks/ # 커스텀 훅

├── pages/ # 라우팅 단위 페이지

├── services/ # API 통신, axios instance, 데이터 fetch 로직

├── store/ # Redux Toolkit slice, store 설정

├── styles/ # 전역 스타일, 테마, reset.css 등

├── tests/ # 단위 테스트 (Jest/RTL)

├── utils/ # 유틸리티 함수 (공용 함수)
