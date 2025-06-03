import React, { useState, useEffect } from "react";

// 圖片緩存
const imageCache = new Map();

// 緩存圖片的函數
const getCachedImage = async (url) => {
  // 檢查是否為你的 Zeabur 圖片 (支援兩個域名)
  if (
    !url.includes("image-tokyo-management-yc.zeabur.app") &&
    !url.includes("tokyo-trip-images2025.zeabur.app")
  ) {
    return url; // 不是你的圖片，直接返回原 URL
  }

  // 檢查緩存
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  try {
    // 下載圖片
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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

export const MarkdownContent = ({ content }) => {
  const [processedContent, setProcessedContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processImages = async () => {
      setIsProcessing(true);
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
      setIsProcessing(false);
    };

    if (content) {
      processImages();
    }
  }, [content]);

  const parseInlineFormatting = (text) => {
    // 支援更多格式：粗體 **text**、斜體 *text*、程式碼 `code`
    let parts = [text];

    // 處理粗體
    parts = parts.flatMap((part) => {
      if (typeof part === "string") {
        return part.split(/(\*\*.*?\*\*)/g);
      }
      return part;
    });

    // 處理斜體
    parts = parts.flatMap((part) => {
      if (typeof part === "string" && !part.startsWith("**")) {
        return part.split(/(\*.*?\*)/g);
      }
      return part;
    });

    // 處理程式碼
    parts = parts.flatMap((part) => {
      if (typeof part === "string" && !part.startsWith("*")) {
        return part.split(/(` + "`" + `.*?` + "`" + `)/g);
      }
      return part;
    });

    return parts.map((part, index) => {
      if (typeof part !== "string") return part;

      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-gray-800">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && !part.includes("**")) {
        return (
          <em key={index} className="italic text-gray-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const parseContent = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let skipNext = 0;

    lines.forEach((line, index) => {
      if (skipNext > 0) {
        skipNext--;
        return;
      }

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
              <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={altText}
                  className="w-full h-auto object-cover max-h-96 transition-opacity duration-300"
                  loading="lazy"
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
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">🖼️</span>
                    <span className="text-sm">圖片載入失敗</span>
                  </div>
                </div>
              </div>
              {caption && (
                <p className="text-sm text-gray-500 text-center mt-3 italic">
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
            className="text-3xl font-bold text-gray-800 mb-4 mt-8 first:mt-0 border-b-2 border-blue-200 pb-2"
          >
            {parseInlineFormatting(line.replace("# ", ""))}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={index}
            className="text-2xl font-semibold text-gray-800 mb-3 mt-6 first:mt-0"
          >
            {parseInlineFormatting(line.replace("## ", ""))}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={index}
            className="text-xl font-semibold text-gray-700 mb-2 mt-5 first:mt-0"
          >
            {parseInlineFormatting(line.replace("### ", ""))}
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

          skipNext = listItems.length - 1;

          elements.push(
            <ul
              key={index}
              className="list-disc list-inside space-y-2 mb-4 text-gray-600 ml-4"
            >
              {listItems.map((item, i) => (
                <li key={i} className="leading-relaxed pl-2">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        }
      } else if (line.match(/^\d+\. /)) {
        // 支援有序列表
        const prevLineWasNumberedList =
          index > 0 && lines[index - 1].match(/^\d+\. /);

        if (!prevLineWasNumberedList) {
          const listItems = [];
          let currentIndex = index;
          while (
            currentIndex < lines.length &&
            lines[currentIndex].match(/^\d+\. /)
          ) {
            listItems.push(lines[currentIndex].replace(/^\d+\. /, ""));
            currentIndex++;
          }

          skipNext = listItems.length - 1;

          elements.push(
            <ol
              key={index}
              className="list-decimal list-inside space-y-2 mb-4 text-gray-600 ml-4"
            >
              {listItems.map((item, i) => (
                <li key={i} className="leading-relaxed pl-2">
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ol>
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

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="prose max-w-none">
      {parseContent(processedContent || content)}
    </div>
  );
};

// 清理緩存的函數
export const clearImageCache = () => {
  imageCache.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
  imageCache.clear();
};
