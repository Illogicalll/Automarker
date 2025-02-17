import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from "@tanstack/react-table";
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface LeaderboardProps {
  assignmentId: string;
  submissions: Submission[];
}

interface Submission {
  user_id: string;
  has_passed_tests: boolean;
  avg_execution_time: number;
  avg_memory_usage: number;
}

interface User {
  id: string;
  full_name: string;
}

export default function Leaderboard({ assignmentId, submissions }: LeaderboardProps) {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (data) {
        setUsers(data);
      }
    };

    fetchUsers();
  }, [assignmentId]);

  const getUserName = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.full_name : "Unknown User";
  };

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: "user_id",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <div className="text-center flex items-center justify-center">
            User Name
            {column.getIsSorted() === "asc" ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : column.getIsSorted() === "desc" ? <ArrowDownIcon className="ml-2 h-4 w-4" /> : null}
          </div>
        </button>
      ),
      cell: ({ row }) => <div className="text-center">{getUserName(row.getValue("user_id"))}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "has_passed_tests",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <div className="text-center flex items-center justify-center">
            Has Passed Tests
            {column.getIsSorted() === "asc" ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : column.getIsSorted() === "desc" ? <ArrowDownIcon className="ml-2 h-4 w-4" /> : null}
          </div>
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          {row.getValue("has_passed_tests") ? (
            <CheckIcon className="text-green-400 fill-current" />
          ) : (
            <Cross2Icon className="text-red-500 fill-current" />
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "avg_execution_time",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <div className="text-center flex items-center justify-center">
            Avg Execution Time
            {column.getIsSorted() === "asc" ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : column.getIsSorted() === "desc" ? <ArrowDownIcon className="ml-2 h-4 w-4" /> : null}
          </div>
        </button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue("avg_execution_time")} s</div>,
      enableSorting: true,
    },
    {
      accessorKey: "avg_memory_usage",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <div className="text-center flex items-center justify-center">
            Avg Max Memory Usage
            {column.getIsSorted() === "asc" ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : column.getIsSorted() === "desc" ? <ArrowDownIcon className="ml-2 h-4 w-4" /> : null}
          </div>
        </button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue("avg_memory_usage")} MB</div>,
      enableSorting: true,
    },
    {
      accessorKey: "view_submission",
      header: () => <div className="text-center">View Submission</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center" onClick={() => {window.location.pathname = "/submission/" + assignmentId + "/" + row.getValue("user_id")}}>
            <Button>
              <p>View</p>
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border mb-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
