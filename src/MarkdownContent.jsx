// 修正的 Markdown 解析器組件
export const MarkdownContent = ({ content }) => {
  const parseContent = (text) => {
    const lines = text.split("\n");
    const elements = [];

    lines.forEach((line, index) => {
      if (line.trim() === "") {
        elements.push(<br key={index} />);
      } else if (line.startsWith("![")) {
        // 處理圖片 ![alt text](url) 或 ![alt text](url "caption")
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
                    // 隱藏圖片，顯示錯誤訊息
                    e.target.style.display = "none";
                    const errorDiv = e.target.nextElementSibling;
                    if (errorDiv) {
                      errorDiv.style.display = "flex";
                    }
                  }}
                  onLoad={(e) => {
                    // 圖片載入成功時，確保錯誤訊息是隱藏的
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
        // 檢查前一行是否也是列表項目
        const prevLineWasList =
          index > 0 &&
          (lines[index - 1].startsWith("- ") ||
            lines[index - 1].startsWith("* "));

        if (!prevLineWasList) {
          // 開始新的列表，收集所有連續的列表項目
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
        // 如果前一行是列表項目，這一行會被上面的邏輯處理，所以這裡不做任何事
      } else {
        // 一般段落文字
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
    // 處理粗體 **text**
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

  return <div>{parseContent(content)}</div>;
};
