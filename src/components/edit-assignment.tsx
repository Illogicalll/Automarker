import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useEffect, useState } from "react";
import { useUserContext } from "./context/user-context";
import { createClient } from "@/utils/supabase/client";
import { DateTimePicker } from "./ui/date-time";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

interface EditAssignmentProps {
  params: { id: string };
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  groups: any;
  existingProblemStatement: any,
  setup: boolean;
  isEditing: boolean;
  existingDueDate?: Date;
}

export default function EditAssignment({ params, isOpen, setIsOpen, groups, existingProblemStatement, setup, isEditing, existingDueDate }: EditAssignmentProps) {
  const [assignees, setAssignees] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, name } = useUserContext();
  const supabase = createClient();
  const [problemStatement, setProblemStatement] = useState(existingProblemStatement);
  const [modelSolution, setModelSolution] = useState<any>(null);
  const [skeletonCode, setSkeletonCode] = useState<any>(null);
  const [isZip, setIsZip] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(existingDueDate);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState<boolean>(false);
  const [helpLanguage, setHelpLanguage] = useState<string>("python");

  useEffect(() => {
    if (existingProblemStatement !== null && existingProblemStatement !== undefined) {
      setProblemStatement(existingProblemStatement);
    }
    if (existingDueDate !== null && existingDueDate !== undefined) {
      setDueDate(new Date(existingDueDate));
    }
  }, [existingProblemStatement, existingDueDate]);
  
  const handleSubmit = async () => {
    if (assignees === null) {
      setPage(2);
    } else {
      if (user) {
        setLoading(true);

        const { data, error } = await supabase
          .from("assignments")
          .update([
            {
              assigned_to: assignees,
            },
          ])
          .eq("id", params.id);

        if (error) {
          console.error("Error updating assignment:", error);
        }
      } else {
        console.log("User not authenticated");
      }
      setLoading(false);
      setPage(2);
    }
  };

  const handleSubmit2 = async () => {
    if (user) {
      setLoading(true);
      
      const updateData: any = {
        setup: true
      };
      
      if (problemStatement) {
        updateData.problem = problemStatement;
      }
      
      if (dueDate) {
        updateData.due_date = dueDate.toISOString();
      }
      
      const { data, error } = await supabase
        .from("assignments")
        .update(updateData)
        .eq("id", params.id);

      if (modelSolution !== null) {
        const { data, error } = await supabase.storage
          .from("model_solutions")
          .upload(params.id, modelSolution, { upsert: true });
      }
      if (skeletonCode !== null) {
        const { data, error } = await supabase.storage
          .from("skeleton_codes")
          .upload(params.id, skeletonCode, { upsert: true });
      }
      if (error) {
        console.error("Error updating assignment:", error);
      }
    } else {
      console.log("User not authenticated");
    }
    setLoading(false);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <>
      <Dialog open={isOpen}>
        <DialogTrigger className="outline-none focus:outline-none hover:outline-none"></DialogTrigger>
        <form onSubmit={handleSubmit}>
          <DialogContent
            className="sm:max-w-[825px] flex flex-col"
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle>Set Up Your Assignment</DialogTitle>
              <DialogDescription>
                {isEditing ? (
                  <span>
                    Fill out the fields below. What you dont touch won't be
                    changed, even if it appears empty
                  </span>
                ) : (
                  <span>Fill out the fields below</span>
                )}
              </DialogDescription>
            </DialogHeader>
            {page === 1 ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Choose a group to set this assignment for:</Label>
                  <Select
                    onValueChange={(value) => setAssignees(value)}
                    defaultValue={"select a group"}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem disabled value="select a group">
                        <div className="flex items-center gap-2">
                          Select a Group
                        </div>
                      </SelectItem>
                      {groups
                        ? groups.map((group: any) => (
                            <SelectItem
                              key={group.id}
                              value={group.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                {group.name}
                              </div>
                            </SelectItem>
                          ))
                        : ""}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 cursor-pointer">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="model_solution"
                    className="cursor-pointer font-bold"
                  >
                    Unit Tests
                  </Label>
                  <div className="inline">
                    <p className="text-sm text-muted-foreground inline-block">
                      AutoAssign will use these tests to automatically grade student submissions. For a guide on what to upload,
                    </p>
                    &nbsp;
                    <p 
                      className="text-sm text-white underline inline-block z-50 cursor-pointer hover:text-gray-400"
                      onClick={() => setIsHelpDialogOpen(true)}
                    >
                      click here
                    </p>.
                  </div>
                  <Input
                    id="model_solution"
                    type="file"
                    accept=".py, .js, .c, .cpp, .rs, .java, .zip"
                    className="cursor-pointer"
                    onChange={(event) =>
                      setModelSolution(
                        event.target.files && event.target.files[0],
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="skeleton_code"
                    className="cursor-pointer font-bold"
                  >
                    Skeleton Code (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    This will be provided to assignees to use as a structure on
                    which they will build their solution
                  </p>
                  <Input
                    id="skeleton_code"
                    type="file"
                    accept=".py, .js, .c, .cpp, .rs, .java, .zip"
                    className="cursor-pointer"
                    onChange={(event) => {
                      const file = event.target.files && event.target.files[0];
                      if (file) {
                        setSkeletonCode(file);
                        setIsZip(
                          file.type === "application/zip" ||
                            file.name.endsWith(".zip"),
                        );
                      }
                    }}
                  />{" "}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="problem" className="cursor-pointer font-bold">
                    Problem Statement
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Describe the task
                  </p>
                  <Textarea
                    value={problemStatement ? problemStatement : ""}
                    rows={10}
                    onChange={(e) => setProblemStatement(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="due_date" className="cursor-pointer font-bold">
                    Due Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When the assignment is due
                  </p>
                  <DateTimePicker value={dueDate} onChange={setDueDate} />
                </div>
              </div>
            )}
            <DialogFooter>
              {page === 1 ? (
                <Button type="submit" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? "Updating..."
                    : assignees === null && page === 1
                      ? "Skip for Now"
                      : page === 1
                        ? "Add Assignees"
                        : setup === false
                          ? "Complete to Continue"
                          : "Finish"}
                </Button>
              ) : isEditing ? (
                <Button
                  type="submit"
                  onClick={handleSubmit2}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Finish"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit2}
                  disabled={
                    loading ||
                    (setup === false && modelSolution === null ) ||
                    problemStatement === null ||
                    problemStatement === ""
                  }
                >
                  {loading
                    ? "Updating..."
                    : (setup === false && modelSolution === null ) ||
                        problemStatement === null ||
                        problemStatement === ""
                      ? "Complete to Continue"
                      : "Finish"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Test File Requirements</DialogTitle>
            <DialogDescription>
              Learn what to upload for different programming languages
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Tabs defaultValue="python" value={helpLanguage} onValueChange={setHelpLanguage} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="python" 
                  className={`relative pb-2 ${helpLanguage === "python" ? "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary" : ""}`}
                >
                  Python
                </TabsTrigger>
                <TabsTrigger 
                  value="java" 
                  className={`relative pb-2 ${helpLanguage === "java" ? "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary" : ""}`}
                >
                  Java
                </TabsTrigger>
                <TabsTrigger 
                  value="c" 
                  className={`relative pb-2 ${helpLanguage === "c" ? "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary" : ""}`}
                >
                  C
                </TabsTrigger>
              </TabsList>

              <TabsContent value="python" className="mt-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Python Test Requirements</h3>
                  <p>Tests for Python assignments should be of the following format using the <code>unittest</code> library</p>
                  <div className="bg-slate-800 p-4 rounded-md">
                    <pre className="text-sm text-white overflow-auto">
                      {`import unittest
from solution import my_function

class TestSolution(unittest.TestCase):
    def test_basic_case(self):
        self.assertEqual(my_function(5), 25)
        
    def test_edge_case(self):
        self.assertEqual(my_function(0), 0)
        
if __name__ == '__main__':
    unittest.main()`}
                    </pre>
                  </div>
                  <p>Make sure they are contained within a <code>/tests</code> folder placed in the root directory of your project</p>
                  <p>When uploading, simply zip your root/src directory of the project and upload it</p>
                </div>
              </TabsContent>

              <TabsContent value="java" className="mt-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Java Test Requirements</h3>
                  <div className="mt-8 bg-amber-100 dark:bg-amber-950 pt-[9px] pb-1 rounded-md text-center">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Only Maven projects are currently supported</h4>
                  </div>
                  <p>Tests should be written with the <code>junit</code> library</p>
                  <div className="bg-slate-800 p-4 rounded-md">
                    <pre className="text-sm text-white overflow-auto">
                      {`import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTest {
    @Test
    public void testBasicCase() {
        assertEquals(25, Solution.myFunction(5));
    }
    
    @Test
    public void testEdgeCase() {
        assertEquals(0, Solution.myFunction(0));
    }
}`}
                    </pre>
                  </div>
                  <p>Test files for Java assignments should be in a <code>/test/java</code> folder in the root directory of your project</p>
                  <p>When submitting, zip just the <code>test</code> folder and upload it</p>
                </div>
              </TabsContent>

              <TabsContent value="c" className="mt-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">C Test Requirements</h3>
                  <p>Tests for C assignments should be written with the <code>CUnit</code> library</p>
                  <div className="bg-slate-800 p-4 rounded-md">
                    <pre className="text-sm text-white overflow-auto">
                      {`#include <CUnit/CUnit.h>
#include <CUnit/Basic.h>
// other imports

char* capture_output(void (*func)()) {
    // capture stdout
}

void test_print_hello_world() {
    char* output = capture_output(print_hello_world);
    CU_ASSERT_STRING_EQUAL(output, "Hello, World!");
    free(output);
}

int main() {
    if (CU_initialize_registry() != CUE_SUCCESS) {
        return CU_get_error();
    }
    CU_pSuite suite = CU_add_suite("HelloWorldSuite", NULL, NULL);
    if (suite == NULL) {
        CU_cleanup_registry();
        return CU_get_error();
    }
    if (CU_add_test(suite, "test_print_hello_world",
    test_print_hello_world) == NULL) {
        CU_cleanup_registry();
        return CU_get_error();
    }
    CU_basic_set_mode(CU_BRM_VERBOSE);
    CU_basic_run_tests();
    CU_cleanup_registry();
    return CU_get_error();
}
`}
                    </pre>
                  </div>
                  <p>Test files should be placed in a <code>/tests</code> folder in the root directory of the project</p>
                  <p>When uploading the files, zip your entire project directory</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsHelpDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}