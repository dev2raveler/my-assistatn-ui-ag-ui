# `pnpm dev` 오류 단일 스레드 복구 계획

## Summary

- `pnpm dev` 자체는 샌드박스 밖에서 정상 기동되지만 `/` 요청이 500으로 실패합니다.
- 근본 원인은 `app/MyRuntimeProvider.tsx`의 experimental `threadList` adapter입니다. `useAgUiRuntime`이 `threadId`만 core로 넘기고 필요한 `threads` 목록은 전달하지 않아 `Entry not available in the store`가 발생합니다.
- 우선 multi-thread 기능을 제거하고 단일 AG-UI 채팅 런타임을 안정화합니다.

## Key Changes

- `app/MyRuntimeProvider.tsx`에서 `threadsRef`, `currentThreadId` 전환 로직, `threadListAdapter`, runtime 구독 저장 로직을 제거합니다.
- `HttpAgent`에는 provider mount 동안 고정되는 단일 `threadId`만 전달합니다.
- `useAgUiRuntime` 호출에서 `adapters.threadList`를 제거해 assistant-ui core의 기본 single-thread store를 사용합니다.
- `app/page.tsx`에서 `NewThreadButton`과 `aui.threads().switchToNewThread()` 호출을 제거합니다.

## Interfaces

- 외부 API나 환경 변수 변경 없음.
- `NEXT_PUBLIC_AGUI_AGENT_URL` 기본값 `http://localhost:8000/agent` 유지.
- 사용자-facing 변경: `New Thread` 버튼은 단일 스레드 복구 범위에서 사라집니다.

## Test Plan

- `pnpm exec tsc --noEmit` 통과 확인.
- `pnpm dev` 실행 후 `http://localhost:3000` 요청이 200으로 응답하는지 확인.
- dev 로그에 `Entry not available in the store`가 더 이상 나오지 않는지 확인.
- 기본 채팅 화면 렌더링과 메시지 전송 UI가 유지되는지 브라우저에서 확인.

## Assumptions

- 이번 수정의 목표는 먼저 `/` 500을 없애고 기본 채팅을 살리는 것입니다.
- multi-thread 복원은 별도 작업으로 다룹니다. 그 경우 `@assistant-ui/react-ag-ui`의 현재 `threadList` 포장 방식 때문에 더 낮은 레벨 runtime 구성 또는 upstream 업데이트 검토가 필요합니다.
