import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  RELATIONS,
  softenMessage,
  type RelationKey,
  type SoftenResult,
} from "./services/messageSoftener";
import "./App.css";

// 클립보드 복사: 최신 Clipboard API 우선, 안 되면 execCommand 폴백.
// 성공 여부를 boolean 으로 돌려줘서 호출 측이 안내를 띄울 수 있게 함.
async function copyToClipboard(text: string): Promise<boolean> {
  // HTTPS(또는 localhost) 보안 컨텍스트에서만 동작
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한 거부 등 → 아래 폴백으로
    }
  }

  // 구형 브라우저 / 비보안 컨텍스트 폴백
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "0";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

function App() {
  const [relationKey, setRelationKey] = useState<RelationKey>("father");
  const [customLabel, setCustomLabel] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoftenResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const relation = RELATIONS.find((r) => r.key === relationKey)!;

  function showToast(text: string) {
    setToast(text);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  async function onSubmit() {
    setLoading(true);
    setResult(null);
    const out = await softenMessage(relation, customLabel, message);
    setResult(out);
    setLoading(false);
  }

  async function copyText(text: string) {
    const ok = await copyToClipboard(text);
    showToast(ok ? "복사했어요" : "복사에 실패했어요");
  }

  async function shareText(text: string) {
    // 모바일 웹/지원 데스크톱: 네이티브 공유 시트
    if (typeof navigator.share === "function") {
      const payload = { text };
      // canShare 가 있으면 미리 검증 (없으면 그냥 시도)
      const canShare =
        typeof navigator.canShare !== "function" || navigator.canShare(payload);
      if (canShare) {
        try {
          await navigator.share(payload);
          return; // 공유 성공
        } catch (err) {
          // 사용자가 공유를 취소한 경우는 복사로 넘기지 않고 조용히 종료
          if (err instanceof DOMException && err.name === "AbortError") return;
          // 그 외 오류는 아래 복사 폴백으로
        }
      }
    }

    // 공유 미지원(대부분의 PC 브라우저) → 클립보드 복사 + 안내
    const ok = await copyToClipboard(text);
    showToast(ok ? "공유 기능이 없어 복사했어요" : "복사에 실패했어요");
  }

  return (
    <div className="app">
      <header className="app__top">
        <h1 className="app__title">말랑톡</h1>
        <p className="app__subtitle">보내기 전에, 한 번만 눌러보세요</p>
      </header>

      <div>
        <p className="label">누구에게 보낼 말이에요?</p>
        <div className="segmented" role="tablist">
          {RELATIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={relationKey === r.key}
              className={
                "segmented__item" +
                (relationKey === r.key ? " segmented__item--active" : "")
              }
              onClick={() => setRelationKey(r.key)}
            >
              {r.label.replace("에게", "")}
            </button>
          ))}
        </div>
      </div>

      {relationKey === "custom" && (
        <div className="field">
          <label className="field__label" htmlFor="custom-label">
            누구에게 보내나요?
          </label>
          <input
            id="custom-label"
            className="field__input"
            type="text"
            placeholder="예: 팀장님, 친구, 형"
            value={customLabel}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCustomLabel(e.target.value)
            }
          />
        </div>
      )}

      <div className="field">
        <label className="field__label" htmlFor="message">
          하고 싶은 말
        </label>
        <textarea
          id="message"
          className="field__textarea"
          placeholder="원래 하고 싶었던 말을 그대로 적어주세요. 직설적이어도 괜찮아요. 말랑톡이 부드럽게 바꿔드려요."
          value={message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setMessage(e.target.value)
          }
        />
      </div>

      <button
        type="button"
        className="btn btn--block"
        onClick={onSubmit}
        disabled={loading || message.trim().length === 0}
      >
        {loading ? "다듬는 중…" : "말 부드럽게 바꾸기"}
      </button>

      {result && (
        <div className="result">
          {result.banner && <p className="banner">{result.banner}</p>}
          {result.text && (
            <>
              <div className="result__text">{result.text}</div>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn--block"
                  onClick={() => copyText(result.text)}
                >
                  복사하기
                </button>
                <button
                  type="button"
                  className="btn btn--block"
                  onClick={() => shareText(result.text)}
                >
                  공유하기
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
