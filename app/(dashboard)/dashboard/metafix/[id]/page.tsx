import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import MetafixChatClient from "@/components/metafix/MetafixChatClient";
import CaseStatusBadge from "@/components/metafix/CaseStatusBadge";
import AreaBadge from "@/components/metafix/AreaBadge";
import type { MetafixCase, MetafixMessage } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CasePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [caseRes, messagesRes] = await Promise.all([
    supabase.from("cases").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("messages").select("*").eq("case_id", id).order("created_at", { ascending: true }),
  ]);

  if (caseRes.error || !caseRes.data) notFound();

  const metafixCase = caseRes.data as MetafixCase;
  const messages    = (messagesRes.data ?? []) as MetafixMessage[];

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 flex-shrink-0">
        <Link href="/dashboard/metafix" className="text-gray-500 hover:text-gray-300 transition">
          <ArrowLeft size={16} />
        </Link>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
          <Wrench size={14} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{metafixCase.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <CaseStatusBadge status={metafixCase.status} />
            <AreaBadge area={metafixCase.area} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MetafixChatClient
          caseId={metafixCase.id}
          initialMessages={messages}
          currentStatus={metafixCase.status}
        />
      </div>
    </div>
  );
}
