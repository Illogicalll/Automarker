"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/components/context/user-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/spinner";

interface User {
  id: string;
  email: string;
  full_name: string;
}

export default function GroupPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { user, name } = useUserContext();
  const [group, setGroup] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [confirmGroupName, setConfirmGroupName] = useState<string>("");

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("groups")
        .select()
        .eq("id", params.id);
      if (error) {
        console.error("Error fetching group:", error);
      } else {
        setGroup(data[0]);
        setGroupName(data[0].name);
        const userIds = data[0].users;
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);
        if (usersError) {
          console.error("Error fetching users:", usersError);
        } else {
          setUsers(usersData);
          setUserList(usersData); // Initialize userList with fetched users
        }
      }
      setLoading(false);
    };

    fetchGroup();
  }, [params.id]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearching(true);
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .or(`email.ilike.%${value}%, full_name.ilike.%${value}%`)
          .neq("id", user?.id)
          .limit(5);

        if (error) {
          console.error("Error fetching users:", error);
          setSearchResults([]);
        } else {
          const filteredResults = (data as User[]).filter(
            (searchResult) => !userList.some((u) => u.id === searchResult.id),
          );
          setSearchResults(filteredResults);
        }
      } catch (err) {
        console.error("Unexpected error in search:", err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleUserClick = (selectedUser: User) => {
    setUserList([...userList, selectedUser]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeUser = (userId: string) => {
    setUserList(userList.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setLoading(true);

      const { data, error } = await supabase
        .from("groups")
        .update({ name: groupName, users: userList.map((u) => u.id) })
        .eq("id", params.id);

      if (error) {
        console.error("Error updating group:", error);
      } else {
        setUsers(userList);
        setGroup((prevGroup: any) => ({ ...prevGroup, name: groupName, users: userList.map((u) => u.id) }));
        setIsOpen(false);
      }
      setLoading(false);
    } else {
      console.log("User not authenticated");
    }
  };

  const handleDelete = async () => {
    if (confirmGroupName === groupName) {
      setLoading(true);
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", params.id);

      if (error) {
        console.error("Error deleting group:", error);
      } else {
        window.location.href = "/groups";
      }
      setLoading(false);
    } else {
      alert("Group name does not match. Please type the correct group name to confirm.");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => <div className="text-center">{row.getValue("full_name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-center">{row.getValue("email")}</div>,
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full h-[95vh] flex flex-col p-6 gap-5">
      {loading ? (
        <div className="flex h-full justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold">{group?.name}</h1>
          <div className="flex gap-4">
            <Button onClick={() => setIsOpen(true)}>Edit Group</Button>
            <Button className="bg-red-600 text-white hover:bg-red-900" onClick={() => setIsDeleteOpen(true)}>Delete Group</Button>
          </div>
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

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="outline-none focus:outline-none hover:outline-none"></DialogTrigger>
            <DialogContent className="sm:max-w-[825px] flex flex-col">
              <DialogHeader>
                <DialogTitle>Edit Group</DialogTitle>
                <DialogDescription>Update the group name and members</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label>Group Name</label>
                    <Input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Add Users</label>
                    <Input
                      type="text"
                      placeholder="type name or email"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchResults.length > 0 && (
                      <ul className="bg-white dark:bg-gray-800 border rounded-md max-h-40 overflow-y-auto">
                        {searchResults.map((result) => (
                          <li
                            key={result.id}
                            onClick={() => handleUserClick(result)}
                            className="cursor-pointer p-2 bg-black hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {result.full_name}
                            &nbsp; ({result.email})
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4">
                      <h4 className="font-semibold">Selected Users:</h4>
                      <ul className="flex flex-wrap gap-2">
                        {userList.map((user) => (
                          <li
                            key={user.id}
                            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md flex items-center gap-2"
                          >
                            {user.full_name}
                            <button
                              type="button"
                              onClick={() => removeUser(user.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || userList.length === 0}
                  >
                    {loading ? "Updating..." : "Update"}
                  </Button>
                  <Button onClick={() => setIsOpen(false)}>
                    <p>Cancel</p>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger className="outline-none focus:outline-none hover:outline-none"></DialogTrigger>
            <DialogContent className="sm:max-w-[425px] flex flex-col">
              <DialogHeader>
                <DialogTitle>Delete Group</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this group? This action cannot be undone.
                  Please type the group name to confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-6">
                <Input
                  type="text"
                  placeholder="Type group name to confirm"
                  value={confirmGroupName}
                  onChange={(e) => setConfirmGroupName(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  className="bg-red-600 text-white hover:bg-red-900"
                  onClick={handleDelete}
                  disabled={loading || confirmGroupName !== groupName}
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
                <Button onClick={() => setIsDeleteOpen(false)}>
                  <p>Cancel</p>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
