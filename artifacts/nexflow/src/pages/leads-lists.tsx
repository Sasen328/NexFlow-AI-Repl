import { useState } from "react";
import { Users, ListIcon, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ContactsPage from "@/pages/contacts";
import ListsPage from "@/pages/lists";
import CompaniesPage from "@/pages/companies";

/**
 * Leads → Lists — merged view of People (Contacts), Companies, and the
 * Lists/Segments manager. Internal segmented control flips between the
 * three sub-views, so the user no longer hops between three top-level
 * pages.
 */
type Tab = "people" | "companies" | "lists";

export default function LeadsListsPage() {
  const [tab, setTab] = useState<Tab>("people");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lists</h1>
          <p className="text-muted-foreground text-sm mt-0.5">People, companies, and saved lists in one place.</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/40">
          <Btn label="People"     icon={Users}     active={tab === "people"}     onClick={() => setTab("people")} />
          <Btn label="Companies"  icon={Building2} active={tab === "companies"}  onClick={() => setTab("companies")} />
          <Btn label="Saved Lists" icon={ListIcon} active={tab === "lists"}      onClick={() => setTab("lists")} />
        </div>
      </div>
      {tab === "people" && <ContactsPage />}
      {tab === "companies" && <CompaniesPage />}
      {tab === "lists" && <ListsPage />}
    </div>
  );
}

function Btn({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
        active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
