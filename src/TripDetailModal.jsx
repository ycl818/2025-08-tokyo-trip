import React, { useEffect, useState } from "react";
import { MarkdownContent } from "./MarkdownContent";

const TripDetailModal = ({ selectedLocation, isModalVisible, onClose }) => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    // 處理 iOS Safari 動態視窗高度
    const updateViewportHeight = () => {
      // 使用 visualViewport API (如果支援) 或 fallback 到 innerHeight
      const height = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(height);
    };

    // 初始設定
    updateViewportHeight();

    // 監聽視窗大小變化和滾動
    const handleResize = () => {
      updateViewportHeight();
    };

    const handleScroll = () => {
      // 延遲更新避免過度觸發
      clearTimeout(window.viewportTimer);
      window.viewportTimer = setTimeout(updateViewportHeight, 100);
    };

    // 監聽事件
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 如果支援 visualViewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    // 清理
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
      clearTimeout(window.viewportTimer);
    };
  }, []);

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
          // 使用動態計算的視窗高度
          height: `${Math.min(viewportHeight * 0.95, viewportHeight - 32)}px`,
          maxHeight: `${viewportHeight - 32}px`,
          // 確保不會超出安全區域
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 改善安全區域處理 */}
        <div
          className="bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 text-white relative flex-shrink-0 rounded-t-3xl"
          style={{
            paddingTop: `max(12px, env(safe-area-inset-top, 12px))`,
            paddingBottom: "16px",
            paddingLeft: "max(16px, env(safe-area-inset-left, 16px))",
            paddingRight: "max(16px, env(safe-area-inset-right, 16px))",
          }}
        >
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
                  <div className="flex items-center space-x-2">
                    <p className="text-pink-50 text-xs md:text-sm lg:text-base flex items-center line-clamp-1 flex-1">
                      <span className="mr-1.5 flex-shrink-0">📍</span>
                      <span className="truncate">
                        {selectedLocation.location}
                      </span>
                    </p>
                    {/* 地圖連結按鈕 */}
                    {selectedLocation.locationURL && (
                      <a
                        href={selectedLocation.locationURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:bg-white/20 rounded-full px-2 py-1 flex items-center space-x-1 transition-all duration-200 flex-shrink-0 backdrop-blur-sm border border-white/20 hover:scale-105"
                        onClick={(e) => e.stopPropagation()}
                        title="在地圖中開啟"
                      >
                        <svg
                          className="w-3 h-3 md:w-4 md:h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                          在地圖中開啟
                        </span>
                      </a>
                    )}
                  </div>
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

        {/* Scrollable Content Area - 優化滾動處理 */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            // 針對 iOS 優化滾動
            WebkitOverflowScrolling: "touch",
            // 確保內容區域正確計算高度
            minHeight: 0,
          }}
        >
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

        {/* Fixed Bottom Action Area - 改善底部安全區域 */}
        <div
          className="bg-gradient-to-t from-pink-50 to-white border-t-2 border-pink-100 flex-shrink-0"
          style={{
            paddingTop: "16px",
            paddingLeft: "max(16px, env(safe-area-inset-left, 16px))",
            paddingRight: "max(16px, env(safe-area-inset-right, 16px))",
            paddingBottom: `max(16px, env(safe-area-inset-bottom, 16px))`,
          }}
        >
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
