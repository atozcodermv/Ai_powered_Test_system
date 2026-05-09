import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { config } from "../ConsantsFile/Constants";

const baseUrl = config.url.BASE_URL.replace(/\/api$/, "");

export const createChatClient = ({
  token,
  userId,
  role,
  onMessage,
  onPresence,
  onConnect,
  onDisconnect,
  onError,
}) => {
  const client = new Client({
    reconnectDelay: 5000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
      userId: String(userId),
      role,
    },
    webSocketFactory: () => new SockJS(`${baseUrl}/chat-socket`),
    debug: () => {},
    onConnect: () => {
      client.subscribe(`/topic/chat/user.${userId}`, (frame) => {
        onMessage?.(JSON.parse(frame.body));
      });

      client.subscribe("/topic/presence", (frame) => {
        onPresence?.(JSON.parse(frame.body));
      });

      onConnect?.(client);
    },
    onWebSocketClose: () => {
      onDisconnect?.();
    },
    onStompError: (frame) => {
      onError?.(frame);
    },
    onWebSocketError: (event) => {
      onError?.(event);
    },
  });

  client.activate();
  return client;
};

export const disconnectChatClient = (client) => {
  if (client) {
    client.deactivate();
  }
};

export const publishChatMessage = (client, payload) => {
  client?.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
};

export const publishDeliveredReceipt = (client, messageId) => {
  client?.publish({
    destination: "/app/chat.delivered",
    body: JSON.stringify({ messageId }),
  });
};

export const publishReadReceipt = (client, messageId) => {
  client?.publish({
    destination: "/app/chat.read",
    body: JSON.stringify({ messageId }),
  });
};
