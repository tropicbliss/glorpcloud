import { FolderArchive } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty"
import { Button } from "./ui/button"

export function EmptyEntry({ selectedDate, onClick, disabled }: { selectedDate: Date, onClick: () => void, disabled: boolean }) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FolderArchive />
                </EmptyMedia>
                <EmptyTitle>No Entry Yet</EmptyTitle>
                <EmptyDescription>
                    You haven&apos;t created an entry in {selectedDate.toLocaleDateString()}. Get started by creating
                    your first entry.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    <Button onClick={onClick} disabled={disabled}>Create Entry</Button>
                </div>
            </EmptyContent>
        </Empty>
    )
}