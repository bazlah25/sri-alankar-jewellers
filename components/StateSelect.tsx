"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function StateSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  const select = (state: string) => {
    onChange(state);
    setOpen(false);
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return <details className="sa-state-picker" ref={detailsRef} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary aria-haspopup="listbox" aria-expanded={open}>
      <span className={value ? "selected" : "placeholder"}>{value || "Select your state"}</span>
      <ChevronDown size={15} aria-hidden="true"/>
    </summary>
    <div className="sa-state-picker-menu" role="listbox" aria-label="States">
      {options.map(state => <button type="button" role="option" aria-selected={value === state} key={state} onClick={() => select(state)}>{state}</button>)}
    </div>
  </details>;
}
