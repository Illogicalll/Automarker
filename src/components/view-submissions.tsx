import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Cross2Icon, CheckIcon } from "@radix-ui/react-icons";

interface ViewSubmissionsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  params: { id: string };
  assignedTo: number | null;
}

export default function ViewSubmissions({ isOpen, setIsOpen, params, assignedTo }: ViewSubmissionsProps) {
  const supabase = createClient();
  const [users, setUsers] = useState<{ name: string, submitted: boolean }[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredUsers, setFilteredUsers] = useState(users); // State for filtered users

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
      data?.map((submission) => submission.name).forEach(async (user) => {
        const { data, error } = await supabase
          .from("profiles")
          .select()
          .eq("id", user);
        if (data) {
          setUsers((users) => {
            const existingUser = users.find((u) => u.name === data[0].full_name);
            if (existingUser) {
              return users;
            }
            return [...users, { name: data[0].full_name, submitted: true }];
          });
        }
      });
    }
  };

  const getAssignees = async () => {
    if (assignedTo) {
      const { data, error } = await supabase
        .from("groups")
        .select("users")
        .eq("id", assignedTo);
      if (data) {
        data[0].users.forEach(async (user: string) => {
          const { data, error } = await supabase
            .from("profiles")
            .select()
            .eq("id", user);
          if (data) {
            setUsers((users) => {
              const existingUser = users.find((u) => u.name === data[0].full_name);
              if (existingUser) {
                return users;
              }
              return [...users, { name: data[0].full_name, submitted: false }];
            });
          }
        });
      }
    }
  };

  useEffect(() => {
    listSubmissions();
  }, [params]);

  useEffect(() => {
    getAssignees();
  }, [assignedTo]);

  useEffect(() => {
    const lenBefore = users.length;
    const uniqueUsers = users.filter(
      (user, index, self) => index === self.findIndex((t) => t.name === user.name)
    );
    if (lenBefore !== uniqueUsers.length) {
      setUsers(uniqueUsers);
    }
  }, [users]);

  useEffect(() => {
    // Filter users based on the search query
    const lowerCaseQuery = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(lowerCaseQuery)
      )
    );
  }, [searchQuery, users]);

  type Submissions = {
    name: string;
    submitted: boolean;
  };

  const columns: ColumnDef<Submissions>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("name")}</div>;
      },
    },
    {
      accessorKey: "submitted",
      header: () => <div className="text-center">Has Submitted</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center">
            {row.getValue("submitted") ? (
              <CheckIcon className="text-green-400 fill-current" />
            ) : (
              <Cross2Icon className="text-red-500 fill-current" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "view",
      header: () => <div className="text-center">View Code</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center">
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
        return (
          <div className="flex justify-center items-center">
              Tests not run yet
          </div>
        );
      },
    },
  ];

  return (
    <Dialog open={isOpen}>
      <DialogTrigger className="outline-none focus:outline-none hover:outline-none"></DialogTrigger>
      <DialogContent className="sm:max-w-[825px] flex flex-col">
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
            className="w-full p-2 border  rounded-md focus:outline-none focus:ring"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DataTable columns={columns} data={filteredUsers} />

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>
            <p>Close</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
