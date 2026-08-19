import { KeyboardEvent, MouseEvent, PointerEvent, useEffect, useId, useRef, useState } from "react";

type Option = { value: string; label: string };

type Props = {
  id: string;
  name: string;
  value: string;
  required?: boolean;
  placeholder: string;
  options: readonly Option[];
  listLabel?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
};

export default function SelectField({
  id,
  name,
  value,
  required,
  placeholder,
  options,
  listLabel,
  invalid,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const root = useRef<HTMLDivElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const label = selected?.label || placeholder;

  useEffect(() => {
    if (hidden.current && hidden.current.value !== value) hidden.current.value = value;
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: Event) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  function choose(next: string) {
    if (!next) return;
    if (hidden.current) hidden.current.value = next;
    onChange(next);
    setOpen(false);
  }

  function onOptionPointer(e: PointerEvent<HTMLLIElement>, next: string) {
    e.preventDefault();
    e.stopPropagation();
    choose(next);
  }

  function onOptionMouseDown(e: MouseEvent<HTMLLIElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onOptionClick(e: MouseEvent<HTMLLIElement>, next: string) {
    e.preventDefault();
    e.stopPropagation();
    choose(next);
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + delta + options.length) % options.length);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setOpen(true);
      setActive(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setOpen(true);
      setActive(options.length - 1);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      choose(options[active]?.value ?? "");
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className={`select-field${open ? " is-open" : ""}`} ref={root}>
      <input ref={hidden} type="hidden" name={name} value={value} readOnly />
      <button
        type="button"
        id={id}
        className={`select-trigger${value ? "" : " is-placeholder"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-required={required}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKey}
      >
        <span>{label}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true" className="select-chevron">
          <path
            fill="currentColor"
            d="M3.2 5.6 8 10.4l4.8-4.8 1.2 1.2L8 12.8 2 6.8z"
          />
        </svg>
      </button>
      {open ? (
        <ul
          id={listId}
          className="select-list"
          role="listbox"
          aria-label={listLabel}
          aria-activedescendant={`${listId}-${active}`}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                className={`select-option${isSelected ? " is-selected" : ""}${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onPointerDown={(e) => onOptionPointer(e, opt.value)}
                onMouseDown={onOptionMouseDown}
                onClick={(e) => onOptionClick(e, opt.value)}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
