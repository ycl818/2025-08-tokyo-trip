import React from "react";
import { MarkdownContent } from "./MarkdownContent";

const TripDetailModal = ({ selectedLocation, isModalVisible, onClose }) => {
  if (!selectedLocation) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-end justify-center transition-all duration-300 ${
        isModalVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-t-3xl w-full max-w-4xl shadow-2xl transform transition-all duration-500 ease-out flex flex-col ${
          isModalVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          height: "calc(100vh - env(safe-area-inset-top) - 8px)",
          maxHeight: "98vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Mobile Safe with responsive padding */}
        <div className="bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 text-white relative flex-shrink-0 pt-3 pb-4 px-4 md:p-4">
          {/* Handle Bar */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-white/40 rounded-full"></div>

          <div className="flex justify-between items-start mt-3 md:mt-2">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="bg-white/20 rounded-xl p-2 backdrop-blur-sm flex-shrink-0">
                <span className="text-xl md:text-2xl block">
                  {selectedLocation.image}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg lg:text-xl font-bold mb-1 drop-shadow-sm line-clamp-2">
                  {selectedLocation.title}
                </h2>
                <div className="space-y-0.5">
                  <p className="text-pink-50 text-xs md:text-sm lg:text-base flex items-center line-clamp-1">
                    <span className="mr-1.5 flex-shrink-0">📍</span>
                    <span className="truncate">
                      {selectedLocation.location}
                    </span>
                  </p>
                  <p className="text-pink-50 text-xs md:text-sm lg:text-base flex items-center">
                    <span className="mr-1.5 flex-shrink-0">🕐</span>
                    <span>{selectedLocation.time}</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-200 flex-shrink-0 backdrop-blur-sm border border-white/20 hover:scale-110 ml-2"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Rich Content Area */}
            <div className="prose prose-sm max-w-none">
              {selectedLocation.details ? (
                <MarkdownContent content={selectedLocation.details} />
              ) : (
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-1 h-6 bg-gradient-to-b from-pink-400 to-rose-400 rounded-full mr-3 flex-shrink-0"></span>
                    關於這個地點
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base lg:text-lg mb-6">
                    暫無詳細資訊提供。
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Image placeholder */}
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-3xl h-40 md:h-48 lg:h-64 flex items-center justify-center text-pink-300 mb-6 mt-6 md:mt-8 border border-pink-100 shadow-inner">
              <div className="text-center">
                <div className="text-4xl md:text-6xl lg:text-7xl mb-2">📷</div>
                <p className="text-pink-400 text-xs md:text-sm font-medium">
                  精美照片即將呈現
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Area */}
        <div className="bg-gradient-to-t from-pink-50 to-white border-t-2 border-pink-100 p-4 flex-shrink-0 safe-area-bottom">
          <div className="flex items-center justify-center">
            <button
              onClick={onClose}
              className="w-full max-w-sm bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-200 transition-all duration-300 transform hover:scale-105 hover:from-pink-500 hover:to-rose-500 text-sm md:text-base"
            >
              精彩繼續 ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailModal;
