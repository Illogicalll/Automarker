import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from "@tanstack/react-table";
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

// Create a static cache to persist user data across component instances
const userCache = new Map<string, {
  full_name: string;
  is_anonymous: boolean;
  lastFetched: number;
}>();

interface LeaderboardProps {
  assignmentId: string;
  submissions: Submission[];
}

interface Submission {
  user_id: string;
  has_passed_tests: boolean;
  avg_execution_time: number;
  avg_memory_usage: number;
  profiles: {
    full_name: string;
    is_anonymous: boolean;
  };
}

interface User {
  id: string;
  full_name: string;
  is_anonymous: boolean;
}

export default function Leaderboard({ assignmentId, submissions }: LeaderboardProps) {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchTimestamp = useRef<number>(0);
  const assignmentIdRef = useRef<string>(assignmentId);

  useEffect(() => {
    // Check if assignment ID changed
    const isNewAssignment = assignmentIdRef.current !== assignmentId;
    if (isNewAssignment) {
      // Update the ref to the new assignment ID
      assignmentIdRef.current = assignmentId;
    }

    const fetchUsers = async () => {
      // Skip fetching if already loading
      if (isLoading) return;

      // Current time in milliseconds
      const currentTime = Date.now();
      // Cache expiry time (1 hour)
      const cacheExpiryTime = 60 * 60 * 1000;
      
      // Only fetch if cache is expired or we're looking at a new assignment
      if (isNewAssignment || currentTime - lastFetchTimestamp.current > cacheExpiryTime) {
        setIsLoading(true);
        
        // Get unique user IDs from submissions that aren't in cache or have expired cache
        const userIdsToFetch = submissions
          .map(sub => sub.user_id)
          .filter(userId => {
            const cachedUser = userCache.get(userId);
            return !cachedUser || (currentTime - cachedUser.lastFetched > cacheExpiryTime);
          });
        
        // Only fetch if there are users to fetch
        if (userIdsToFetch.length > 0) {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, is_anonymous")
            .in('id', userIdsToFetch);
          
          if (data && !error) {
            // Update the cache with new data
            data.forEach(user => {
              userCache.set(user.id, {
                full_name: user.full_name,
                is_anonymous: user.is_anonymous,
                lastFetched: currentTime
              });
            });
          }
        }
        
        // Convert cache to array of users
        const cachedUsers = Array.from(userCache.entries()).map(([id, data]) => ({
          id,
          full_name: data.full_name,
          is_anonymous: data.is_anonymous
        }));
        
        setUsers(cachedUsers);
        lastFetchTimestamp.current = currentTime;
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [assignmentId, submissions, supabase]);

  const getUserName = (userId: string) => {
    // First check the cache directly
    const cachedUser = userCache.get(userId);
    if (cachedUser) {
      return cachedUser.is_anonymous ? "Anonymous User" : cachedUser.full_name;
    }
    
    // Fall back to checking the users state
    const user = users.find((user) => user.id === userId);
    if (user) {
      return user.is_anonymous ? "Anonymous User" : user.full_name;
    }
    
    return "Loading...";
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
      cell: ({ row }) => <div className="text-center">{row.getValue("avg_execution_time") ? row.getValue("avg_execution_time") : "?"} s</div>,
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
      cell: ({ row }) => <div className="text-center">{row.getValue("avg_memory_usage") ? row.getValue("avg_memory_usage") : "?"} MB</div>,
      enableSorting: true,
    },
    {
      accessorKey: "view_submission",
      header: () => <div className="text-center">View Submission</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center">
            <Link href={`/submission/${assignmentId}/${row.getValue("user_id")}`}>
              <Button>
                <p>View</p>
              </Button>
            </Link>
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
