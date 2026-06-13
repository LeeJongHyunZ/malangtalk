// Google Gemini 무료 API 키: https://aistudio.google.com 에서 발급
// .env.local 의 VITE_GEMINI_API_KEY 로 주입됩니다.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export type RelationKey =
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "spouse"
  | "custom";

export interface Relation {
  key: RelationKey;
  label: string;
  toneHint: string;
}

export const RELATIONS: Relation[] = [
  {
    key: "father",
    label: "아빠에게",
    toneHint:
      "공손하지만 딱딱하지 않은 해요체. '아빠'라는 호칭을 문장 안에 자연스럽게 배치해 거리감을 줄이기. 감사·미안함·걱정 같은 감정을 직접 꺼내되 과장 없이 담백하게 전달. '~했어요', '~인 것 같아요', '~하고 싶어요' 같은 부드러운 종결어미 활용. 지시나 요구보다 마음을 먼저 꺼내는 구조로 작성. 아빠가 부담을 느끼지 않도록 결론보다 감정을 앞에 배치. 짧은 문장과 긴 문장을 섞어 자연스러운 말투 유지. 격식체(합쇼체)는 사용하지 않음.",
  },
  {
    key: "mother",
    label: "엄마에게",
    toneHint:
      "살갑고 따뜻한 해요체. '엄마'라는 호칭을 자주 활용해 친밀감 형성. 감정을 숨기지 않고 자연스럽게 꺼내는 어조로, 기쁨·고마움·미안함을 직접 표현. '걱정하지 마요', '잘 지내고 있어요' 같은 안심 문장을 흐름 안에 자연스럽게 포함. 짧은 애정 표현을 문장 끝에 얹되 작위적으로 느껴지지 않게 배치. 엄마의 수고와 마음을 먼저 알아주는 문장 구조. 길고 딱딱한 문어체 표현 피하고, 말하듯 쓰는 구어체 리듬 유지.",
  },
  {
    key: "son",
    label: "아들에게",
    toneHint:
      "훈계·명령·잔소리 없는 수평적 반말. 아들의 선택과 감정을 인정하는 전제 위에서 말을 얹는 구조. '~하면 좋겠어', '~어때?', '~해줄 수 있어?' 같은 권유·제안형 종결어미 사용. 같은 말을 반복 강조하는 방식 금지. 발화자가 부모인 것은 맥락상 자명하므로 '엄마는~', '아빠는~' 같은 자기 호칭은 절대 새로 만들어 넣지 말 것 — 원본에 없으면 1인칭(나)이나 주어 생략으로 처리. 아들이 스스로 생각하고 결정할 수 있다는 신뢰를 문장에 녹이기. 짧고 여운 있는 문장으로 마무리해 강요처럼 들리지 않게.",
  },
  {
    key: "daughter",
    label: "딸에게",
    toneHint:
      "다정하고 포근한 반말. 비교·평가·기대치 표현 없이 있는 그대로를 인정하는 어조. '잘하고 있어', '네가 선택한 거 믿어', '네 편이야' 같은 지지·공감 표현을 자연스럽게 배치(단 '엄마는 네 편이야', '아빠가 네 편이야'처럼 발화자 호칭은 넣지 말고 '네 편이야'로만). 감정에 먼저 공명한 뒤 하고 싶은 말을 건네는 구조. 발화자가 부모인 것은 맥락상 자명하므로 '엄마는~', '아빠는~' 같은 자기 호칭은 절대 새로 만들어 넣지 말 것 — 원본에 없으면 1인칭(나)이나 주어 생략으로 처리. 딸이 부담이나 죄책감을 느낄 수 있는 표현 제거. 따뜻하되 가볍지 않고, 진심이 느껴지는 어조 유지. 문장 끝에 짧은 애정 표현이나 응원 한 마디 얹기.",
  },
  {
    key: "spouse",
    label: "배우자에게",
    toneHint:
      "동등하고 다정한 반말 또는 해요체. 상대를 탓하거나 평가하는 표현 완전 제거. '나는 ~했어', '나는 ~게 느꼈어' 나-전달법(I-message) 구조로 감정 전달. 결론보다 감정을 먼저, 요구보다 바람을 표현하는 순서 유지. 협력·제안형 어조로 함께 해결하자는 뉘앙스 유지. 상대의 입장을 먼저 인정하는 문장을 앞에 배치. 오래 함께한 사람에게 건네는 편안하고 솔직한 말투. 감정이 쌓여 터지는 방식이 아닌, 차분하게 꺼내는 구조.",
  },
  {
    key: "custom",
    label: "기타",
    toneHint:
      "사용자가 지정한 관계 라벨을 기준으로 호칭·어조·존댓말 여부를 자동 조정. 관계가 수평적이거나 가까울수록 반말, 위계나 나이 차이가 있을수록 해요체를 기본 적용. 모든 관계에 공통 적용되는 5가지 원칙: ①단정·비난·평가형 표현 제거 — '왜 그랬어', '그건 잘못이야' 같은 표현 대신 감정과 상황 중심으로 재구성. ②나-전달법(I-message) 우선 — '네가 ~해서 힘들어' 대신 '나는 ~할 때 마음이 힘들었어' 구조. ③상대 입장 먼저 인정 — 내 말을 꺼내기 전에 상대의 감정이나 상황을 먼저 알아주는 문장 배치. ④종결어미는 강요·명령형 대신 권유·바람형 — '해야 해' 대신 '하면 좋겠어', '해줄 수 있어?' ⑤호칭을 문장 안에 자연스럽게 배치 — 호칭 한 번 이상 사용해 거리감 줄이기. 진심이 느껴지는 어조이되 과장된 위로나 감정 과잉 표현은 최소화. 관계별 맥락이 불분명할 경우, 가장 보편적으로 따뜻하고 존중하는 어조를 기본값으로 사용.",
  },
];

const PROMPT_TEMPLATE = (
  relationLabel: string,
  toneHint: string,
  message: string,
) => `
당신은 한국 가족·가까운 사이의 갈등이 잦은 대화를 부드럽게 풀어주는 대화 코치예요.

[변환 원칙]
1. ★최우선 규칙★ 발화자(말하는 사람)의 역할·성별·관계를 임의로 추정해서 3인칭으로 지칭하지 마세요. "엄마는~", "엄마가~", "아빠는~", "아빠가~", "형은~", "누나가~" 같은 자기 호칭이 원본에 명시되어 있지 않다면 절대로 새로 만들어 넣지 마세요. 1인칭("나는~", "내가~")으로 말하거나 주어를 생략하세요.
   - 예시 1: 원본 "딸 옷 좀 단정하게 입자" → ❌ "엄마는 네가 단정하게 입었으면 좋겠어" / ✅ "네가 좀 더 단정하게 입어줬으면 좋겠어"
   - 예시 2: 원본 "너는 옷을 왜 그렇게 짧게 입니?" → ❌ "엄마는 항상 네 편인 거 알지?" / ✅ "항상 네 편이야"
   - 예시 3: 원본 "공부 좀 해라" → ❌ "아빠가 너 걱정돼서 그래" / ✅ "걱정돼서 그래"
2. 비난·명령·부정적 단정·과거 들춰내기 표현을 부드럽게 바꿔요.
3. "나-전달법"을 살려, 상대를 탓하기보다 내 감정과 바람을 솔직하게 드러내요.
4. 위 [대상에 맞는 톤]에 정확히 맞춰 작성해요.
5. 원본 메시지의 핵심 의도와 진심은 그대로 유지해요.
6. 길이는 자연스럽게, 보통 2~4문장 이내.
7. 이모지·과한 꾸밈은 넣지 않아요.
8. 결과는 변환된 메시지 본문만, 따옴표·해설·머리말 없이 한 단락으로만 출력해요.

[전달 대상]
${relationLabel}

[대상에 맞는 톤]
${toneHint}

[사용자가 하고 싶은 말 (원본)]
"${message}"

[최종 확인]
출력하기 직전에 한 번 더 점검: 내가 만든 문장에 원본에 없던 "엄마", "아빠", "형", "누나", "오빠", "언니" 같은 발화자 자기 호칭이 들어있지는 않은지 확인하고, 있으면 제거한 뒤 출력하세요.

[출력]
`.trim();

async function callGeminiRaw(promptText: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.6,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("빈 응답");
  return text.trim().replace(/^["']|["']$/g, "");
}

const SPEAKER_SELF_REF_RE =
  /(엄마|아빠|아버지|어머니|형|누나|오빠|언니|동생)(은|는|이|가)/;

function hasUnwantedSelfRef(output: string, originalMessage: string): boolean {
  const match = output.match(SPEAKER_SELF_REF_RE);
  if (!match) return false;
  const word = match[1];
  return !originalMessage.includes(word);
}

async function callGemini(
  relationLabel: string,
  toneHint: string,
  message: string,
): Promise<string> {
  const basePrompt = PROMPT_TEMPLATE(relationLabel, toneHint, message);
  const first = await callGeminiRaw(basePrompt);
  if (!hasUnwantedSelfRef(first, message)) return first;

  const retryPrompt = `${basePrompt}

[직전 시도에서 발생한 오류]
방금 출력에 원본에 없던 발화자 자기 호칭(예: "엄마는", "아빠가" 등)이 포함되었어요. 이번에는 반드시 발화자 자기 호칭을 1인칭이나 주어 생략으로 처리해서 다시 출력해 주세요. 직전 출력: "${first}"`;
  const retry = await callGeminiRaw(retryPrompt);
  return retry;
}

export interface SoftenResult {
  ok: boolean;
  text: string;
  banner?: string;
}

export async function softenMessage(
  relation: Relation,
  customLabel: string,
  message: string,
): Promise<SoftenResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, text: "", banner: "먼저 하고 싶은 말을 적어주세요." };
  }

  const effectiveLabel =
    relation.key === "custom" && customLabel.trim().length > 0
      ? `${customLabel.trim()}에게`
      : relation.label;

  if (!GEMINI_API_KEY) {
    return {
      ok: false,
      text: trimmed,
      banner:
        "⚠️ AI 변환 키가 설정되지 않아 원본을 그대로 보여드려요. (.env.local 의 VITE_GEMINI_API_KEY 설정 필요)",
    };
  }

  try {
    const text = await callGemini(effectiveLabel, relation.toneHint, trimmed);
    return { ok: true, text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("Gemini 호출 실패:", err);
    const isQuota = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
    const banner = isQuota
      ? "✨ 오늘 AI 변환 한도를 모두 사용했어요. 내일 오후 5시 이후 다시 시도해 주세요. 아래는 원본 메시지예요."
      : "⚠️ 일시적인 문제로 변환에 실패했어요. 잠시 후 다시 시도해 주세요. 아래는 원본 메시지예요.";
    return { ok: false, text: trimmed, banner };
  }
}
