import React, { useEffect, useState } from "react";

const BookOpeningAnimation = ({ onAnimationComplete }) => {
  const [bookAnimationStarted, setBookAnimationStarted] = useState(false);

  useEffect(() => {
    // 10秒後自動開始翻書動畫
    const autoFlipTimer = setTimeout(() => {
      setBookAnimationStarted(true);
    }, 10000);

    // 翻書動畫開始後3秒完成
    let completeTimer;
    if (bookAnimationStarted) {
      completeTimer = setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);
    }

    return () => {
      clearTimeout(autoFlipTimer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [bookAnimationStarted, onAnimationComplete]);

  const handleBookClick = () => {
    if (!bookAnimationStarted) {
      setBookAnimationStarted(true);
      // 點擊後3秒完成
      setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-100 via-orange-100 to-pink-100">
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .book-container {
          position: relative;
          width: 320px;
          height: 400px;
          transform-style: preserve-3d;
          animation: bookFloat 3s ease-in-out infinite;
        }

        .book-container.animate-flip {
          animation: bookFloat 3s ease-in-out infinite,
            bookPrepareFlip 0.5s ease-in-out forwards;
        }

        .book-page {
          position: absolute;
          width: 300px;
          height: 400px;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backface-visibility: hidden;
          transform-origin: left center;
        }

        .book-cover {
          z-index: 2;
        }

        .book-cover.animate-flip {
          animation: pageFlip 2s ease-in-out forwards;
        }

        .book-content {
          transform: rotateY(180deg);
          z-index: 1;
        }

        .book-content.animate-flip {
          animation: showContent 2s ease-in-out forwards;
        }

        .book-spine {
          position: absolute;
          left: -8px;
          top: 0;
          width: 16px;
          height: 400px;
          background: linear-gradient(135deg, #dc2626, #ea580c, #dc2626);
          border-radius: 8px 0 0 8px;
          box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.2),
            -2px 0 8px rgba(0, 0, 0, 0.3);
          z-index: 1;
          transform: rotateY(-5deg);
        }

        .book-spine.animate-flip {
          animation: spineDisappear 2s ease-in-out forwards;
        }

        .book-spine::before {
          content: "";
          position: absolute;
          top: 20px;
          left: 2px;
          right: 2px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
        }

        .book-spine::after {
          content: "";
          position: absolute;
          bottom: 20px;
          left: 2px;
          right: 2px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 0, 0, 0.2),
            transparent
          );
        }

        @keyframes bookFloat {
          0%,
          100% {
            transform: translateY(0px) rotateY(5deg);
          }
          50% {
            transform: translateY(-10px) rotateY(-5deg);
          }
        }

        @keyframes bookPrepareFlip {
          0% {
            transform: translateY(0px) rotateY(5deg);
          }
          100% {
            transform: translateY(0px) rotateY(0deg);
          }
        }

        @keyframes pageFlip {
          0% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          50% {
            transform: rotateY(-90deg);
            opacity: 0.5;
          }
          100% {
            transform: rotateY(-180deg);
            opacity: 0;
          }
        }

        @keyframes showContent {
          0% {
            transform: rotateY(180deg);
            opacity: 0;
          }
          50% {
            transform: rotateY(90deg);
            opacity: 0.5;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes spineDisappear {
          0% {
            opacity: 1;
            transform: rotateY(-5deg) scale(1);
          }
          50% {
            opacity: 0.3;
            transform: rotateY(-5deg) scale(0.9);
          }
          100% {
            opacity: 0;
            transform: rotateY(-5deg) scale(0.7);
          }
        }
      `}</style>

      {/* 書本封面 */}
      <div className="relative perspective-1000">
        <div
          className={`book-container ${
            bookAnimationStarted ? "animate-flip" : ""
          }`}
        >
          {/* 立體書脊 */}
          <div
            className={`book-spine ${
              bookAnimationStarted ? "animate-flip" : ""
            }`}
          ></div>

          {/* 左頁（封面） */}
          <div
            className={`book-page book-cover bg-gradient-to-br from-red-50 to-orange-50 border-r border-red-200 ${
              bookAnimationStarted ? "animate-flip" : ""
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-6xl mb-4 animate-bounce">🏯</div>
              <h1 className="text-2xl font-bold text-red-800 mb-2 text-center">
                東京自由行
              </h1>
              <p className="text-red-600 text-sm">2025.08.01~2025.08.03</p>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="animate-pulse text-red-500 text-xs">
                  點擊翻開...
                </div>
              </div>
            </div>
          </div>

          {/* 右頁（內容預覽） */}
          <div
            className={`book-page book-content bg-gradient-to-br from-orange-50 to-pink-50 ${
              bookAnimationStarted ? "animate-flip" : ""
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-2xl">🍜</div>
                <div className="text-2xl">🗼</div>
                <div className="text-2xl">🌸</div>
                <div className="text-2xl">🍱</div>
              </div>
              <div className="text-center">
                <p className="text-orange-800 font-medium mb-2">精彩行程</p>
                <p className="text-orange-600 text-sm">美食 · 景點 · 體驗</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 點擊區域 */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleBookClick}
      ></div>
    </div>
  );
};

export default BookOpeningAnimation;
