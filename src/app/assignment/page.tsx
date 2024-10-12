import { redirect } from "next/navigation";

export default function DoesntExist() {
  redirect("/assignments");
}
