"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";

export default function PosterImage({ id, thumbnail = false, fallback }: {
  id?: string; thumbnail?: boolean; fallback: ReactNode;
}) {
  const [failedId, setFailedId] = useState<string>();
  if (!id || id === failedId) return fallback;
  return <Image src={`https://images.metahub.space/poster/medium/${id}/img`} alt=""
    width={thumbnail ? 44 : 300} height={thumbnail ? 66 : 450}
    sizes={thumbnail ? "44px" : "200px"} onError={() => setFailedId(id)}
    style={{ objectFit: "cover", flexShrink: 0, borderRadius: 3 }}/>;
}
