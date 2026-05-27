"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import { priorityLabels, statusLabels } from "@/lib/constants";
import type { LeadPriorityValue, LeadStatusValue } from "@/types/lead";

export type LeadRow = {
  id: string;
  businessName: string;
  niche?: string | null;
  city?: string | null;
  state?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  status: LeadStatusValue;
  priority: LeadPriorityValue;
  score: number;
  source?: string | null;
  createdAt: string | Date;
};

export function LeadTable({ leads }: { leads: LeadRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);
  const table = useReactTable({
    data: leads,
    columns: [
      {
        accessorKey: "businessName",
        header: "Nome",
        cell: ({ row }) => (
          <Link className="font-semibold text-brand hover:underline" href={`/leads/${row.original.id}`}>
            {row.original.businessName}
          </Link>
        )
      },
      { accessorKey: "niche", header: "Nicho" },
      {
        id: "cityState",
        header: "Cidade/UF",
        accessorFn: (row) => [row.city, row.state].filter(Boolean).join("/")
      },
      { accessorKey: "whatsapp", header: "WhatsApp" },
      {
        accessorKey: "website",
        header: "Site",
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return value ? (
            <a className="text-brand hover:underline" href={value} target="_blank" rel="noreferrer">
              abrir
            </a>
          ) : (
            "-"
          );
        }
      },
      {
        accessorKey: "instagram",
        header: "Instagram",
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return value ? (
            <a className="text-brand hover:underline" href={value} target="_blank" rel="noreferrer">
              abrir
            </a>
          ) : (
            "-"
          );
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => statusLabels[getValue<LeadStatusValue>()]
      },
      {
        accessorKey: "priority",
        header: "Prioridade",
        cell: ({ getValue }) => priorityLabels[getValue<LeadPriorityValue>()]
      },
      { accessorKey: "score", header: "Score" },
      { accessorKey: "source", header: "Fonte" },
      {
        accessorKey: "createdAt",
        header: "Criado em",
        cell: ({ getValue }) => formatDate(getValue<string>())
      }
    ],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (!leads.length) {
    return <div className="card p-8 text-center text-sm text-muted">Nenhum lead encontrado.</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-3">
                    <button
                      className="font-semibold"
                      onClick={header.column.getToggleSortingHandler()}
                      type="button"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" ? " ↑" : ""}
                      {header.column.getIsSorted() === "desc" ? " ↓" : ""}
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-panel/70">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="max-w-64 whitespace-nowrap px-4 py-3">
                    <span className="block truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
