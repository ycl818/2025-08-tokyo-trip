import React, { useEffect, useState } from "react";

import { tripData } from "./data/tripData";
import { MarkdownContent } from "./MarkdownContent";

const TokyoTripSchedule = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [visibleItems, setVisibleItems] = useState(new Set());

  const openDetail = (location) => {
    setSelectedLocation(location);
    setTimeout(() => setIsModalVisible(true), 10); // Small delay for animation
  };

  const closeDetail = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedLocation(null), 300); // Wait for animation to complete
  };

  useEffect(() => {
    setVisibleItems(new Set());

    const items = tripData[selectedDay] || [];
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, item.id]));
      }, index * 150);
    });
  }, [selectedDay]);

  const isVisible = (itemId) => visibleItems.has(itemId);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Japanese-inspired background */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-red-300"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-orange-300"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-pink-300"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-red-200"></div>
        </div>
        {/* Subtle wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-100/20 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            🏯 東京自由行
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            2025.08.01~2025.08.03
          </p>
        </div>

        {/* Day Switch Buttons */}
        <div className="flex justify-center mb-8 px-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-full p-1 shadow-lg flex w-full max-w-xs">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-300 text-sm ${
                  selectedDay === day
                    ? "bg-red-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Desktop: Vertical line in center, Mobile: Left side */}
            <div className="absolute md:left-1/2 left-15.5 md:transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-300 to-orange-300 rounded-full"></div>

            {tripData[selectedDay].map((item) => (
              <div
                key={item.id}
                className={`relative mb-8 last:mb-0 timeline-item ${
                  isVisible(item.id) ? "visible" : ""
                }`}
                style={{
                  animationDelay: `${
                    tripData[selectedDay].indexOf(item) * 150
                  }ms`,
                }}
              >
                {/* Mobile Layout */}
                <div className="md:hidden flex items-start">
                  {/* Time and dot */}
                  <div className="flex flex-col items-center w-32 flex-shrink-0">
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-full mb-2 whitespace-nowrap">
                      {item.time}
                    </div>
                    {/* Dot positioned on the timeline */}
                    <div className="relative">
                      <div className="w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 ml-6">
                    <div
                      className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/50"
                      onClick={() => openDetail(item)}
                    >
                      <div className="flex items-start mb-3">
                        <span className="text-2xl mr-3 mt-1 flex-shrink-0">
                          {item.image}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-gray-800 leading-tight mb-1">
                            {item.title}
                          </h3>
                          <p className="text-red-500 text-sm font-medium mb-2">
                            📍 {item.location}
                          </p>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center">
                  {/* Time (left side) */}
                  <div className="w-1/2 pr-8 text-right">
                    <div className="inline-block bg-red-500 text-white font-semibold px-4 py-2 rounded-full">
                      {item.time}
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full border-4 border-white shadow-lg z-10"></div>

                  {/* Activity (right side) */}
                  <div className="w-1/2 pl-8">
                    <div
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border border-white/50"
                      onClick={() => openDetail(item)}
                    >
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">{item.image}</span>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {item.title}
                          </h3>
                          <p className="text-red-500 text-sm font-medium">
                            📍 {item.location}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Modal with Tokyo Pink Theme */}
      {selectedLocation && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-end justify-center transition-all duration-300 ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDetail}
        >
          <div
            className={`bg-white rounded-t-3xl w-full max-w-4xl h-[98vh] shadow-2xl transform transition-all duration-500 ease-out flex flex-col ${
              isModalVisible ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed with Tokyo Pink Gradient */}
            <div className="bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 text-white p-6 relative flex-shrink-0">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-white/40 rounded-full"></div>

              <div className="flex justify-between items-start mt-2">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                    <span className="text-4xl block">
                      {selectedLocation.image}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-sm">
                      {selectedLocation.title}
                    </h2>
                    <div className="space-y-1">
                      <p className="text-pink-50 text-base md:text-lg flex items-center">
                        <span className="mr-2">📍</span>
                        {selectedLocation.location}
                      </p>
                      <p className="text-pink-50 text-base md:text-lg flex items-center">
                        <span className="mr-2">🕐</span>
                        {selectedLocation.time}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetail}
                  className="text-white hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 flex-shrink-0 backdrop-blur-sm border border-white/20 hover:scale-110"
                >
                  <svg
                    className="w-6 h-6"
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
              <div className="p-8">
                {/* Rich Content Area */}
                <div className="prose prose-sm max-w-none">
                  {selectedLocation.details ? (
                    <MarkdownContent content={selectedLocation.details} />
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-gradient-to-b from-pink-400 to-rose-400 rounded-full mr-3"></span>
                        關於這個地點
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
                        暫無詳細資訊提供。
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Image placeholder */}
                <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-3xl h-48 md:h-64 flex items-center justify-center text-pink-300 text-5xl md:text-6xl mb-6 mt-8 border border-pink-100 shadow-inner">
                  <div className="text-center">
                    <div className="text-6xl md:text-7xl mb-2">📷</div>
                    <p className="text-pink-400 text-sm font-medium">
                      精美照片即將呈現
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Action Area with Tokyo Pink Theme */}
            <div className="bg-gradient-to-t from-pink-50 to-white border-t-2 border-pink-100 p-6 flex-shrink-0">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                  <p className="text-pink-600 text-sm font-medium mb-1">
                    探索更多精彩內容
                  </p>
                  <p className="text-gray-500 text-xs ">繼續你的東京之旅</p>
                </div>
                <div className="flex space-x-3 w-full ">
                  <button
                    onClick={closeDetail}
                    className="flex-1  bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-200 transition-all duration-300 transform hover:scale-105 hover:from-pink-500 hover:to-rose-500"
                  >
                    精彩繼續 ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokyoTripSchedule;
