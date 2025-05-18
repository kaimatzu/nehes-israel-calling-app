import { redirect } from "next/navigation"

export default function CallHistoryPage() {
  // Redirect to the main page since call history is now integrated there
  redirect("/")
}
