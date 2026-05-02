import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <Input
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder || "Buscar edificio"}
      className="h-10 rounded-xl"
    />
  );
}
