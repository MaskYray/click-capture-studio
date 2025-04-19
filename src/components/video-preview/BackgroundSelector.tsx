
interface BackgroundSelectorProps {
  backgrounds: string[];
  selectedBackground: number;
  onBackgroundSelect: (index: number) => void;
}

export function BackgroundSelector({
  backgrounds,
  selectedBackground,
  onBackgroundSelect
}: BackgroundSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {backgrounds.map((bg, index) => (
        <button
          key={index}
          className={`aspect-video rounded-lg cursor-pointer ${bg} ${
            selectedBackground === index ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onBackgroundSelect(index)}
        />
      ))}
    </div>
  );
}
