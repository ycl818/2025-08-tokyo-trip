import React, { useEffect, useState } from "react";

import { tripData } from "./data/tripData";
import TripDetailModal from "./TripDetailModal";
import { getCountdownDisplay } from "./utils";

const TokyoTripSchedule = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [countdownInfo] = useState(() => getCountdownDisplay());

  // Helper functions for localStorage with fallback
  const getStoredValue = (key, defaultValue) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      }
    } catch (error) {
      console.warn(`Failed to read from localStorage for key "${key}":`, error);
    }
    return defaultValue;
  };

  const setStoredValue = (key, value) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Failed to write to localStorage for key "${key}":`, error);
    }
  };

  // Initialize state with values from localStorage
  const [selectedDay, setSelectedDay] = useState(() =>
    getStoredValue("tokyoTrip_selectedDay", 1)
  );
  const [viewMode, setViewMode] = useState(() =>
    getStoredValue("tokyoTrip_viewMode", "timeline")
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());

  // Save to localStorage when selectedDay changes
  useEffect(() => {
    setStoredValue("tokyoTrip_selectedDay", selectedDay);
  }, [selectedDay]);

  // Save to localStorage when viewMode changes
  useEffect(() => {
    setStoredValue("tokyoTrip_viewMode", viewMode);
  }, [viewMode]);

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

  // Timeline Mode
  const renderTimelineMode = () => (
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
              animationDelay: `${tripData[selectedDay].indexOf(item) * 150}ms`,
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
              <div className="flex-1">
                <div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/50"
                  onClick={() => openDetail(item)}
                >
                  <div className="flex items-start mb-3">
                    <span className="text-2xl mr-1 mt-1 flex-shrink-0">
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
  );

  // Card Mode
  const renderCardMode = () => (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripData[selectedDay].map((item) => (
          <div
            key={item.id}
            className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border border-white/50 ${
              isVisible(item.id)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: `${tripData[selectedDay].indexOf(item) * 100}ms`,
            }}
            onClick={() => openDetail(item)}
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-500 text-white text-sm font-bold px-3 py-2 rounded-full mr-3">
                {item.time}
              </div>
              <span className="text-2xl">{item.image}</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              {item.title}
            </h3>
            <p className="text-red-500 text-sm font-medium mb-3">
              📍 {item.location}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

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

        {/* Countdown info and View Mode switcher */}
        <div className="flex flex-row justify-center items-center gap-4 mb-6 px-4">
          {/* Countdown Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-md">⏰</span>
              </div>
              <div className="text-gray-600">
                <div className="font-bold">{countdownInfo}</div>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 text-sm font-medium ${
                  viewMode === "timeline"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-white/50"
                }`}
                title="Timeline View"
              >
                <span className="text-base">🌸</span>
              </button>
              <button
                onClick={() => setViewMode("accordion")}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 text-sm font-medium ${
                  viewMode === "accordion"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-white/50"
                }`}
                title="Card View"
              >
                <span className="text-base">🎋</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === "timeline" && renderTimelineMode()}
        {viewMode === "accordion" && renderCardMode()}
      </div>

      {/* Use the extracted Modal Component */}
      <TripDetailModal
        selectedLocation={selectedLocation}
        isModalVisible={isModalVisible}
        onClose={closeDetail}
      />
    </div>
  );
};

export default TokyoTripSchedule;
