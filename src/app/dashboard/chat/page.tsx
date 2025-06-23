import Link from "next/link";

export default function ChatPage() {
  return (
    <div style={{ padding: 32 }}>
      <h2>Chat</h2>
      <p>This is the chat page. (Feature coming soon!)</p>
      <Link href="/dashboard/contractor/jobs">Go to Jobs (Home)</Link>
    </div>
  );
}
