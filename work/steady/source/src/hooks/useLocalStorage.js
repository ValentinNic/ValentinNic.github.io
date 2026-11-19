import { useCallback, useEffect, useRef, useState } from "react";
import { KEY, seed, valid } from "../lib/finance";

function read() {
  const raw = window.localStorage.getItem(KEY);
  if (raw === null) return null;
  const parsed = JSON.parse(raw);
  if (!valid(parsed)) throw Error("Invalid saved data");
  return parsed;
}
export default function useLocalStorage() {
  const [initial] = useState(() => {
    try {
      return { data: read() || seed(), warning: "" };
    } catch {
      return {
        data: seed(),
        warning:
          "Saved data could not be read. Changes are available for this session.",
      };
    }
  });
  const [data, setData] = useState(initial.data);
  const [warning, setWarning] = useState(initial.warning);
  const current = useRef(data);
  const volatile = useRef(Boolean(initial.warning));
  const apply = useCallback((next) => {
    current.current = next;
    setData(next);
  }, []);
  useEffect(() => {
    try {
      if (!volatile.current && !read())
        localStorage.setItem(KEY, JSON.stringify(current.current));
    } catch {
      volatile.current = true;
      setWarning(
        "Browser storage is unavailable. Changes last for this session.",
      );
    }
    function sync(event) {
      if (event.key !== KEY && event.key !== null) return;
      try {
        const next = read();
        apply(next || seed());
        volatile.current = false;
        setWarning("");
      } catch {
        volatile.current = true;
        setWarning(
          "Saved data could not be read. Changes last for this session.",
        );
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [apply]);
  const update = useCallback(
    (transform, reset = false) => {
      let base = current.current;
      if (!volatile.current) {
        try {
          base = read() || base;
        } catch {
          volatile.current = true;
        }
      }
      const next = transform(base);
      if (reset) volatile.current = false;
      try {
        if (volatile.current) throw Error();
        localStorage.setItem(KEY, JSON.stringify(next));
        setWarning("");
      } catch {
        volatile.current = true;
        setWarning(
          "Changes last for this session. Use Settings to reset browser storage.",
        );
      }
      apply(next);
    },
    [apply],
  );
  return { data, update, warning };
}
