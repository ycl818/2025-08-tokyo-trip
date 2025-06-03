// 簡單的圖片緩存
const imageCache = new Map();

// 緩存圖片的函數
const getCachedImage = async (url) => {
  // 檢查是否為你的 Zeabur 圖片
  if (!url.includes("image-tokyo-management-yc.zeabur.app")) {
    return url; // 不是你的圖片，直接返回原 URL
  }

  // 檢查緩存
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  try {
    // 下載圖片
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    // 存入緩存
    imageCache.set(url, objectUrl);
    return objectUrl;
  } catch (error) {
    console.error("圖片載入失敗:", error);
    return url; // 失敗時返回原 URL
  }
};

// 修改你的 MarkdownContent 組件
import React, { useState, useEffect } from "react";

export const MarkdownContent = ({ content }) => {
  const [processedContent, setProcessedContent] = useState("");

  useEffect(() => {
    const processImages = async () => {
      let processed = content;

      // 找出所有圖片
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      const matches = [...content.matchAll(imageRegex)];

      // 處理每張圖片
      for (const match of matches) {
        // eslint-disable-next-line no-unused-vars
        const [fullMatch, altText, urlAndCaption] = match;
        const urlMatch = urlAndCaption.match(/^([^"]+)(?:\s+"([^"]*)")?/);
        const imageUrl = urlMatch ? urlMatch[1].trim() : urlAndCaption;

        // 獲取緩存的圖片 URL
        const cachedUrl = await getCachedImage(imageUrl);

        // 替換原始 URL
        if (cachedUrl !== imageUrl) {
          const newMatch = fullMatch.replace(imageUrl, cachedUrl);
          processed = processed.replace(fullMatch, newMatch);
        }
      }

      setProcessedContent(processed);
    };

    processImages();
  }, [content]);

  const parseContent = (text) => {
    const lines = text.split("\n");
    const elements = [];

    lines.forEach((line, index) => {
      if (line.trim() === "") {
        elements.push(<br key={index} />);
      } else if (line.startsWith("![")) {
        const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const [, altText, urlAndCaption] = imageMatch;
          const urlMatch = urlAndCaption.match(/^([^"]+)(?:\s+"([^"]*)")?/);
          const imageUrl = urlMatch ? urlMatch[1].trim() : urlAndCaption;
          const caption = urlMatch && urlMatch[2] ? urlMatch[2] : altText;

          elements.push(
            <div key={index} className="my-6">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={altText}
                  className="w-full h-auto rounded-lg shadow-md object-cover max-h-64"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const errorDiv = e.target.nextElementSibling;
                    if (errorDiv) {
                      errorDiv.style.display = "flex";
                    }
                  }}
                  onLoad={(e) => {
                    const errorDiv = e.target.nextElementSibling;
                    if (errorDiv) {
                      errorDiv.style.display = "none";
                    }
                  }}
                />
                <div
                  className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-400"
                  style={{ display: "none" }}
                >
                  <span className="text-4xl">🖼️</span>
                  <span className="ml-2">圖片載入失敗</span>
                </div>
              </div>
              {caption && (
                <p className="text-sm text-gray-500 text-center mt-2 italic">
                  {caption}
                </p>
              )}
            </div>
          );
        }
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={index}
            className="text-2xl font-bold text-gray-800 mb-4 mt-6 first:mt-0"
          >
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={index}
            className="text-xl font-semibold text-gray-800 mb-3 mt-5 first:mt-0"
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={index}
            className="text-lg font-semibold text-gray-700 mb-2 mt-4 first:mt-0"
          >
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        const prevLineWasList =
          index > 0 &&
          (lines[index - 1].startsWith("- ") ||
            lines[index - 1].startsWith("* "));

        if (!prevLineWasList) {
          const listItems = [];
          let currentIndex = index;
          while (
            currentIndex < lines.length &&
            (lines[currentIndex].startsWith("- ") ||
              lines[currentIndex].startsWith("* "))
          ) {
            listItems.push(lines[currentIndex].replace(/^[-*] /, ""));
            currentIndex++;
          }

          elements.push(
            <ul
              key={index}
              className="list-disc list-inside space-y-2 mb-4 text-gray-600 ml-4"
            >
              {listItems.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        }
      } else {
        elements.push(
          <p key={index} className="text-gray-600 leading-relaxed mb-4">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    });

    return elements;
  };

  const parseInlineFormatting = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-gray-800">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return <div>{parseContent(processedContent || content)}</div>;
};

// 清理緩存的函數（可選）
export const clearImageCache = () => {
  imageCache.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
  imageCache.clear();
};
