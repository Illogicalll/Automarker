import { CirclePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { MagicCard } from "./ui/magic-card";
import { useState, ChangeEvent, FormEvent } from "react";
import { useUserContext } from "./context/user-context";
import { createClient } from "@/utils/supabase/client";
import { Input } from "./ui/input";

// Define types
interface User {
  id: string;
  email: string;
  full_name: string;
}

export default function CreateGroup() {
  const { theme } = useTheme();
  const [groupName, setGroupName] = useState<string>("");
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const { user, name } = useUserContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (user) {
      setLoading(true);

      const { data, error } = await supabase
        .from("groups")
        .insert([
          {
            name: groupName,
            users: userList.map((u) => u.id),
          },
        ])
        .select("id");

      if (error) {
        console.error("Error inserting group:", error);
      } else if (data && data.length > 0) {
        window.location.pathname = `/group/${data[0].id}`;
      }
      setLoading(false);
    } else {
      console.log("User not authenticated");
    }
  };

  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
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

  return (
    <Dialog>
      <DialogTrigger className="outline-none focus:outline-none hover:outline-none">
        <MagicCard
          className="min-w-[300px] max-w-[300px] max-h-full h-[200px] opacity-80 rounded-lg flex justify-center items-center border-dashed border-[3px] border-b-foreground/10 p-5 cursor-pointer"
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        >
          <div className="w-full flex justify-center pb-2">
            <CirclePlus />
          </div>
          <p>Create New</p>
        </MagicCard>
      </DialogTrigger>
      <form onSubmit={handleSubmit}>
        <DialogContent className="sm:max-w-[825px] flex flex-col">
          <DialogHeader>
            <DialogTitle>New Group</DialogTitle>
            <DialogDescription>Fill out the fields below</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label>Name</label>
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
              disabled={loading || !(groupName && userList.length > 0)}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
