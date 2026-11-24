"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";

export default function ImportedCover({ id, fallback, thumbnail = false }: { id: number; fallback: ReactNode; thumbnail?: boolean }) {
  const [failed, setFailed] = useState<number>();
  if (failed === id) return fallback;
  return <Image src={`https://covers.openlibrary.org/b/id/${id}-M.jpg?default=false`} alt="" width={thumbnail ? 44 : 480} height={thumbnail ? 66 : 720} sizes={thumbnail ? "44px" : "(max-width: 600px) 36vw, 190px"} style={{ objectFit: "cover", flexShrink: 0 }} onError={() => setFailed(id)}/>;
}
