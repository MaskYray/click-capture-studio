
import * as React from "react";

interface CountdownOverlayProps {
  count: number;
  onComplete: () => void;
}

export function CountdownOverlay({ count, onComplete }: CountdownOverlayProps) {
  const [counter, setCounter] = React.useState(count);

  React.useEffect(() => {
    if (counter === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCounter(counter - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter, onComplete]);

  return (
    <div className=" w-full h-full top-0 left-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-white text-[24px] font-bold animate-pulse">
        {counter === 0 ? "Recording..." : counter}
      </div>
    </div>
  );
}
