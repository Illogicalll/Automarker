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
import { useState } from "react";
import { useUserContext } from "./context/user-context";
import { createClient } from "@/utils/supabase/client";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Python from "@/app/media/images/python.png";
import Java from "@/app/media/images/java.webp";
import CLang from "@/app/media/images/c.png";
import Cpp from "@/app/media/images/cpp.webp";
import Rust from "@/app/media/images/rust.png";
import Js from "@/app/media/images/js.webp";
import { LayersIcon } from "lucide-react";
import { DateTimePicker } from "./ui/date-time";

export default function CreateAssignment() {
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [language, setLanguage] = useState("all");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { user, name } = useUserContext();
  const supabase = createClient();

  const handleSubmit = async () => {
    if (user) {
      setLoading(true);

      const { data, error } = await supabase.from("assignments").insert([
        {
          title,
          description: problemDescription,
          language: language,
          due_date: dueDate,
        },
      ]);

      if (error) {
        console.error("Error inserting assignment:", error);
      }
    } else {
      console.log("User not authenticated");
    }
    setLoading(false);
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
            <DialogTitle>New Assignment</DialogTitle>
            <DialogDescription>Fill out the fields below </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label>Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Description</label>
              <Textarea
                value={problemDescription}
                rows={10}
                onChange={(e) => setProblemDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Language</label>
              <Select
                onValueChange={(value) => setLanguage(value)}
                defaultValue={"all"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <LayersIcon width={20} height={20} /> All Languages
                    </div>
                  </SelectItem>
                  <SelectItem value="java">
                    <div className="flex items-center gap-2">
                      <img className="w-[20px] h-[20px]" src={Java.src} />
                      Java
                    </div>
                  </SelectItem>
                  <SelectItem value="python">
                    <div className="flex items-center gap-2">
                      <img className="w-[20px] h-[20px]" src={Python.src} />
                      Python
                    </div>
                  </SelectItem>
                  <SelectItem value="c">
                    <div className="flex items-center gap-2">
                      <img className="w-[20px] h-[20px]" src={CLang.src} />C
                    </div>
                  </SelectItem>

                  <SelectItem value="cpp">
                    <div className="flex items-center gap-2">
                      <img className="w-[20px] h-[20px]" src={Cpp.src} />
                      C++
                    </div>
                  </SelectItem>
                  <SelectItem value="rust">
                    <div className="flex items-center gap-2">
                      <img
                        className="w-[20px] h-[20px]"
                        style={{
                          filter: theme === "dark" ? "invert(100%)" : "",
                        }}
                        src={Rust.src}
                      />
                      Rust
                    </div>
                  </SelectItem>
                  <SelectItem value="javascript">
                    <div className="flex items-center gap-2">
                      <img className="w-[20px] h-[20px]" src={Js.src} />
                      Javascript
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label>Due Date</label>
              <DateTimePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !(title && problemDescription && dueDate)}
            >
              {!(title && problemDescription && dueDate)
                ? "Complete to Continue"
                : loading
                  ? "Creating..."
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
