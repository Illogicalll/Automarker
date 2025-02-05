import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Cross2Icon, CheckIcon, ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ViewSubmissionsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  params: { id: string };
  assignedTo: number | null;
}

interface Score {
  tests_failed: number;
  tests_passed: number;
  tests_run: number;
  user_id: string;
}

export default function ViewSubmissions({ isOpen, setIsOpen, params, assignedTo }: ViewSubmissionsProps) {
  const supabase = createClient();
  const [users, setUsers] = useState<{ id: string, name: string, submitted: boolean }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const listSubmissions = async () => {
    if (params) {
      const { data, error } = await supabase
        .storage
        .from("submissions")
        .list(params.id, {
          limit: 300,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (data) {
        const submissionUserIds = data.map(submission => submission.name);
        return submissionUserIds;
      }
    }
    return [];
  };

  const getAssignees = async () => {
    if (assignedTo) {
      const { data, error } = await supabase
        .from("groups")
        .select("users")
        .eq("id", assignedTo);

      if (data) {
        const { data: submissionsData, error } = await supabase
          .from("submissions")
          .select("user_id, tests_run, tests_passed, tests_failed") 
          .eq("assignment_id", params.id);
        if(submissionsData) {
          setScores(submissionsData);
        }
        return data[0].users;
      }
    }
    return [];
  };

  const fetchUsers = async () => {
    const submissionUserIds = await listSubmissions();
    const assigneeUserIds = await getAssignees();

    const allUserIds = Array.from(new Set([...submissionUserIds, ...assigneeUserIds]));

    const usersWithSubmissionStatus = await Promise.all(
      allUserIds.map(async (userId) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single();

        if (data) {
          return {
            id: userId,
            name: data.full_name,
            submitted: submissionUserIds.includes(userId),
          };
        }
        return null;
      })
    );

    setUsers(usersWithSubmissionStatus.filter(user => user !== null) as { id: string, name: string, submitted: boolean }[]);
  };

  useEffect(() => {
    fetchUsers();
  }, [params, assignedTo]);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(lowerCaseQuery)
      )
    );
  }, [searchQuery, users]);

  const columns: ColumnDef<{ id: string, name: string, submitted: boolean }>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            {
              column.getIsSorted() === "asc" ? (<ArrowUpIcon className="ml-2 h-4 w-4" />) :column.getIsSorted() === "desc" ? (<ArrowDownIcon className="ml-2 h-4 w-4" />) : null
            }
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-center">{row.getValue("name")}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "submitted",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Has Submitted
            {
              column.getIsSorted() === "asc" ? (<ArrowUpIcon className="ml-2 h-4 w-4" />) :column.getIsSorted() === "desc" ? (<ArrowDownIcon className="ml-2 h-4 w-4" />) : null
            }
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          {row.getValue("submitted") ? (
            <CheckIcon className="text-green-400 fill-current" />
          ) : (
            <Cross2Icon className="text-red-500 fill-current" />
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "view",
      header: () => <div className="text-center">View Code</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center" onClick={() => {window.location.pathname = "/submission/" + params.id + "/" + users.find(e => e.name === row.getValue("name"))?.id}}>
            <Button disabled={!row.getValue("submitted")}>
              <p>View</p>
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "tests",
      header: () => <div className="text-center">Testing Results</div>,
      cell: ({ row }) => {
        const score = scores.find(item => item.user_id === row.original.id);
        return (
          <div className="flex justify-center items-center">
              {score ? `${score.tests_passed}/${score.tests_run} Tests Passed` : "Tests not run yet"}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Dialog open={isOpen}>
      <DialogTrigger className="outline-none focus:outline-none hover:outline-none"></DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:w-[825px] flex flex-col">
        <DialogHeader>
          <DialogTitle>View Student Submissions</DialogTitle>
          <DialogDescription>
            See which students have submitted their solutions and run tests on
            their attempts.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="rounded-md border">
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

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>
            <p>Close</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}