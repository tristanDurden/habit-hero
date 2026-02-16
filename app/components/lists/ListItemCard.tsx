import useListMutations from "@/app/hooks/lists/useListMutations";
import { Checkbox } from "@/components/ui/checkbox";
import { ListItem as ListItemType } from "@/lib/types";
import DeleteConfirmationModal from "../misc/DeleteConfirmationModal";

type Props = {
    item: ListItemType;
}


export default function ListItem({ item }: Props) {
    const { toggleListItem } = useListMutations();
    const handleCheckboxChange = () => {
        toggleListItem(item);
    }
    return (
        <div className="flex flex-row gap-2 items-center">
            <Checkbox checked={item.completed} onCheckedChange={handleCheckboxChange} />
            <p>{item.name}</p>
            <p>{item.description}</p>
            <p>{item.completed ? "Completed" : "Not yet"}</p>
            <p>{item.dueDate?.toString() || ""}</p>
            <p>{item.quantity?.toString() || ""}</p>
            <p>{item.unit || ""}</p>
            <p>{item.priority || ""}</p>
            <DeleteConfirmationModal job={{ type: "listItem", listId: item.listId, id: item.id }} />
        </div>
    )
}