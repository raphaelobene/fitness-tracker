"use client";

import { useClickAway, useDebounce } from "@/hooks/usehooks";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";

type AutocompleteProps<T> = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  fetchItems: (query: string) => Promise<T[]> | T[];
  renderItem: (item: T, isActive: boolean) => React.ReactNode;
  getItemValue: (item: T) => string;
  placeholder?: string;
};

export function Autocomplete<T>({
  name,
  value,
  onChange,
  onSelect,
  fetchItems,
  renderItem,
  getItemValue,
  placeholder,
}: AutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const listRef = useClickAway<HTMLUListElement>(() => setOpen(false));

  const debouncedQuery = useDebounce(value, 400);

  // Fetch suggestions ONLY
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchResults = async () => {
      if (!debouncedQuery) {
        setItems([]);
        return;
      }

      try {
        const response = await fetchItems(debouncedQuery);

        if (!response) return;

        if (!controller.signal.aborted) {
          setItems(response);
        }
      } catch (error) {
        if (error === "AbortError") return;
        console.error("Autocomplete fetch error:", error);
        setError("Failed to fetch results");
        setItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    fetchResults();

    return () => controller.abort();
  }, [debouncedQuery, fetchItems]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      onChange(nextValue);
      setActiveIndex(-1);
      setError(null);
      setOpen(nextValue.length > 0);
    },
    [onChange]
  );

  const handleSelectItem = useCallback(
    (item: T) => {
      onSelect(item);
      onChange(getItemValue(item));
      setOpen(false);
      inputRef.current?.focus();
    },
    [onSelect, onChange, getItemValue]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open || items.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, items.length - 1));
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;

        case "Enter":
          if (activeIndex >= 0) {
            e.preventDefault();
            handleSelectItem(items[activeIndex]);
          }
          break;

        case "Escape":
          setOpen(false);
          break;
      }
    },
    [open, items, activeIndex, handleSelectItem]
  );

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={`${name}-input`}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => items.length > 0 && setOpen(true)}
        autoComplete="off"
        spellCheck="false"
        role="combobox"
        aria-controls=""
        aria-expanded={open}
        aria-busy={isLoading}
        className="relative z-2"
      />
      <ul
        ref={listRef}
        role="listbox"
        aria-labelledby={`${name}-label`}
        aria-label="suggestion"
        className={cn(
          "absolute z-1 max-h-96 top-4.5 w-full overflow-y-auto bg-background rounded-b-2xl px-3 shadow",
          {
            "pt-8 pb-3": open,
          }
        )}
      >
        {open && (
          <>
            {items.length > 0 ? (
              items.map((item, index) => (
                <li
                  key={index}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={() => handleSelectItem(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "cursor-pointer px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    {
                      "bg-accent text-accent-foreground": index === activeIndex,
                    }
                  )}
                >
                  {renderItem(item, index === activeIndex)}
                </li>
              ))
            ) : isLoading ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </li>
            ) : error ? (
              <li className="px-3 py-2 text-sm text-destructive">{error}</li>
            ) : null}
          </>
        )}
      </ul>
    </div>
  );
}
