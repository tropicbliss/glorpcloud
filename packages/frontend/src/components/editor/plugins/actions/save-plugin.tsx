import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

export function SavePlugin({ onSave }: { onSave: () => void }) {
    return (
        <Button
            variant={"outline"}
            onClick={onSave}
            size="icon"
            className="size-8!"
            aria-label="Save journal"
        >
            <SaveIcon />
        </Button>
    )
}