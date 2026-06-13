import { useState, type ChangeEvent } from "react";
import {
  RELATIONS,
  softenMessage,
  type RelationKey,
  type SoftenResult,
} from "./services/messageSoftener";
import "./App.css";

function App() {
  const [relationKey, setRelationKey] = useState<RelationKey>("father");
  const [customLabel, setCustomLabel] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoftenResult | null>(null);

  const relation = RELATIONS.find((r) => r.key === relationKey)!;

  async function onSubmit() {
    setLoading(true);
    setResult(null);
    const out = await softenMessage(relation, customLabel, message);
    setResult(out);
    setLoading(false);
  }

  function copyText(text: string) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      // ignore
    }
    document.body.removeChild(ta);
  }

  async function shareText(text: string) {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
    } catch {
      // 사용자 취소 또는 비지원
    }
    copyText(text);
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
    </div>
  );
}

export default App;
