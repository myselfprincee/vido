import { io, Socket } from "socket.io-client";
import { AnswerToClientPayload, AnswerToServerPayload, ExistingParticipantsPayload, IceCandidateToServerPayload, KickedPayload, MessageToRoomPayload, ModeratorChangedPayload, OfferToClientPayload, OfferToServerPayload, PeerJoinedPayload, PeerLeftPayload } from "@/app/types/socketConfigTypes";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'https://localhost:4000';

type ServerToClientEvents = {
  express: (msg: string) => void;
  joinMessageToRoom: (message: string) => void;
  "chat message"?: (msg: string) => void;
  "userJoined"?: (msg: string) => void;
  "message_to_room"?: (msg: string) => void;
  "chat message in room"?: (msg: string) => void;
  "offer"?: (msg: OfferToClientPayload) => void;
  "answer"?: (msg: AnswerToClientPayload) => void;
  "ice-candidate"?: (msg: IceCandidateToServerPayload) => void;
  "peer-joined"?: (msg: PeerJoinedPayload) => void;
  "peer-left"?: (msg: PeerLeftPayload) => void;
  "existing-participants"?: (msg: ExistingParticipantsPayload) => void;
  "kicked"?: (msg: KickedPayload) => void;
  "moderator-changed"?: (msg: ModeratorChangedPayload) => void;
  "chat-message"?: (msg: { userId: string, senderName: string, text: string, time: string }) => void;
};

type ClientToServerEvents = {
  "join-room": (room: string) => void;
  "chat message": (msg: string) => void;
  "message_to_room"?: (msg: MessageToRoomPayload) => void;
  "offer-to-server"?: (msg: OfferToServerPayload) => void;
  "answer-to-server"?: (msg: AnswerToServerPayload) => void;
  "ice-candidate-to-server"?: (msg: IceCandidateToServerPayload) => void;
  "ready"?: (msg: string) => void;
  "user-message"?: (msg: { roomId: string, text: string, senderName: string }) => void;
  "kick-user"?: (msg: { roomId: string, targetSocketId: string }) => void;
};

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  autoConnect: false
});

