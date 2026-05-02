import { faqResponses, faqSuggestions } from "../mockData";

const fallbackAnswer = "🤔 No tengo una respuesta exacta para eso, pero puedes preguntar en el chat grupal o escribir a **secretaria@uni.edu**. También puedo ayudarte con: biblioteca, cafetería, certificados, wifi, matrícula, horarios o ubicaciones.";

export async function listFaqSuggestions() {
  return faqSuggestions;
}

export function getBotAnswer(question: string) {
  const lower = question.toLowerCase();
  const response = faqResponses.find((item) =>
    item.keywords.some((keyword) => lower.includes(keyword)),
  );

  return response?.answer ?? fallbackAnswer;
}
