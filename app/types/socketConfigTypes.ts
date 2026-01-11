export type MessageToRoomPayload = {
    room: string,
    message: string
}

export type JoinRoomPayload = {
    roomId: string,
    from: string | undefined
}

export type OfferToServerPayload = {
    from: string | null,
    to: string | null,
    payload: RTCSessionDescriptionInit
}

export type AnswerToServerPayload = {
    from: string,
    to: string | undefined,
    payload: RTCSessionDescriptionInit
}

export type IceCandidateToServerPayload = {
    from: string | undefined,
    to: string | null,
    candidate: RTCIceCandidate | null
}

export interface ParticipantInfo {
    id: string;
    name: string;
    email: string;
    image?: string;
    isModerator: boolean;
}

export type PeerJoinedPayload = {
    socketId: string;
    userInfo: ParticipantInfo;
}

export type PeerLeftPayload = {
    socketId: string;
    reason: string;
    userInfo?: ParticipantInfo;
}

export type OfferToClientPayload = {
    from: string;
    to: string | null;
    payload: RTCSessionDescriptionInit;
    userInfo?: ParticipantInfo;
}

export type AnswerToClientPayload = {
    from: string;
    to: string | undefined;
    payload: RTCSessionDescriptionInit;
    userInfo?: ParticipantInfo;
}

export type ExistingParticipantsPayload = Array<{
    socketId: string;
    userInfo: ParticipantInfo;
}>;

export type KickedPayload = {
    message: string;
    kickedBy: string;
};

export type ModeratorChangedPayload = {
    newModeratorId: string;
    newModeratorName: string;
};