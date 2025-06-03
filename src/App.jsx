import { useState } from "react";
import "./App.css";
import TokyoTripSchedule from "./TokyoTripSchedule";
import BookOpeningAnimation from "./BookOpeningAnimation";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleAnimationComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return (
      <BookOpeningAnimation onAnimationComplete={handleAnimationComplete} />
    );
  }

  return <TokyoTripSchedule />;
}

export default App;
