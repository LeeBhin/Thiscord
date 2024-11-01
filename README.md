# Thiscord Frontend

Thiscord 프론트엔드는 **Next.js**와 **Socket.IO**로 구현된 Discord 클론 프로젝트입니다.

[프론트엔드 배포 URL](https://smcthiscord.netlify.app/)

## 주요 기능

- **회원가입 및 로그인**: 사용자가 계정을 생성하고 JWT를 통해 인증된 세션을 유지
- **실시간 채팅**: Socket.IO를 통한 실시간 메시지 송수신, 메시지 수정 및 삭제 가능
- **친구 관리**: 친구 추가/삭제 및 친구 요청 기능
- **친구 추천**: Neo4j 기반의 친구 추천 기능
- **웹 푸시 알림**: 메시지와 주요 이벤트에 대한 브라우저 푸시 알림 제공

## 기술 스택

- **Next.js**
- **Socket.IO**
- **Redux**
- **Framer Motion**
