import React, { useState, useEffect } from "react";

const PasswordModal = ({
  isVisible,
  onVerify,
  onClose,
  correctPassword = "0603",
  title = "編輯密碼",
  subtitle = "請輸入密碼~",
}) => {
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // 重置状态当模态框关闭时
  useEffect(() => {
    if (!isVisible) {
      setPasswordInput("");
      setPasswordError("");
    }
  }, [isVisible]);

  // 验证密码0603
  const verifyPassword = () => {
    if (passwordInput === correctPassword) {
      onVerify();
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("密碼錯誤!!");
      setPasswordInput("");
    }
  };

  // 处理键盘事件
  const handlePasswordKeyPress = (e) => {
    if (e.key === "Enter") {
      verifyPassword();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // 关闭模态框
  const handleClose = () => {
    setPasswordInput("");
    setPasswordError("");
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in duration-200">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔐</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={handlePasswordKeyPress}
              placeholder="請輸入4位密碼"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              maxLength="4"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-2 text-center animate-in fade-in duration-200">
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={verifyPassword}
              disabled={passwordInput.length === 0}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
