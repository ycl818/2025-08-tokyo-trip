import React, { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import TripDetailModal from "./TripDetailModal";
import { getCountdownDisplay } from "./utils";
import { Edit3, Save, X, Edit } from "lucide-react";

// 將 PocketBase 初始化移到組件外面，避免重複建立連接
const pb = new PocketBase("https://tokyo-trip-images2025.zeabur.app");

const TokyoTripSchedule = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [countdownInfo] = useState(() => getCountdownDisplay());
  const [tripData, setTripData] = useState({});
  const [backupPlans, setBackupPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 編輯模式相關狀態
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingData, setEditingData] = useState({});

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

  // 從 PocketBase 載入資料 - 加入取消機制
  const loadTripData = async (signal) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("開始載入行程資料...");

      // 獲取所有行程資料，加入 AbortController 支援
      const resultList = await pb.collection("tokyoTrip").getList(1, 50, {
        sort: "day, time",
        requestKey: null, // 禁用 PocketBase 的請求去重
      });

      // 檢查是否已被取消
      if (signal?.aborted) {
        console.log("請求已被取消");
        return;
      }

      console.log("✅ 成功載入資料:", resultList);

      // 按天分組資料，包含備用行程
      const groupedData = {};

      resultList.items.forEach((item) => {
        const itemData = {
          id: item.id,
          time: item.time,
          title: item.title,
          location: item.location,
          locationURL: item.locationURL,
          description: item.description,
          details: item.details,
          smallIcon: item.smallIcon,
          categroy: item.categroy,
          duration: item.duration,
          day: item.day,
        };

        // 所有資料都按 day 分組
        if (!groupedData[item.day]) {
          groupedData[item.day] = [];
        }
        groupedData[item.day].push(itemData);
      });

      setTripData(groupedData);

      // 設定備用行程（非 1, 2, 3 天的所有行程）
      const backupItems = [];
      Object.keys(groupedData).forEach((day) => {
        if (![1, 2, 3].includes(parseInt(day))) {
          backupItems.push(...groupedData[day]);
        }
      });
      setBackupPlans(backupItems);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("請求被主動取消");
        return;
      }
      console.error("❌ 載入行程資料失敗:", err);
      setError("載入行程資料失敗，請稍後再試");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  // 初始載入資料 - 加入清理機制
  useEffect(() => {
    const abortController = new AbortController();

    loadTripData(abortController.signal);

    // 清理函數：當組件卸載或依賴變化時取消請求
    return () => {
      console.log("清理：取消正在進行的請求");
      abortController.abort();
    };
  }, []); // 空依賴陣列，只在組件掛載時執行一次

  // Save to localStorage when selectedDay changes
  useEffect(() => {
    setStoredValue("tokyoTrip_selectedDay", selectedDay);
  }, [selectedDay]);

  // Save to localStorage when viewMode changes
  useEffect(() => {
    setStoredValue("tokyoTrip_viewMode", viewMode);
  }, [viewMode]);

  // 切換編輯模式
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      // 退出編輯模式時清除編輯狀態
      setEditingItemId(null);
      setEditingData({});
    }
  };

  // 開始編輯特定項目
  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setEditingData({
      day: item.day,
      time: item.time,
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingData({});
  };

  // 保存編輯到 PocketBase 並更新 UI
  const saveEditToPocketBase = async (itemId) => {
    try {
      const updatedData = {
        day: editingData.day,
        time: editingData.time,
      };

      // 更新到 PocketBase
      await pb.collection("tokyoTrip").update(itemId, updatedData);

      // 找到要移動的項目
      let itemToMove = null;
      let sourceLocation = null;

      // 先從所有地方找到這個項目
      if (backupPlans.find((item) => item.id === itemId)) {
        itemToMove = backupPlans.find((item) => item.id === itemId);
        sourceLocation = "backup";
      } else {
        // 從 tripData 中找
        for (const day of Object.keys(tripData)) {
          const found = tripData[day].find((item) => item.id === itemId);
          if (found) {
            itemToMove = found;
            sourceLocation = day;
            break;
          }
        }
      }

      if (!itemToMove) {
        console.error("找不到要移動的項目");
        return;
      }

      // 更新項目數據
      const updatedItem = { ...itemToMove, ...updatedData };

      // 更新 UI 狀態
      if (editingData.day === "backup") {
        // 移動到備用行程
        setBackupPlans((prev) => {
          const newBackupPlans = [...prev];
          if (sourceLocation === "backup") {
            // 在備用行程內更新
            const index = newBackupPlans.findIndex(
              (item) => item.id === itemId
            );
            if (index !== -1) {
              newBackupPlans[index] = updatedItem;
            }
          } else {
            // 從其他天移動到備用行程
            newBackupPlans.push(updatedItem);
          }
          return newBackupPlans;
        });

        // 如果是從其他天移動過來，需要從原來的位置移除
        if (sourceLocation !== "backup") {
          setTripData((prev) => {
            const newData = { ...prev };
            newData[sourceLocation] = newData[sourceLocation].filter(
              (item) => item.id !== itemId
            );
            return newData;
          });
        }
      } else {
        // 移動到指定日期
        setTripData((prev) => {
          const newData = { ...prev };

          // 如果目標天數不存在，創建空數組
          if (!newData[editingData.day]) {
            newData[editingData.day] = [];
          }

          if (sourceLocation === "backup") {
            // 從備用行程移動到指定天
            newData[editingData.day].push(updatedItem);
          } else if (sourceLocation === editingData.day) {
            // 在同一天內更新
            const index = newData[editingData.day].findIndex(
              (item) => item.id === itemId
            );
            if (index !== -1) {
              newData[editingData.day][index] = updatedItem;
            }
          } else {
            // 從其他天移動到目標天
            newData[sourceLocation] = newData[sourceLocation].filter(
              (item) => item.id !== itemId
            );
            newData[editingData.day].push(updatedItem);
          }

          // 按時間排序
          newData[editingData.day].sort((a, b) => a.time.localeCompare(b.time));

          return newData;
        });

        // 如果是從備用行程移動過來，需要從備用行程中移除
        if (sourceLocation === "backup") {
          setBackupPlans((prev) => prev.filter((item) => item.id !== itemId));
        }
      }

      // 清除編輯狀態
      setEditingItemId(null);
      setEditingData({});

      console.log("✅ 成功更新到 PocketBase 並更新 UI");
    } catch (error) {
      console.error("❌ 更新 PocketBase 失敗:", error);
      alert("更新失敗，請稍後再試");
    }
  };

  // 更新編輯數據
  const updateEditData = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openDetail = (location) => {
    if (isEditMode) return; // 編輯模式下不開啟詳情
    setSelectedLocation(location);
    setTimeout(() => setIsModalVisible(true), 10);
  };

  const closeDetail = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedLocation(null), 300);
  };

  useEffect(() => {
    setVisibleItems(new Set());

    const items =
      selectedDay === "backup" ? backupPlans : tripData[selectedDay] || [];
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, item.id]));
      }, index * 150);
    });
  }, [selectedDay, tripData, backupPlans]);

  const isVisible = (itemId) => visibleItems.has(itemId);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入行程資料中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadTripData()}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 檢查是否有該天的資料
  const currentDayData =
    selectedDay === "backup" ? backupPlans : tripData[selectedDay] || [];

  // 渲染編輯按鈕的函數
  const renderEditButton = (item) => {
    if (!isEditMode) return null;

    return (
      <div className="absolute top-4 right-4 z-10">
        {editingItemId === item.id ? (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                saveEditToPocketBase(item.id);
              }}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-lg"
              title="保存"
            >
              <Save size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelEdit();
              }}
              className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors shadow-lg"
              title="取消"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              startEditItem(item);
            }}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            title="編輯"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>
    );
  };

  // 渲染編輯表單的函數
  const renderEditForm = (item) => {
    if (editingItemId !== item.id) return null;

    return (
      <div className="space-y-4 mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            時間
          </label>
          <input
            type="time"
            value={editingData.time}
            onChange={(e) => updateEditData("time", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            安排到
          </label>
          <select
            value={editingData.day}
            onChange={(e) => updateEditData("day", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="backup">備用行程</option>
            <option value="1">Day 1</option>
            <option value="2">Day 2</option>
            <option value="3">Day 3</option>
          </select>
        </div>
      </div>
    );
  };

  // Timeline Mode
  const renderTimelineMode = () => (
    <div className="max-w-4xl mx-auto">
      {currentDayData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">這天還沒有安排行程</p>
        </div>
      ) : (
        <div className="relative">
          {/* Desktop: Vertical line in center, Mobile: Left side */}
          <div className="absolute md:left-1/2 left-15.5 md:transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-300 to-orange-300 rounded-full"></div>

          {currentDayData.map((item) => (
            <div
              key={item.id}
              className={`relative mb-8 last:mb-0 timeline-item ${
                isVisible(item.id) ? "visible" : ""
              }`}
              style={{
                animationDelay: `${currentDayData.indexOf(item) * 150}ms`,
              }}
            >
              {/* Mobile Layout */}
              <div className="md:hidden flex items-start">
                {/* Time and dot */}
                <div className="flex flex-col items-center w-32 flex-shrink-0">
                  <div className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-full mb-2 whitespace-nowrap">
                    {item.time}
                  </div>
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 relative">
                  {renderEditButton(item)}
                  <div
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg transition-all duration-300 border border-white/50 ${
                      editingItemId === item.id
                        ? "ring-2 ring-blue-400"
                        : "hover:shadow-xl cursor-pointer"
                    }`}
                    onClick={() => openDetail(item)}
                  >
                    <div className="flex items-start mb-3">
                      <span className="text-2xl mr-1 mt-1 flex-shrink-0">
                        {item.smallIcon}
                      </span>
                      <div className="flex-1 pr-12">
                        <h3 className="font-bold text-base text-gray-800 leading-tight mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-red-500 text-sm font-medium">
                            📍 {item.location}
                          </p>
                          {item.duration && (
                            <span className="text-gray-500 text-sm">
                              ⏱️ {item.duration}
                            </span>
                          )}
                          {item.categroy && (
                            <span className="text-gray-500 text-sm">
                              {item.categroy}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {renderEditForm(item)}
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="inline-block bg-red-500 text-white font-semibold px-4 py-2 rounded-full">
                    {item.time}
                  </div>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full border-4 border-white shadow-lg z-10"></div>

                <div className="w-1/2 pl-8 relative">
                  {renderEditButton(item)}
                  <div
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all duration-300 border border-white/50 ${
                      editingItemId === item.id
                        ? "ring-2 ring-blue-400"
                        : "hover:shadow-xl hover:scale-105 cursor-pointer"
                    }`}
                    onClick={() => openDetail(item)}
                  >
                    <div className="flex items-center mb-3 pr-12">
                      <span className="text-3xl mr-3">{item.smallIcon}</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-red-500 text-sm font-medium">
                            📍 {item.location}
                          </p>
                          {item.duration && (
                            <span className="text-gray-500 text-sm">
                              ⏱️ {item.duration}
                            </span>
                          )}
                          {item.categroy && (
                            <span className="text-gray-500 text-sm">
                              {item.categroy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                    {renderEditForm(item)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Card Mode
  const renderCardMode = () => (
    <div className="max-w-6xl mx-auto">
      {currentDayData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">這天還沒有安排行程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDayData.map((item) => (
            <div
              key={item.id}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all duration-300 border border-white/50 relative ${
                editingItemId === item.id
                  ? "ring-2 ring-blue-400"
                  : "hover:shadow-xl hover:scale-105 cursor-pointer"
              } ${
                isVisible(item.id)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: `${currentDayData.indexOf(item) * 100}ms`,
              }}
              onClick={() => openDetail(item)}
            >
              {renderEditButton(item)}

              <div className="flex items-center mb-4 pr-12">
                <div className="bg-red-500 text-white text-sm font-bold px-3 py-2 rounded-full mr-3">
                  {item.time}
                </div>
                <span className="text-2xl">{item.smallIcon}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-red-500 text-sm font-medium">
                  📍 {item.location}
                </p>
                {item.duration && (
                  <span className="text-gray-500 text-sm">
                    ⏱️ {item.duration}
                  </span>
                )}
                {item.categroy && (
                  <span className="text-gray-500 text-sm">{item.categroy}</span>
                )}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {item.description}
              </p>

              {renderEditForm(item)}
            </div>
          ))}
        </div>
      )}
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
          <div className="bg-white/70 backdrop-blur-sm rounded-full p-1 shadow-lg flex w-full max-w-md">
            {[1, 2, 3, "backup"].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-2 px-3 rounded-full font-semibold transition-all duration-300 text-sm ${
                  selectedDay === day
                    ? day === "backup"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-red-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                {day === "backup" ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>📋</span>
                    <span className="hidden sm:inline">Backup</span>
                  </div>
                ) : (
                  `Day ${day}`
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Countdown info, View Mode switcher, and Edit Mode button */}
        <div className="flex flex-row justify-center items-center gap-4 mb-6 px-4">
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

          {/* Edit Mode Toggle Button */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <button
              onClick={toggleEditMode}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 text-sm font-medium ${
                isEditMode
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-white/50"
              }`}
              title={isEditMode ? "退出編輯模式" : "編輯行程"}
            >
              <Edit size={16} />
              <span className="hidden sm:inline">
                {isEditMode ? "完成" : "編輯"}
              </span>
            </button>
          </div>
        </div>

        {/* Edit Mode Notice */}
        {isEditMode && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Edit3 size={20} />
                <span className="font-semibold">編輯模式已啟用</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                點擊任何行程項目的編輯按鈕來調整時間或移動到其他天數
              </p>
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {selectedDay === "backup" ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                📋 備用行程
              </h2>
              <p className="text-gray-600">彈性安排的候選景點</p>
            </div>
            {backupPlans.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🤔</span>
                <p className="text-gray-500 text-lg">目前沒有備用行程</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {backupPlans.map((item, index) => (
                  <div
                    key={item.id}
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all duration-300 border border-white/50 relative ${
                      editingItemId === item.id
                        ? "ring-2 ring-blue-400"
                        : "hover:shadow-xl hover:scale-105"
                    } ${
                      isVisible(item.id)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                    }}
                    onClick={() =>
                      editingItemId !== item.id && openDetail(item)
                    }
                  >
                    {/* 編輯按鈕 - 位於卡片右上角 */}
                    {renderEditButton(item)}

                    <div className="flex items-start gap-3 mb-3 pr-16">
                      <span className="text-2xl flex-shrink-0">
                        {item.smallIcon}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="text-blue-500 text-sm font-medium">
                            📍 {item.location}
                          </p>
                          {item.duration && (
                            <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">
                              ⏱️ {item.duration}
                            </span>
                          )}
                          {item.categroy && (
                            <span className="text-gray-500 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              {item.categroy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 編輯表單 */}
                    {renderEditForm(item)}

                    {/* 顯示當前時間信息 */}
                    {editingItemId !== item.id && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            ⏰ {item.time}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {viewMode === "timeline" && renderTimelineMode()}
            {viewMode === "accordion" && renderCardMode()}
          </>
        )}
      </div>

      {/* 主要行程詳細模態窗口 */}
      <TripDetailModal
        selectedLocation={selectedLocation}
        isModalVisible={isModalVisible}
        onClose={closeDetail}
      />
    </div>
  );
};

export default TokyoTripSchedule;
