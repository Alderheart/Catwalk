import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
}

const LifePage: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const addChatMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  const handleAdvanceDay = () => {
    addChatMessage("A new day begins in the colony...");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-green-100 to-green-200 flex flex-col">
      {/* Chat Container */}
      <div className="flex-1 overflow-hidden p-4">
        <div 
          ref={chatContainerRef}
          className="h-full bg-white rounded-lg shadow-inner border-2 border-green-300 p-4 overflow-y-auto"
        >
          <div className="space-y-3">
            {chatHistory.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p>Welcome to your colony's daily life!</p>
                <p className="text-sm mt-2">Press "Advance Day" to begin...</p>
              </div>
            ) : (
              chatHistory.map((message) => (
                <div key={message.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-800">{message.text}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Advance Day Button */}
      <div className="p-4">
        <button
          onClick={handleAdvanceDay}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors duration-200 text-lg"
        >
          Advance Day
        </button>
      </div>
    </div>
  );
};

export default LifePage;