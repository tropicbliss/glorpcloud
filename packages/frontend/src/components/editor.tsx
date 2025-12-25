import { useState } from "react"
import { type SerializedEditorState } from "lexical"

import { Editor as InnerEditor } from "@/components/blocks/editor-00/editor"

export function Editor({ initialSerializedEditorState, readOnly, onDelete, onSave, disabled }: { initialSerializedEditorState: object, readOnly: boolean, onDelete: () => void, onSave: (content: object) => void, disabled: boolean }) {
    const [editorState, setEditorState] =
        useState<SerializedEditorState>(initialSerializedEditorState as unknown as SerializedEditorState)
    const [previousEditorState, setPreviousEditorState] = useState(JSON.stringify(initialSerializedEditorState))
    const editorStateHasChanged = JSON.stringify(editorState) !== previousEditorState

    return (
        <div>
            <InnerEditor
                editorSerializedState={editorState}
                onSerializedChange={(value) => setEditorState(value)}
                readOnly={readOnly}
                onDelete={onDelete}
                onSave={() => {
                    onSave(editorState)
                    setPreviousEditorState(JSON.stringify(editorState))
                }}
                disabled={disabled}
                editorStateHasChanged={editorStateHasChanged}
            />
        </div>
    )
}