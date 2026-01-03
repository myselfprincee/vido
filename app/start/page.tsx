"use client";
import React, { FC, useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import MessageBox from "../Components/MessageBox";
import { Popup } from "../Components/Popup";

type Constraints = {
  // 'video': {
  //     width: {
  //         min: number,
  //         ideal: number,
  //         max: number
  //     },
  //     height: {
  //         min: number,
  //         ideal: number,
  //         max: number,
  //     },
  //     framerate: {
  //         min: number,
  //         ideal: number,
  //         max: number
  //     }
  // },
  video: boolean;
  audio: boolean;
};

const page: FC = () => {
  const peerConnectionRef = useRef<RTCPeerConnection>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const VideoSenderRef = useRef<RTCRtpSender>(null);
  const AudioSenderRef = useRef<RTCRtpSender>(null);

  const [senderStream, setSenderStream] = useState<undefined | RTCRtpSender>(
    undefined
  );
  //initial setting before joining call
  const [audio, setAudio] = useState<boolean>(true);
  const [video, setVideo] = useState<boolean>(true);

  // all devices list
  const [availableDevicesList, setAvailableDevicesList] = useState<
    MediaDeviceInfo[]
  >([]);

  //main media Stream
  const [stream, setStream] = useState<null | MediaStream>(null);

  //which tracks are selected for both.
  const [selectedVideoTrack, setSelectedVideoTrack] =
    useState<null | MediaStreamTrack>(null);
  const [selectedAudioTrack, setSelectedAudioTrack] =
    useState<null | MediaStreamTrack>(null);

  const [selectedVideoTrackArr, setSelectedVideoTrackArr] = useState<
    null | MediaStreamTrack[]
  >(null);
  const [selectedAudioTrackArr, setSelectedAudioTrackArr] = useState<
    null | MediaStreamTrack[]
  >(null);

  // console.log(audio, video);

  const [peerConnection, setPeerConnection] =
    useState<null | RTCPeerConnection>(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

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

  // const startVideoStream = (track: RTCRtpSender) => {
  //   peerConnectionRef?.current?.addTrack(track, mediaStreamRef.current);
  // };

  useEffect(() => {
    // console.log("the socket is connected : ", socket.connected);
    try {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = new RTCPeerConnection();
      }

      openMediaDevices({ video, audio }).then((data) => {
        mediaStreamRef.current = data;

        for (const track of mediaStreamRef.current.getTracks()) {
          if (peerConnectionRef.current) {
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

        setSelectedVideoTrackArr(mediaStreamRef.current.getVideoTracks());
        setSelectedAudioTrackArr(mediaStreamRef.current.getAudioTracks());

        console.log(videoRef.current);
        if (videoRef.current && "srcObject" in videoRef.current) {
          videoRef.current.srcObject = mediaStreamRef.current;
        }
        //  else {
        //   videoRef.current.src = URL.createObjectURL(mediaStreamRef.current);
        // }
      });

      if (!navigator.mediaDevices?.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
      } else {
        (async () => {
          if (!navigator.mediaDevices) {
            return;
          }
          const devicesList: MediaDeviceInfo[] =
            await navigator.mediaDevices.enumerateDevices();
          setAvailableDevicesList(devicesList);
          console.log(devicesList);
        })();
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      // if (peerConnectionRef.current) {
      //   peerConnectionRef.current.close();
      // }
    };
  }, []);

  // function to get devices for each section
  const showUniqueDevices = (
    devicesArr: MediaDeviceInfo[],
    type: "audioinput" | "audiooutput" | "videoinput"
  ) => {
    const uniqueDevices = new Map();
    const finalResult: MediaDeviceInfo[] = [];

    devicesArr
      .filter((device) => device.kind === type)
      .map((device, index) => {
        uniqueDevices.set(device.groupId, device);
      });

    uniqueDevices.forEach((key) => {
      finalResult.push(key);
    });

    return finalResult;
  };

  // const turnOffCamera = () => {
  //   if (VideoSenderRef.current) {
  //     VideoSenderRef.current.track.enabled = false;
  //   }
  // };
  // const turnOnCamera = () => {
  //   if (VideoSenderRef.current) {
  //     VideoSenderRef.current.track.enabled = true;
  //   }
  // };

  const toggle = {
    camera: (param: string) => {
      if (VideoSenderRef.current && param == "turnon") {
        VideoSenderRef.current.track.enabled = true;
      } else if (VideoSenderRef.current && param == "turnoff") {
        VideoSenderRef.current.track.enabled = false;
      }
    },

    audio: (param: string) => {
      if (AudioSenderRef.current && param == "turnon") {
        AudioSenderRef.current.track.enabled = true;
      } else if (VideoSenderRef.current && param == "turnoff") {
        AudioSenderRef.current.track.enabled = false;
      }
    },
  };

  return (
    <main className="flex flex-wrap">
      <Popup type="danger" text="sucessful"/>
      <div id="options-container" className="flex flex-wrap gap-4 m-2 p-2">
        <div className="flex flex-col w-fit">
          <label htmlFor="select-audio">Select Audio Input Channel</label>
          <select
            name="select-audio"
            id="select-audio"
            className="text-base bg-amber-200"
          >
            {availableDevicesList.length !== 0 &&
              showUniqueDevices(availableDevicesList, "audioinput").map(
                (device, index) => {
                  return (
                    <option key={index} value={device.label}>
                      {device.label}
                    </option>
                  );
                }
              )}
          </select>
        </div>
        <div className="flex flex-col w-fit">
          <label htmlFor="select-video">Select Video Input Channel</label>
          <select
            name="select-video"
            id="select-video"
            className="text-base bg-amber-200"
            onChange={async (e) => {
              const deviceId = e.target.value;
              console.log(deviceId);
              try {
                // Get new video stream from selected camera
                const newStream = await navigator.mediaDevices.getUserMedia({
                  video: { deviceId: { exact: deviceId } },
                  audio: false,
                });

                console.log(newStream);

                const newVideoTrack = newStream.getVideoTracks()[0];
                console.log(
                  availableDevicesList.filter(
                    (device) => device.kind == "audioinput"
                  )
                );

                console.log(newVideoTrack);
                console.log(mediaStreamRef.current);

                // Replace track in peer connection

                // Stop old video track
                if (mediaStreamRef.current) {
                  const oldVideoTrack =
                    mediaStreamRef.current.getVideoTracks()[0];
                  if (oldVideoTrack) {
                    oldVideoTrack.stop();
                    mediaStreamRef.current.removeTrack(oldVideoTrack);
                  }
                  mediaStreamRef.current.addTrack(newVideoTrack);
                }

                if (VideoSenderRef.current && newVideoTrack) {
                  await VideoSenderRef.current.replaceTrack(newVideoTrack);
                }
                // Update video element
                if (videoRef.current) {
                  videoRef.current.srcObject = mediaStreamRef.current;
                }

                console.log(`Video input changed to device: ${deviceId}`);
              } catch (error) {
                console.error("Error changing video input device:", error);
              }
            }}
          >
            {availableDevicesList.length !== 0 &&
              showUniqueDevices(availableDevicesList, "videoinput").map(
                (device, index) => {
                  return (
                    <option key={index} value={device.deviceId}>
                      {device.label}
                    </option>
                  );
                }
              )}
          </select>
        </div>
        <div className="flex flex-col w-fit">
          <label htmlFor="select-audio">Select Audio Output Channel</label>
          <select
            name="select-audio"
            id="select-audio"
            className="text-base bg-amber-200"
            onChange={async (e) => {
              const deviceId = e.target.value;
              if (videoRef.current && "setSinkId" in videoRef.current) {
                try {
                  await (videoRef.current as HTMLVideoElement).setSinkId(
                    deviceId
                  );
                  console.log(`Audio output changed to device: ${deviceId}`);
                } catch (error) {
                  console.error("Error changing audio output device:", error);
                }
              }
            }}
          >
            {availableDevicesList.length !== 0 &&
              showUniqueDevices(availableDevicesList, "audiooutput").map(
                (device, index) => {
                  return (
                    <option key={index} value={device.deviceId}>
                      {device.label}
                    </option>
                  );
                }
              )}
          </select>
        </div>
      </div>

      <section className="flex min-w-full relative justify-center items-center my-5">
        {/* </div> */}
        <video
          className={`rounded-2xl min-h-[500px] min-w-[500px]`}
          autoPlay
          playsInline
          controls={false}
          ref={videoRef}
        />

        <div className="flex gap-4 absolute bottom-5">
          <button
            className="bg-red-500 p-2 cursor-pointer"
            onClick={() => {
              if (video) {
                toggle.camera("turnoff");
              } else {
                toggle.camera("turnon");
              }
              setVideo((video) => !video);
            }}
          >
            video <span>{video ? "off" : "on"}</span>
          </button>
          <button
            className="bg-red-500 p-2 cursor-pointer"
            onClick={() => {
              if (audio) {
                toggle.audio("turnoff");
              } else {
                toggle.audio("turnon");
              }
              setAudio((audio) => !audio);
            }}
          >
            audio <span>{audio ? "off" : "on"}</span>
          </button>
        </div>
      </section>
      {/* <MessageBox /> */}
    </main>
  );
};

export default page;
