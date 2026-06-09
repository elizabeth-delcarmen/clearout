import { useCallback, useEffect, useRef } from "react";

type Props = {
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function AutoGrowTextarea({ className, placeholder, value, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      rows={1}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      style={{ resize: "none", overflow: "hidden" }}
    />
  );
}
