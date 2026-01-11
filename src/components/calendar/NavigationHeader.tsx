interface NavigationHeaderProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
}

type ReadonlyNavigationHeaderProps = Readonly<NavigationHeaderProps>;

export default function NavigationHeader({
  title,
  onPrevious,
  onNext,
}: ReadonlyNavigationHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrevious}
        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
      >
        ←
      </button>
      <h2 className="text-lg font-semibold capitalize">{title}</h2>
      <button
        onClick={onNext}
        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
      >
        →
      </button>
    </div>
  );
}
