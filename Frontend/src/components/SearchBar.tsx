import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="big-search">
      <Search size={21} />
      <input
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Try “charg” or “coffee”"
      />
      <kbd>⌘ K</kbd>
    </div>
  );
}
