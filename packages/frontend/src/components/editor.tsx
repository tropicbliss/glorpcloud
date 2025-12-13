import { useState } from "react"
import { type SerializedEditorState } from "lexical"

import { Editor as InnerEditor } from "@/components/blocks/editor-00/editor"

export function Editor({ initialSerializedEditorState, readOnly, onDelete, onSave }: { initialSerializedEditorState: string, readOnly: boolean, onDelete: () => void, onSave: (content: string) => void }) {
    const [editorState, setEditorState] =
        useState<SerializedEditorState>(JSON.parse(initialSerializedEditorState) as unknown as SerializedEditorState)

    return (
        <div>
            <InnerEditor
                editorSerializedState={editorState}
                onSerializedChange={(value) => setEditorState(value)}
                readOnly={readOnly}
                onDelete={onDelete}
                onSave={() => {
                    onSave(JSON.stringify(editorState))
                }}
            />
        </div>
    )
}