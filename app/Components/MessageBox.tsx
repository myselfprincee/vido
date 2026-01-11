
import React from "react";
import { Send } from 'lucide-react';

interface MessageBoxProps {
  roomId: string;
  userName: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

interface Message {
  userId: string;
  senderName: string;
  text: string;
  time: string;
  sender: "me" | "other";
}

const MessageBox = ({ messages, onSendMessage }: MessageBoxProps) => {
  // No local state needed

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('message') as string;

    if (!text?.trim()) return;

    onSendMessage(text);

    e.currentTarget.reset();
  };

  return (
    <div className="h-full flex flex-col relative bg-slate-50 ">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-20">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <p>No messages yet.</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
          >
            <div className={`flex flex-col max-w-[85%] ${msg.sender === "me" ? "items-end" : "items-start"}`}>
              {/* <span className="text-[8px] text-white ml-1 bg-slate-400 py-[1px] px-2 rounded-tr-[2px] rounded-tl-[2px]">{msg.senderName}</span> */}
              <div
                className={`px-4 py-2 rounded-2xl text-sm break-words ${msg.sender === "me"
                  ? "bg-purple-600 text-white rounded-tr-none"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm"
                  }`}
              >
                <p>{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | By {msg.senderName}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 absolute w-full items-center bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="relative flex gap-2 items-center">
          <div className="relative flex flex-1 justify-center items-center">
            <textarea
              name="message"
              id="message"
              rows={1}
              placeholder="Type a message..."
              className="w-full resize-none bg-slate-100 dark:bg-slate-900 border-0 rounded-xl px-4 py-3 pr-10 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/20 outline-none placeholder:text-slate-400 min-h-[44px] max-h-32 scrollbar-none transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </div>

          <button
            type="submit"
            className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-purple-500/25 cursor-pointer active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageBox;
