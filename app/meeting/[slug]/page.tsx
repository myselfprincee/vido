"use client";
import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/app/socket";
import { AnswerToClientPayload, IceCandidateToServerPayload, OfferToClientPayload, ParticipantInfo, PeerLeftPayload } from "../../types/socketConfigTypes";
import MessageBox from "../../Components/MessageBox";
import MeetingFooter from "../../Components/MeetingFooter";
import { X } from "lucide-react";
import { useSession } from "../../lib/auth-client";
import Image from "next/image";


type Constraints = {
  video: boolean | {
    width?: { min: number, ideal: number, max: number },
    height?: { min: number, ideal: number, max: number },
    framerate?: { min: number, ideal: number, max: number },
    deviceId?: { exact: string }
  };
  audio: boolean | {
    deviceId?: { exact: string }
  };
};

// RemoteVideo component for rendering individual remote peer video
const RemoteVideo: FC<{
  peerId: string;
  stream: MediaStream;
  participantInfo?: ParticipantInfo;
  isModerator: boolean;
  onKick?: (peerId: string) => void;
}> = ({ peerId, stream, participantInfo, isModerator, onKick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = stream?.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const name = participantInfo?.name || `Participant ${peerId.slice(-4)}`;
  const image = participantInfo?.image;
  // const isParticipantModerator = participantInfo?.isModerator;

  return (
    <div className="relative aspect-video group">
      {/* Show avatar if no video track */}
      {!hasVideo && (
        <div className="absolute inset-0 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-2xl z-10">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-slate-600"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-slate-600">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full rounded-2xl bg-black object-cover shadow-2xl border border-slate-800 ${!hasVideo ? 'opacity-0' : ''}`}
      />

      {/* Kick button - only shown to moderator */}
      {isModerator && onKick && (
        <button
          onClick={() => onKick(peerId)}
          className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Remove
        </button>
      )}
    </div>
  );
};

const MeetingCodeError: FC = () => {

  const router = useRouter();
  const [count, setCount] = useState<number>(30);

  useEffect(() => {
    if (count <= 0) {
      router.push('/meeting');
      return;
    }

    const timer = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [count, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen font-geist gap-6">
      <div className="text-slate-600 text-center">
        <p className="text-4xl font-bold">{count}</p>
        <p>Returning to home screen...</p>
      </div>
      <h1 className="text-4xl font-bold text-black">Check your meeting code</h1>
      <div className="text-slate-600 text-center">
        <p>Make sure you entered the correct meeting code in the URL, for example:</p>
        <p>https://vido.princeedev.tech/xxx-yyyy-zzz</p>
      </div>
      <button onClick={() => {
        router.push("/meeting");
      }} className="bg-black text-white px-6 py-2 rounded-lg">Return to home screen</button>
    </div>
  );
};

const MeetingPage: FC = () => {

  // Get roomId from URL params
  const params = useParams();
  const roomId = (params?.slug as string) || "1";

  const MEETING_CODE_REGEX = /^[a-z]{3}-[a-z0-9]{4}-[a-z]{3}$/;




  // function to get devices for each section
  const showUniqueDevices = (
    devicesArr: MediaDeviceInfo[],
    type: "audioinput" | "audiooutput" | "videoinput"
  ) => {
    const uniqueDevices = new Map();
    const finalResult: MediaDeviceInfo[] = [];

    devicesArr
      .filter((device) => device.kind === type)
      .map((device) => {
        uniqueDevices.set(device.groupId, device);
      });

    uniqueDevices.forEach((key) => {
      finalResult.push(key);
    });

    return finalResult;
  };

  // Type for participant info
  interface ParticipantInfo {
    id: string;
    name: string;
    email: string;
    image?: string;
    isModerator: boolean;
  }

  //for multiple peer connections
  const peerConnectionsRefMap = useRef<Map<string, RTCPeerConnection>>(
    new Map()
  );

  //for multiple videos of multiple peers
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );

  // Store participant info (name, email, image, isModerator)
  const [participantsInfo, setParticipantsInfo] = useState<Map<string, ParticipantInfo>>(
    new Map()
  );

  // Track if current user is moderator
  const [isModerator, setIsModerator] = useState(false);

  const remotePeerIdRef = useRef<string | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection>(null);

  const mediaStreamRef = useRef<MediaStream>(null);
  const VideoSenderRef = useRef<RTCRtpSender>(null);
  const AudioSenderRef = useRef<RTCRtpSender>(null);
  // const hasSentCandidateRef = useRef<boolean>(false);

  //initial setting before joining call
  const [audio, setAudio] = useState<boolean>(true);
  const [video, setVideo] = useState<boolean>(true);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [mediaError, setMediaError] = useState<string | null>(null);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // Get user info from auth session
  const { data: session } = useSession();
  const userName = session?.user?.name || "You";
  const userImage = session?.user?.image || null;

  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");

  // all devices list
  const [availableDevicesList, setAvailableDevicesList] = useState<
    MediaDeviceInfo[]
  >([]);

  // Derived filtered lists
  const audioInputDevices = showUniqueDevices(
    availableDevicesList,
    "audioinput"
  );
  const videoInputDevices = showUniqueDevices(
    availableDevicesList,
    "videoinput"
  );
  const audioOutputDevices = showUniqueDevices(
    availableDevicesList,
    "audiooutput"
  );

  const [selectedAudioInput, setSelectedAudioInput] = useState<string>("");
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefOne = useRef<HTMLVideoElement>(null);

  const [activeSidePanel, setActiveSidePanel] = useState<
    "chat" | "participants" | null
  >(null);

  const toggleChat = useCallback(() => {
    setActiveSidePanel((prev) => (prev === "chat" ? null : "chat"));
  }, []);

  const toggleParticipants = useCallback(() => {
    setActiveSidePanel((prev) =>
      prev === "participants" ? null : "participants"
    );
  }, []);

  // console.log(audioRef, videoRef);
  // const constraints: Constraints = {
  //     video: {
  //         width: { min: 1024, ideal: 1280, max: 1920 },
  //         height: { min: 576, ideal: 720, max: 1080 },
  //         framerate: { min: 10, ideal: 24, max: 30 }
  //     },
  //     'audio': audio
  // };

  const openMediaDevices = async (constraints: Constraints) => {
    return await navigator.mediaDevices.getUserMedia(constraints);
  };

  const AttachSendersAndRef = async (
    video: boolean = true,
    audio: boolean = true,
    fnToOpenMediaDevices: (constraints: Constraints) => Promise<MediaStream>,
    VideoSenderRef: React.RefObject<RTCRtpSender | null>,
    AudioSenderRef: React.RefObject<RTCRtpSender | null>,
    mediaStreamRef: React.RefObject<MediaStream | null>,
    videoRef: React.RefObject<HTMLVideoElement | null>,
    peerConnectionRef: React.RefObject<RTCPeerConnection | null>
  ) => {
    const data = await fnToOpenMediaDevices({ video, audio });
    mediaStreamRef.current = data;

    for (const track of mediaStreamRef.current.getTracks()) {
      // Check if peer connection exists and is not closed before adding tracks
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
        const sender = peerConnectionRef.current.addTrack(
          track,
          mediaStreamRef.current
        );

        if (track.kind == "video") {
          VideoSenderRef.current = sender;
        }
        if (track.kind == "audio") {
          AudioSenderRef.current = sender;
        }
      }
    }

    console.log(videoRef.current);
    if (videoRef.current && "srcObject" in videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  };

  const getIceServers = useCallback((): RTCIceServer[] => {
    const turnDomain =
      process.env.NEXT_PUBLIC_TURN_DOMAIN || "turn.vido.princeedev.tech";
    const turnUser = process.env.NEXT_PUBLIC_TURN_USER || "videochat";
    const turnPass = process.env.NEXT_PUBLIC_TURN_PASS || "";

    return [
      { urls: `stun:${turnDomain}:3478` },
      {
        urls: `turn:${turnDomain}:3478`,
        username: turnUser,
        credential: turnPass,
      },
      {
        urls: `turn:${turnDomain}:3478?transport=tcp`,
        username: turnUser,
        credential: turnPass,
      },
      {
        urls: `turns:${turnDomain}:5349?transport=tcp`,
        username: turnUser,
        credential: turnPass,
      },
    ];
  }, []);

  useEffect(() => {
    // Flag to track if component is still mounted
    let isMounted = true;

    if (!MEETING_CODE_REGEX.test(roomId)) return;

    //webrtc logic
    const configuration: RTCConfiguration = {
      iceServers: getIceServers(),
      iceCandidatePoolSize: 10,
    };

    const init = async () => {
      // Always create a fresh peer connection on mount
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Connection state monitoring
      peerConnectionRef.current.onconnectionstatechange = () => {
        if (!isMounted) return;
        const state = peerConnectionRef.current?.connectionState || "unknown";
        setConnectionStatus(state);
        console.log("Connection state:", state);
      };

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log(
          "ICE state:",
          peerConnectionRef.current?.iceConnectionState
        );
      };

      // Try to get media devices with error handling
      try {
        await AttachSendersAndRef(
          video,
          audio,
          openMediaDevices,
          VideoSenderRef,
          AudioSenderRef,
          mediaStreamRef,
          videoRef,
          peerConnectionRef
        );
        setMediaError(null);
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("Media device error:", error);
        let errorMessage = "Could not access camera or microphone";

        if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          errorMessage = "No camera or microphone found";
        } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage = "Camera/microphone permission denied";
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          errorMessage = "Could not start video source - camera may be in use by another app";
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Camera constraints could not be satisfied";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setMediaError(errorMessage);
        setVideo(false);

        // Try audio-only if video failed
        try {
          await AttachSendersAndRef(
            false,
            audio,
            openMediaDevices,
            VideoSenderRef,
            AudioSenderRef,
            mediaStreamRef,
            videoRef,
            peerConnectionRef
          );
        } catch (audioError) {
          console.error("Audio-only fallback also failed:", audioError);
        }
      }

      if (!navigator.mediaDevices?.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
      } else {
        (async () => {
          if (!navigator.mediaDevices || !isMounted) {
            return;
          }
          const devicesList: MediaDeviceInfo[] =
            await navigator.mediaDevices.enumerateDevices();
          if (isMounted) {
            setAvailableDevicesList(devicesList);
          }
          console.log(devicesList);
        })();
      }

      if (peerConnectionRef.current) {
        // const options = {
        //   offerToReceiveAudio: true,
        //   offerToReceiveVideo: true,
        // };

        if (peerConnectionRef.current) {
          peerConnectionRef.current.onicecandidate = (event) => {
            console.log("event from candidate", event);
            if (event.candidate) {
              socket.emit("ice-candidate-to-server", {
                from: socket.id ?? "",
                to: remotePeerIdRef.current,
                candidate: event.candidate,
              });
            }
          };

          peerConnectionRef.current.ontrack = (event) => {
            console.log("RTCTrackEvent : ", event);
            const remoteVideo = videoRefOne.current;
            if (!remoteVideo) return;

            remoteVideo.srcObject = event.streams[0];
          };
        }

        // peerConnectionRef.current.createOffer(options).then(data => console.log(data));
      }

      const handleConnect = () => {
        if (!socket.id) {
          console.warn("Socket ID not available yet");
          return;
        }

        const joinRoomPayload = {
          roomId: roomId,
          from: socket.id ?? "",
          userName: userName,
          userEmail: session?.user?.email || "",
          userImage: userImage,
        };
        socket.emit("join-room", JSON.stringify(joinRoomPayload));
        console.log("Joined room with socket:", socket.id, "as", userName);
      };

      const handleUserJoined = (msg: unknown) => {
        console.log("User joined:", msg);
      };

      const handlePeerJoined = async (payload: { socketId: string; userInfo: ParticipantInfo }) => {
        if (!isMounted) return;
        const { socketId: id, userInfo } = payload;
        console.log("A peer joined:", userInfo.name, id);

        // Store participant info
        setParticipantsInfo((prev) => {
          const newMap = new Map(prev);
          newMap.set(id, userInfo);
          return newMap;
        });

        // Skip if we already have a connection to this peer
        if (peerConnectionsRefMap.current.has(id)) {
          console.log("Already have connection to peer:", id);
          return;
        }

        // Create a new peer connection for this remote peer
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionsRefMap.current.set(id, peerConnection);

        // Add our local tracks to this peer connection
        if (mediaStreamRef.current) {
          for (const track of mediaStreamRef.current.getTracks()) {
            peerConnection.addTrack(track, mediaStreamRef.current);
          }
        }

        // Handle ICE candidates for this connection
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate-to-server", {
              from: socket.id ?? "",
              to: id,
              candidate: event.candidate,
            });
          }
        };

        // Handle incoming tracks from this peer
        peerConnection.ontrack = (event) => {
          console.log("Received track from peer:", id, event);
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.set(id, event.streams[0]);
            return newMap;
          });
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log(`Peer ${id} connection state:`, peerConnection.connectionState);
          if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
            // Clean up this specific connection
            peerConnectionsRefMap.current.delete(id);
            setRemoteStreams((prev) => {
              const newMap = new Map(prev);
              newMap.delete(id);
              return newMap;
            });
          }
        };

        // Create and send offer
        if (peerConnection.signalingState === "stable") {
          const offer = await peerConnection.createOffer({
            iceRestart: true,
          });
          await peerConnection.setLocalDescription(offer);

          const payload = {
            from: socket.id ?? "",
            to: id,
            payload: offer,
          };

          socket.emit("offer-to-server", payload);
        }
      };

      const handleOffer = async (payload: OfferToClientPayload) => {
        if (!isMounted) return;
        console.log("Received offer from:", payload.from, payload.userInfo?.name);

        const peerId = payload.from;

        // Store participant info from the offer
        const userInfo = payload.userInfo;
        if (userInfo) {
          setParticipantsInfo((prev) => {
            const newMap = new Map(prev);
            newMap.set(peerId, userInfo);
            return newMap;
          });
        }

        // Create a new peer connection for this offering peer if we don't have one
        let peerConnection = peerConnectionsRefMap.current.get(peerId);

        if (!peerConnection) {
          peerConnection = new RTCPeerConnection(configuration);
          peerConnectionsRefMap.current.set(peerId, peerConnection);

          // Add our local tracks to this peer connection
          if (mediaStreamRef.current) {
            for (const track of mediaStreamRef.current.getTracks()) {
              peerConnection.addTrack(track, mediaStreamRef.current);
            }
          }

          // Handle ICE candidates for this connection
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate-to-server", {
                from: socket.id ?? "",
                to: peerId,
                candidate: event.candidate,
              });
            }
          };

          // Handle incoming tracks from this peer
          peerConnection.ontrack = (event) => {
            console.log("Received track from peer:", peerId, event);
            setRemoteStreams((prev) => {
              const newMap = new Map(prev);
              newMap.set(peerId, event.streams[0]);
              return newMap;
            });
          };

          // Handle connection state changes
          peerConnection.onconnectionstatechange = () => {
            console.log(`Peer ${peerId} connection state:`, peerConnection?.connectionState);
            if (peerConnection?.connectionState === 'failed' || peerConnection?.connectionState === 'disconnected') {
              peerConnectionsRefMap.current.delete(peerId);
              setRemoteStreams((prev) => {
                const newMap = new Map(prev);
                newMap.delete(peerId);
                return newMap;
              });
            }
          };
        }

        await peerConnection.setRemoteDescription(payload.payload);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        const AnswerPayload = {
          from: socket.id ?? "",
          to: peerId,
          payload: answer,
        };

        socket.emit("answer-to-server", AnswerPayload);
      };

      const handleAnswer = async (payload: AnswerToClientPayload) => {
        if (!isMounted) return;
        const peerId = payload.from;

        // Store participant info from the answer
        const userInfo = payload.userInfo;
        if (userInfo) {
          setParticipantsInfo((prev) => {
            const newMap = new Map(prev);
            newMap.set(peerId, userInfo);
            return newMap;
          });
        }

        const peerConnection = peerConnectionsRefMap.current.get(peerId);

        if (peerConnection) {
          await peerConnection.setRemoteDescription(payload.payload);
        }
      };

      const handleIceCandidate = async (payload: IceCandidateToServerPayload) => {
        if (!isMounted) return;
        const peerId = payload.from;
        if (!peerId) return;
        const peerConnection = peerConnectionsRefMap.current.get(peerId);

        if (peerConnection) {
          await peerConnection.addIceCandidate(payload.candidate);
        }
      };

      const handlePeerLeft = (payload: PeerLeftPayload) => {
        if (!isMounted) return;
        const peerId = payload.socketId;
        console.log("Peer left:", payload.userInfo?.name || peerId, "Reason:", payload.reason);

        // Close and remove the peer connection
        const peerConnection = peerConnectionsRefMap.current.get(peerId);
        if (peerConnection) {
          peerConnection.close();
          peerConnectionsRefMap.current.delete(peerId);
        }

        // Remove from remote streams
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });

        // Remove from participants info
        setParticipantsInfo((prev) => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
      };

      // Handle receiving list of existing participants when joining
      const handleExistingParticipants = (participants: Array<{ socketId: string; userInfo: ParticipantInfo }>) => {
        if (!isMounted) return;
        console.log("Existing participants:", participants);

        setParticipantsInfo((prev) => {
          const newMap = new Map(prev);
          participants.forEach(({ socketId, userInfo }) => {
            newMap.set(socketId, userInfo);
          });
          return newMap;
        });

        // Check if we are the moderator (first to join means we didn't get any existing participants with isModerator true for us)
        const amIModerator = participants.length === 0 ||
          participants.every(p => !p.userInfo.isModerator);
        if (amIModerator) {
          setIsModerator(true);
        }
      };

      // Handle being kicked from the meeting
      const handleKicked = (payload: { message: string; kickedBy: string }) => {
        if (!isMounted) return;
        alert(`${payload.message}\nKicked by: ${payload.kickedBy}`);
        // Redirect to meeting list
        window.location.href = "/meeting";
      };

      // Handle moderator change
      const handleModeratorChanged = (payload: { newModeratorId: string; newModeratorName: string }) => {
        if (!isMounted) return;
        console.log("Moderator changed to:", payload.newModeratorName);

        // Update if we became the moderator
        if (payload.newModeratorId === socket.id) {
          setIsModerator(true);
        }

        // Update participant info
        setParticipantsInfo((prev) => {
          const newMap = new Map(prev);
          // Remove moderator status from all
          newMap.forEach((info, id) => {
            if (info.isModerator) {
              newMap.set(id, { ...info, isModerator: false });
            }
          });
          // Set new moderator
          const modInfo = newMap.get(payload.newModeratorId);
          if (modInfo) {
            newMap.set(payload.newModeratorId, { ...modInfo, isModerator: true });
          }
          return newMap;
        });
      };

      socket.connect();
      socket.on("connect", handleConnect);
      socket.on("userJoined", handleUserJoined);
      socket.on("peer-joined", handlePeerJoined);
      socket.on("peer-left", handlePeerLeft);
      socket.on("offer", handleOffer);
      socket.on("answer", handleAnswer);
      socket.on("ice-candidate", handleIceCandidate);
      socket.on("existing-participants", handleExistingParticipants);
      socket.on("kicked", handleKicked);
      socket.on("moderator-changed", handleModeratorChanged);
      socket.emit("ready", "connected");

      // Store handlers for cleanup
      return {
        handleConnect,
        handleUserJoined,
        handlePeerJoined,
        handlePeerLeft,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
      };
    };

    let handlers: Awaited<ReturnType<typeof init>> | null = null;

    init()
      .then((h) => {
        handlers = h;
      })
      .catch((error) => {
        console.error("Initialization failed:", error);
        // Handle error - maybe user denied camera permission
      });

    return () => {
      isMounted = false;

      // Stop all media tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }

      // Clean up socket event listeners
      if (handlers) {
        socket.off("connect", handlers.handleConnect);
        socket.off("userJoined", handlers.handleUserJoined);
        socket.off("peer-joined", handlers.handlePeerJoined);
        socket.off("peer-left", handlers.handlePeerLeft);
        socket.off("offer", handlers.handleOffer);
        socket.off("answer", handlers.handleAnswer);
        socket.off("ice-candidate", handlers.handleIceCandidate);
      }

      socket.disconnect();

      // Close all peer connections
      peerConnectionsRefMap.current.forEach((pc) => {
        pc.close();
      });
      peerConnectionsRefMap.current.clear();

      // Reset sender refs
      VideoSenderRef.current = null;
      AudioSenderRef.current = null;
    };
  }, [roomId, userName, session, userImage, audio, video, getIceServers]);

  // function to turn on and off camera and mic.
  const toggle = {
    camera: (param: string) => {
      if (VideoSenderRef.current && param == "turnon") {
        if (VideoSenderRef.current.track !== null) {
          VideoSenderRef.current.track.enabled = true;
        }
      } else if (VideoSenderRef.current && param == "turnoff") {
        if (VideoSenderRef.current.track !== null) {
          VideoSenderRef.current.track.enabled = false;
        }
      }
    },

    audio: (param: string) => {
      if (AudioSenderRef.current && param == "turnon") {
        if (AudioSenderRef.current.track !== null) {
          AudioSenderRef.current.track.enabled = true;
        }
      } else if (AudioSenderRef.current && param == "turnoff") {
        if (AudioSenderRef.current.track !== null) {
          AudioSenderRef.current.track.enabled = false;
        }
      }
    },
  };

  const onAudioInputChange = async (deviceId: string) => {
    setSelectedAudioInput(deviceId);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: { exact: deviceId } },
      });
      const newAudioTrack = newStream.getAudioTracks()[0];

      if (mediaStreamRef.current) {
        const oldAudioTrack = mediaStreamRef.current.getAudioTracks()[0];
        if (oldAudioTrack) {
          oldAudioTrack.stop();
          mediaStreamRef.current.removeTrack(oldAudioTrack);
        }
        mediaStreamRef.current.addTrack(newAudioTrack);
      }

      if (AudioSenderRef.current && newAudioTrack) {
        await AudioSenderRef.current.replaceTrack(newAudioTrack);
      }
    } catch (error) {
      console.log("Unable to change the mic : ", error);
    }
  };

  const onVideoInputChange = async (deviceId: string) => {
    setSelectedVideoInput(deviceId);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      });
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (mediaStreamRef.current) {
        const oldVideoTrack = mediaStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          oldVideoTrack.stop();
          mediaStreamRef.current.removeTrack(oldVideoTrack);
        }
        mediaStreamRef.current.addTrack(newVideoTrack);
      }

      if (VideoSenderRef.current && newVideoTrack) {
        await VideoSenderRef.current.replaceTrack(newVideoTrack);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
    } catch (error) {
      console.error("Error changing video input device:", error);

      if (VideoSenderRef.current) {
        onToggleVideo();
        setSelectedVideoInput(videoInputDevices[0].label);
      }
    }
  };

  const onAudioOutputChange = async (deviceId: string) => {
    setSelectedAudioOutput(deviceId);
    if (videoRef.current && "setSinkId" in videoRef.current) {
      try {
        (videoRef.current as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
      } catch (error) {
        console.error(error);
      }
    }
    // Also change for remote video
    if (videoRefOne.current && "setSinkId" in videoRefOne.current) {
      try {
        (videoRefOne.current as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onToggleMic = () => {
    const newState = !audio;
    setAudio(newState);
    toggle.audio(newState ? "turnon" : "turnoff");
  };

  const onToggleVideo = () => {
    const newState = !video;
    setVideo(newState);
    toggle.camera(newState ? "turnon" : "turnoff");
  };


  // Chat state
  interface Message {
    userId: string;
    senderName: string;
    text: string;
    time: string;
    sender: "me" | "other";
  }

  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const handleSendMessage = (text: string) => {
    if (!text?.trim()) return;

    // Optimistic update
    const newMessage: Message = {
      userId: socket.id || "me",
      senderName: userName,
      text: text,
      time: new Date().toISOString(),
      sender: "me"
    };

    setChatMessages((prev) => [...prev, newMessage]);

    // Send to server
    socket.emit("user-message", {
      roomId,
      text,
      senderName: userName
    });
  };

  useEffect(() => {
    const handleRecieveMessage = (msg: { userId: string; senderName: string; text: string; time: string }) => {
      console.log("Chat message received in dedicated effect:", msg);
      if (msg.userId === socket.id) return;

      setChatMessages((prev) => [...prev, {
        userId: msg.userId,
        senderName: msg.senderName,
        text: msg.text,
        time: msg.time,
        sender: "other"
      }]);
    };

    socket.on("chat-message", handleRecieveMessage);

    return () => {
      socket.off("chat-message", handleRecieveMessage);
    };
  }, []);

  if (!MEETING_CODE_REGEX.test(roomId)) {
    return <MeetingCodeError />;
  }

  return (
    <main className="h-screen w-screen bg-white text-white overflow-hidden flex flex-col relative">

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side (Videos + Controls) */}
        <div className="flex-1 flex flex-col relative transition-all duration-300">
          {/* Error Message */}
          {mediaError && (
            <div className="absolute top-16 left-4 right-4 z-30 bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm">
              ⚠️ {mediaError}
            </div>
          )}

          {/* Video Grid */}
          <div className="grid gap-4 p-4 pb-24 overflow-y-auto" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}>
            {/* Local Video */}
            <div className="relative aspect-video">
              {/* Show avatar when video is off */}
              {!video && (
                <div className="absolute inset-0 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-2xl z-10">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={userName}
                      width={96}
                      height={96}
                      className="rounded-full object-cover border-4 border-slate-600"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-600">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              <video
                className={`w-full h-full rounded-2xl bg-black object-cover shadow-2xl border border-slate-800 ${!video ? 'opacity-0' : ''}`}
                autoPlay
                playsInline
                muted
                ref={videoRef}
              />
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm font-medium z-20">
                You {!audio && '🔇'} {!video && '📵'}
              </div>
            </div>

            {/* Remote Videos - Map over all remote streams */}
            {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
              <RemoteVideo
                key={peerId}
                peerId={peerId}
                stream={stream}
                participantInfo={participantsInfo.get(peerId)}
                isModerator={isModerator}
                onKick={(targetId) => {
                  if (confirm(`Remove this participant from the meeting?`)) {
                    socket.emit("kick-user", { roomId, targetSocketId: targetId });
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Sliding Side Panel */}
        <div
          className={`fixed inset-y-0 z-[100] right-0 w-full md:w-96 bg-white text-black border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
          ${activeSidePanel ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Panel Header */}
          <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-white backdrop-blur-md">
            <h2 className="text-lg font-semibold tracking-wide text-black">
              {activeSidePanel === "chat" && "Messages"}
              {activeSidePanel === "participants" && "Participants"}
            </h2>
            <button
              onClick={() => setActiveSidePanel(null)}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="cursor-pointer" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeSidePanel === "chat" && (
              <div className="h-full absolute inset-0 overflow-y-auto">
                {/* MessageBox component needs to handle its own height/scrolling, so we give it container */}
                <div className="h-full">
                  <MessageBox
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    roomId={roomId}
                    userName={userName}
                  />
                </div>
              </div>
            )}

            {activeSidePanel === "participants" && (
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl border-dashed border-black">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                      Y
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">You (Host)</span>
                      <span className="text-xs text-green-600">Connected</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    {/* Status icons could go here */}
                  </div>
                </div>

                {/* Remote Participants List */}
                {Array.from(participantsInfo.entries()).map(([peerId, info]) => (
                  <div key={peerId} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 border border-transparent hover:border-slate-700/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden">
                        {info.image ? (
                          <Image src={info.image} alt={info.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          info.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{info.name}</span>
                        <span className="text-xs text-slate-400">{info.isModerator ? 'Moderator' : 'Guest'}</span>
                      </div>
                    </div>
                    {isModerator && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove this participant from the meeting?`)) {
                            socket.emit("kick-user", { roomId, targetSocketId: peerId });
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MeetingFooter
        roomId={roomId}
        onToggleChat={toggleChat}
        onToggleParticipants={toggleParticipants}
        onLeave={() => (window.location.href = "/")}
        isChatOpen={activeSidePanel === "chat"}
        isParticipantsOpen={activeSidePanel === "participants"}
        isMuted={!audio}
        isVideoOff={!video}
        onToggleMic={onToggleMic}
        onToggleVideo={onToggleVideo}
        audioInputDevices={audioInputDevices}
        videoInputDevices={videoInputDevices}
        audioOutputDevices={audioOutputDevices}
        selectedAudioInput={selectedAudioInput}
        selectedVideoInput={selectedVideoInput}
        selectedAudioOutput={selectedAudioOutput}
        onAudioInputChange={onAudioInputChange}
        onVideoInputChange={onVideoInputChange}
        onAudioOutputChange={onAudioOutputChange}
      />
    </main>
  );
};

export default MeetingPage;
