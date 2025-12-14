import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

export function SavePlugin({ onSave, disabled }: { onSave: () => void, disabled: boolean }) {
    return (
        <Button
            variant={"outline"}
            onClick={onSave}
            size="icon"
            className="size-8!"
            aria-label="Save journal"
            disabled={disabled}
        >
            <SaveIcon />
        </Button>
    )
}