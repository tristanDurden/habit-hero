"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { List, ListItem } from "@/lib/types"
import { MoreHorizontalIcon } from "lucide-react"
import useListMutations from "@/app/hooks/lists/useListMutations"
import ListItemAddUpdateModal from "./ListItemAddUpdateModal"

type Props = {
  list: List
}

const priorityLabel: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const priorityColor: Record<string, string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
}

function formatDate(ts: number | null | undefined): string {
  if (!ts) return "—"
  // UI stores timestamps in milliseconds
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function ItemsTable({ list }: Props) {
  const { toggleListItem, deleteListItem } = useListMutations()

  const sorted = [...list.items].sort((a, b) => a.position - b.position)

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No items yet.</p>
  }

  if (list.type === "tasks") return <TasksTable items={sorted} onToggle={toggleListItem} onDelete={deleteListItem} />
  if (list.type === "shopping") return <ShoppingTable items={sorted} onToggle={toggleListItem} onDelete={deleteListItem} />
  return <NotesTable items={sorted} onDelete={deleteListItem} />
}

/* ─── Tasks ─────────────────────────────────────────────────────── */

function TasksTable({
  items,
  onToggle,
  onDelete,
}: {
  items: ListItem[]
  onToggle: (item: ListItem) => void
  onDelete: (listId: string, itemId: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Done</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right w-12">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className={item.completed ? "opacity-50" : ""}>
            <TableCell>
              <Checkbox checked={item.completed} onCheckedChange={() => onToggle(item)} />
            </TableCell>
            <TableCell className={`font-medium ${item.completed ? "line-through" : ""}`}>
              {item.name}
            </TableCell>
            <TableCell className="text-muted-foreground">{item.description || "—"}</TableCell>
            <TableCell>
              {item.priority ? (
                <span className={`text-xs font-semibold ${priorityColor[item.priority]}`}>
                  {priorityLabel[item.priority]}
                </span>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>{formatDate(item.dueDate)}</TableCell>
            <TableCell className="text-right">
              <ItemActions item={item} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/* ─── Shopping ──────────────────────────────────────────────────── */

function ShoppingTable({
  items,
  onToggle,
  onDelete,
}: {
  items: ListItem[]
  onToggle: (item: ListItem) => void
  onDelete: (listId: string, itemId: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Got</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right w-12">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className={item.completed ? "opacity-50" : ""}>
            <TableCell>
              <Checkbox checked={item.completed} onCheckedChange={() => onToggle(item)} />
            </TableCell>
            <TableCell className={`font-medium ${item.completed ? "line-through" : ""}`}>
              {item.name}
            </TableCell>
            <TableCell>
              {item.quantity != null ? (
                <span>
                  {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                </span>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{item.description || "—"}</TableCell>
            <TableCell className="text-right">
              <ItemActions item={item} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/* ─── Notes ─────────────────────────────────────────────────────── */

function NotesTable({
  items,
  onDelete,
}: {
  items: ListItem[]
  onDelete: (listId: string, itemId: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right w-12">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-muted-foreground">{item.description || "—"}</TableCell>
            <TableCell className="text-right">
              <ItemActions item={item} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/* ─── Shared row actions dropdown ───────────────────────────────── */

function ItemActions({
  item,
  onDelete,
}: {
  item: ListItem
  onDelete: (listId: string, itemId: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ListItemAddUpdateModal mode="edit" listId={item.listId} item={item} />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(item.listId, item.id)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
