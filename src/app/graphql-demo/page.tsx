"use client";

import { MessageBoard } from "~/components/message-board";
import Link from "next/link";

export default function GraphQLDemoPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">GraphQL Demo</h1>
      
      <MessageBoard />
    </div>
  );
}
