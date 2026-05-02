import { describe, expect, it } from "vitest";
import { GroupMessageSchema, SendGroupMessageInputSchema } from "./schemas";

describe("chat schemas", () => {
  it("validates incoming group messages", () => {
    const message = GroupMessageSchema.parse({
      id: "m1",
      sender_id: "u1",
      sender_name: "Ana Torres",
      sender_avatar: null,
      content: "Hola",
      created_at: new Date().toISOString(),
    });

    expect(message.id).toBe("m1");
  });

  it("rejects empty outbound messages", () => {
    expect(() =>
      SendGroupMessageInputSchema.parse({
        senderId: "u1",
        senderName: "Ana Torres",
        senderAvatar: null,
        content: "   ",
      }),
    ).toThrow();
  });
});
