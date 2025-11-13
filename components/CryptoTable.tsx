"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { RoboticsTokenSnapshotType } from "@/lib/types";

export type RoboticsTokenSnapshotUI = Omit<RoboticsTokenSnapshotType, "takenAt"> & {
  takenAt: string | Date;
};

type SortKey = "rank" | "priceUsd" | "marketCapUsd" | "volume24hUsd" | "change24hPct";

type SortDirection = "asc" | "desc";

const sortableHeaders: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "rank", label: "Rank" },
  { key: "priceUsd", label: "Price", align: "right" },
  { key: "change24hPct", label: "24h", align: "right" },
  { key: "marketCapUsd", label: "Market Cap", align: "right" },
  { key: "volume24hUsd", label: "Volume 24h", align: "right" },
];

interface CryptoTableProps {
  tokens: RoboticsTokenSnapshotUI[];
}

export function CryptoTable({ tokens }: CryptoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [direction, setDirection] = useState<SortDirection>("asc");

  const sortedTokens = useMemo(() => {
    const list = [...tokens];
    return list.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (valueA === valueB) return 0;
      if (direction === "asc") {
        return valueA > valueB ? 1 : -1;
      }
      return valueA < valueB ? 1 : -1;
    });
  }, [tokens, sortKey, direction]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "rank" ? "asc" : "desc");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <p>Robotics token market snapshot</p>
        <p>{tokens.length} assets</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3 text-slate-300">Asset</TableHead>
            {sortableHeaders.map((header) => (
              <TableHead
                key={header.key}
                className={cn(
                  "cursor-pointer select-none px-4 py-3 text-slate-300",
                  header.align === "right" && "text-right",
                )}
                onClick={() => handleSort(header.key)}
              >
                <div className="flex items-center justify-end gap-1">
                  <span className={cn(header.align !== "right" && "mr-auto")}>{header.label}</span>
                  {sortKey === header.key && (
                    <span className="text-xs text-brand-300">{direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {token.image && (
                    <Image
                      src={token.image}
                      alt={token.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full bg-white/5 object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{token.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{token.symbol}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-4 text-right font-semibold text-white">
                {formatCurrency(token.priceUsd)}
              </TableCell>
              <TableCell
                className={cn(
                  "px-4 py-4 text-right font-semibold",
                  token.change24hPct >= 0 ? "text-emerald-300" : "text-rose-300",
                )}
              >
                {token.change24hPct >= 0 ? "+" : ""}
                {token.change24hPct.toFixed(2)}%
              </TableCell>
              <TableCell className="px-4 py-4 text-right text-slate-200">
                {formatCurrency(token.marketCapUsd, { notation: "compact", maximumFractionDigits: 1 })}
              </TableCell>
              <TableCell className="px-4 py-4 text-right text-slate-200">
                {formatCurrency(token.volume24hUsd, { notation: "compact", maximumFractionDigits: 1 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
