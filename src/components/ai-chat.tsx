import * as React from "react";
import { HfInference } from "@huggingface/inference";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

const client = new HfInference(process.env.NEXT_PUBLIC_HF_API_KEY);

const sendMessage = async (message: string) => {
  const chatCompletion = await client.chatCompletion({
    model: "NousResearch/Hermes-3-Llama-3.1-8B",
    messages: [
      {
        role: "user",
        content: message
      }
    ],
    provider: "hf-inference",
    max_tokens: 500,
  });

  return chatCompletion.choices[0].message.content;
}

export default function AiChat({ currentlyOpenFile, taskDescription }: { currentlyOpenFile: string, taskDescription: string }) {
  const [messages, setMessages] = React.useState([
    {
      role: "agent",
      content: "Having problems with your code? Let me take a look...",
    },
  ]);
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inputLength === 0) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    const inputWithContext = `Current File: ${currentlyOpenFile}\n${input}`;
    const response = await sendMessage(inputWithContext);
    const agentMessage = { role: "agent", content: response || "Sorry, I couldn't process your request." };
    setMessages([...messages, userMessage, agentMessage]);
  };

  React.useEffect(() => {
    if (!currentlyOpenFile) return;

    const initialMessage = `Given the following task description and a student’s attempt at it, your task is to give feedback on the student’s solution. The feedback must not contain any code snippets and should be split into two sections: One for errors of any type (syntax, runtime, logical) and one for pointers on what the student should investigate to fix their problem. The errors section should simply state the problem and not offer any further insight. The pointers section should be concise (only one pointer per error found) and only tell the student where to look. If there are no errors in the code, simply output 'No problems found' and skip the pointers for fixing mistakes section. 
    
    For further context, if the student code contains a logic error on line 39 the response should look like: 
    
    Errors: 
      - [state the error] 
    Pointers: 
      - [explain the related logic that needs to be investigated] 
      
    Task description: ${taskDescription} 
    
    Student’s Code Attempt: ${currentlyOpenFile}`;

    const fetchData = async () => {
      const response = await sendMessage(initialMessage);
      const agentMessage = { role: "agent", content: response || "Sorry, I couldn't process your request." };
      setMessages([...messages, agentMessage]);
    };

    fetchData();
  }, [currentlyOpenFile]);

  return (
    <div className="relative">
      {!currentlyOpenFile && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Card className="p-4 opacity-100">
            <p className="text-sm font-medium text-white">Please select a file to debug first.</p>
          </Card>
        </div>
      )}
      <Card className={!currentlyOpenFile ? "opacity-30 pointer-events-none" : ""}>
        <CardHeader className="flex flex-row items-center">
          <div>
            <p className="text-sm font-medium leading-none">AI Chat</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={!currentlyOpenFile}
            />
            <Button type="submit" size="icon" disabled={inputLength === 0 || !currentlyOpenFile}>
              <Send />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
