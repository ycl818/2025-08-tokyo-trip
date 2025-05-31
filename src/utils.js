// Calculate countdown days
export const getCountdownInfo = () => {
  const tripDate = new Date("2025-08-01");
  const currentDate = new Date();
  const daysDifference = Math.ceil(
    (tripDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
  );

  return {
    daysUntilTrip: daysDifference,
    isCountdown: daysDifference > 0,
  };
};

// 獲取倒數計時顯示文字
export const getCountdownDisplay = () => {
  const countdownInfo = getCountdownInfo();

  if (countdownInfo.isCountdown) {
    return `還有 ${countdownInfo.daysUntilTrip} 天出發！🎌`;
  } else if (countdownInfo.daysUntilTrip === 0) {
    return "今天就出發！✈️";
  } else {
    return "旅行已結束 😊";
  }
};
