"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  MonitorUp,
  Users,
  Settings,
  ChevronDown,
  Check,
  Share2
} from "lucide-react";

interface MeetingFooterProps {
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  onLeave?: () => void;
  isChatOpen?: boolean;
  isParticipantsOpen?: boolean;

  // Media State
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;

  // Device Lists
  audioInputDevices: MediaDeviceInfo[];
  videoInputDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];

  roomId: string;

  // Selected Devices
  selectedAudioInput?: string;
  selectedVideoInput?: string;
  selectedAudioOutput?: string;

  // Changer Handlers
  onAudioInputChange: (deviceId: string) => void;
  onVideoInputChange: (deviceId: string) => void;
  onAudioOutputChange: (deviceId: string) => void;
}

const MeetingFooter: React.FC<MeetingFooterProps> = ({
  onToggleChat,
  onToggleParticipants,
  onLeave,
  isChatOpen,
  isParticipantsOpen,

  isMuted,
  isVideoOff,
  onToggleMic,
  onToggleVideo,

  audioInputDevices,
  videoInputDevices,
  audioOutputDevices,

  roomId,

  selectedAudioInput,
  selectedVideoInput,
  selectedAudioOutput,

  onAudioInputChange,
  onVideoInputChange,
  onAudioOutputChange,
}) => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"mic" | "video" | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeMenu &&
        !(event.target as Element).closest(".device-menu-container")
      ) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none z-50">
      {/* Left Section - Time and Meeting Info */}
      <div className="absolute left-6 bottom-6 pointer-events-auto text-slate-300 text-sm font-mono hidden md:block">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {roomId}
      </div>

      {/* Center Section - Main Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-2 flex flex-wrap justify-center items-center gap-2 md:gap-3 transition-all duration-300 hover:bg-slate-900 max-w-[95vw]">        {/* Microphone Group */}
        <div className="flex bg-slate-800/50 rounded-xl relative device-menu-container">
          <ControlButton
            isActive={!isMuted}
            onClick={onToggleMic}
            activeIcon={<Mic size={20} />}
            inactiveIcon={<MicOff size={20} />}
            activeClass="bg-slate-700 hover:bg-slate-600 text-white rounded-l-xl rounded-r-none border-r border-slate-600"
            inactiveClass="bg-red-500 hover:bg-red-600 text-white rounded-l-xl rounded-r-none border-r border-red-600"
            label={isMuted ? "Unmute" : "Mute"}
            className="!p-3 !rounded-r-none"
          />
          <button
            className={`px-1 hover:bg-slate-700 transition-colors rounded-r-xl outline-none cursor-pointer flex items-center justify-center ${!isMuted ? "bg-slate-700 text-white" : "bg-red-500 text-white"
              }`}
            onClick={() => setActiveMenu(activeMenu === "mic" ? null : "mic")}
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${activeMenu === "mic" ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Mic Menu */}
          {activeMenu === "mic" && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Microphone
              </div>
              {audioInputDevices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    onAudioInputChange(device.deviceId);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  {selectedAudioInput === device.deviceId && (
                    <Check size={14} className="text-blue-400" />
                  )}
                  <span
                    className={
                      selectedAudioInput === device.deviceId
                        ? "text-blue-400"
                        : ""
                    }
                  >
                    {device.label ||
                      `Microphone ${device.deviceId.slice(0, 4)}`}
                  </span>
                </button>
              ))}

              <div className="border-t border-slate-700 my-1"></div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Speakers
              </div>
              {audioOutputDevices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    onAudioOutputChange(device.deviceId);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  {selectedAudioOutput === device.deviceId && (
                    <Check size={14} className="text-blue-400" />
                  )}
                  <span
                    className={
                      selectedAudioOutput === device.deviceId
                        ? "text-blue-400"
                        : ""
                    }
                  >
                    {device.label || `Speaker ${device.deviceId.slice(0, 4)}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Camera Group */}
        <div className="flex bg-slate-800/50 rounded-xl relative device-menu-container">
          <ControlButton
            isActive={!isVideoOff}
            onClick={onToggleVideo}
            activeIcon={<Video size={20} />}
            inactiveIcon={<VideoOff size={20} />}
            activeClass="bg-slate-700 hover:bg-slate-600 text-white rounded-l-xl rounded-r-none border-r border-slate-600"
            inactiveClass="bg-red-500 hover:bg-red-600 text-white rounded-l-xl rounded-r-none border-r border-red-600"
            label={isVideoOff ? "Start Video" : "Stop Video"}
            className="!p-3 !rounded-r-none"
          />
          <button
            className={`px-1 hover:bg-slate-700 transition-colors rounded-r-xl outline-none cursor-pointer flex items-center justify-center ${!isVideoOff ? "bg-slate-700 text-white" : "bg-red-500 text-white"
              }`}
            onClick={() =>
              setActiveMenu(activeMenu === "video" ? null : "video")
            }
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${activeMenu === "video" ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Video Menu */}
          {activeMenu === "video" && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Camera
              </div>
              {videoInputDevices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    onVideoInputChange(device.deviceId);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  {selectedVideoInput === device.deviceId && (
                    <Check size={14} className="text-blue-400" />
                  )}
                  <span
                    className={
                      selectedVideoInput === device.deviceId
                        ? "text-blue-400"
                        : ""
                    }
                  >
                    {device.label || `Camera ${device.deviceId.slice(0, 4)}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>

        {/* Screen Share */}
        <ControlButton
          isActive={isScreenSharing}
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          activeIcon={<MonitorUp size={24} className="text-blue-400 transition-all ease-in-out" />}
          inactiveIcon={<MonitorUp size={20} className="transition-all ease-in-out" />}
          activeClass="bg-slate-800 text-blue-400 border border-blue-500/30 cursor-pointer"
          inactiveClass="bg-transparent hover:bg-slate-800 text-slate-300 cursor-pointer"
          label="Share Screen"
          className="hidden lg:block"
        />

        {/* Participants (Mock) */}
        <ControlButton
          isActive={!!isParticipantsOpen}
          onClick={onToggleParticipants}
          activeIcon={<Users size={20} className="text-blue-400" />}
          inactiveIcon={<Users size={20} />}
          activeClass="bg-slate-800 text-blue-400 cursor-pointer"
          inactiveClass="bg-transparent hover:bg-slate-800 text-slate-300 cursor-pointer"
          label="Participants"
        />

        {/* Chat Toggle */}
        <ControlButton
          isActive={!!isChatOpen}
          onClick={onToggleChat}
          activeIcon={<MessageSquare size={20} className="text-blue-400" />}
          inactiveIcon={<MessageSquare size={20} />}
          activeClass="bg-slate-800 text-blue-400 cursor-pointer"
          inactiveClass="bg-transparent hover:bg-slate-800 text-slate-300 relative cursor-pointer"
          label="Chat"
        >
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
        </ControlButton>

        <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>

        {/* Settings */}
        <ControlButton
          isActive={false}
          onClick={() => { }}
          activeIcon={<Settings size={20} />}
          inactiveIcon={<Settings size={20} />}
          activeClass="cursor-pointer"
          inactiveClass="bg-transparent hover:bg-slate-800 text-slate-300 hidden md:flex cursor-pointer"
          label="Settings"
        />

        {/* End Call */}
        <button
          onClick={() => setShowLeaveConfirmation(true)}
          className="ml-2 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/20 cursor-pointer"
        >
          <PhoneOff size={20} />
          <span className="hidden md:inline">End Call</span>
        </button>
      </div>

      {/* Right Section - Share */}
      <div className="absolute right-6 bottom-6 pointer-events-auto z-20 hidden md:block">
        <ControlButton
          isActive={false}
          onClick={() => setShowShareModal(true)}
          activeIcon={<Share2 size={20} className="text-blue-400" />}
          inactiveIcon={<Share2 size={20} />}
          activeClass="bg-slate-800 text-blue-400 cursor-pointer"
          inactiveClass="bg-transparent hover:bg-slate-800 text-slate-300 cursor-pointer"
          label="Share"
        />
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white border border-black rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-black mb-2">
              Leave Meeting?
            </h3>
            <p className="text-black mb-6">
              Are you sure you want to end the call? You will be disconnected.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirmation(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onLeave}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer"
              >
                Leave Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Meeting Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white border border-black rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-black mb-4">
              Share Meeting
            </h3>
            <p className="text-black mb-4">
              Copy the link below to invite others to join the meeting.
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={typeof window !== 'undefined' ? window.location.href : ''}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-black rounded-lg text-black text-sm focus:outline-none focus:ring-2 "
              />
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    // Optionally show a toast or something
                  }
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingFooter;

// Helper Component for consistent buttons
interface ControlButtonProps {
  isActive: boolean;
  onClick?: () => void;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  activeClass: string;
  inactiveClass: string;
  label: string;
  children?: React.ReactNode;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  isActive,
  onClick,
  activeIcon,
  inactiveIcon,
  activeClass,
  inactiveClass,
  label,
  children,
  className = "",
}) => {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`p-3 md:p-3.5 rounded-xl transition-all duration-200 flex items-center justify-center ${isActive ? activeClass : inactiveClass
          } ${className}`}
        aria-label={label}
      >
        {isActive ? activeIcon : inactiveIcon}
        {children}
      </button>

      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};
