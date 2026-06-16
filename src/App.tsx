import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  RELATIONS,
  softenMessage,
  type RelationKey,
  type SoftenResult,
} from "./services/messageSoftener";
import "./App.css";

const MAX_LEN = 200;

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
  const [relationKey, setRelationKey] = useState<RelationKey>("friend");
  const [customLabel, setCustomLabel] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoftenResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const relation = RELATIONS.find((r) => r.key === relationKey)!;

  const toneLabel =
    relation.key === "custom" && customLabel.trim().length > 0
      ? customLabel.trim()
      : relation.label;

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
    <>
      {/* 헤더 */}
      <header className="mt-header">
        <div className="mt-header__side" />
        <div className="mt-header__brand">
          <div className="mt-header__logo">💬</div>
          <div className="mt-header__title">말랑톡</div>
        </div>
        <div className="mt-header__side" />
      </header>

      <div className="mt-body">
        {/* 대상 선택 */}
        <section>
          <h2 className="mt-section-title">대상 선택</h2>
          <div className="mt-targets">
            {RELATIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`mt-target${
                  r.key === relationKey ? " is-active" : ""
                }`}
                onClick={() => setRelationKey(r.key)}
              >
                <span className="mt-target__icon">{r.icon}</span>
                <span className="mt-target__label">{r.label}</span>
              </button>
            ))}
          </div>
        </section>

        {relationKey === "custom" && (
          <input
            className="mt-custom-input"
            placeholder="누구에게 보내나요? (예: 팀장님, 후배)"
            value={customLabel}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCustomLabel(e.target.value)
            }
          />
        )}

        {/* 원문 입력 */}
        <section className="mt-card">
          <h3 className="mt-card__title">원문 입력</h3>
          <div className="mt-textarea-wrap">
            <textarea
              className="mt-textarea"
              placeholder="하고 싶었던 말을 그대로 적어주세요. 직설적이어도 괜찮아요. 말랑톡이 부드럽게 바꿔드려요."
              value={message}
              maxLength={MAX_LEN}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
            />
            <div className="mt-textarea-footer">
              <span className="mt-counter">
                {message.length}/{MAX_LEN}
              </span>
              {message.length > 0 && (
                <button
                  type="button"
                  className="mt-clear"
                  aria-label="지우기"
                  onClick={() => setMessage("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 변환하기 */}
        <button
          type="button"
          className="mt-submit"
          onClick={onSubmit}
          disabled={loading || message.trim().length === 0}
        >
          {loading ? (
            <>
              <span className="mt-spinner" />
              다듬는 중…
            </>
          ) : (
            <>✨ 변환하기</>
          )}
        </button>

        {/* 변환 결과 */}
        {result && (
          <section className="mt-card">
            <div className="mt-result__head">
              <h3 className="mt-result__title">
                변환 결과{" "}
                <span className="mt-result__tone">({toneLabel} 말투)</span>
              </h3>
              {result.text && (
                <div className="mt-result__actions">
                  <button
                    type="button"
                    className="mt-action"
                    onClick={() => copyText(result.text)}
                  >
                    📋 복사
                  </button>
                  <button
                    type="button"
                    className="mt-action"
                    onClick={() => shareText(result.text)}
                  >
                    📤 공유하기
                  </button>
                </div>
              )}
            </div>
            {result.banner && <p className="mt-banner">{result.banner}</p>}
            {result.text && <div className="mt-result__box">{result.text}</div>}
          </section>
        )}

        {/* TIP */}
        <section className="mt-tip">
          <div className="mt-tip__title">💡 TIP</div>
          <p className="mt-tip__text">
            상황에 맞는 말투로 변환해드려요!
            <br />
            기타를 선택하면 AI가 자연스럽게 판단해요.
          </p>
        </section>
      </div>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}

export default App;
