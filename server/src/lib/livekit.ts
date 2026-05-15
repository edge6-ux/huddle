import { AccessToken } from "livekit-server-sdk";

export function createToken(
  roomName: string,
  participantName: string,
  participantId: string,
  metadata?: string,
  canPublish = true
) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API key and secret must be configured");
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    metadata,
    ttl: "4h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish,
    canSubscribe: true,
    canPublishData: true,
    canPublishSources: undefined,
  });

  return token.toJwt();
}
