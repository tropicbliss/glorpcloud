import { useState } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin"
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin"
import { LinkPlugin } from "@/components/editor/plugins/link-plugin"
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin"
import { ActionsPlugin } from "@/components/editor/plugins/actions/actions-plugin"
import { CounterCharacterPlugin } from "@/components/editor/plugins/actions/counter-character-plugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"
import { ImagesPlugin } from "@/components/editor/plugins/images-plugin"
import { EmojisPlugin } from "@/components/editor/plugins/emojis-plugin"
import { TwitterPlugin } from "@/components/editor/plugins/embeds/twitter-plugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { TWEET } from "@/components/editor/transformers/markdown-tweet-transformer"
import { EMOJI } from "@/components/editor/transformers/markdown-emoji-transformer"
import { IMAGE } from "@/components/editor/transformers/markdown-image-transformer"
import { HR } from "@/components/editor/transformers/markdown-hr-transformer"
import { TABLE } from "@/components/editor/transformers/markdown-table-transformer"
import { EditModeTogglePlugin } from "@/components/editor/plugins/actions/edit-mode-toggle-plugin"
import { SavePlugin } from "@/components/editor/plugins/actions/save-plugin"
import { DeletePlugin } from "@/components/editor/plugins/actions/delete-plugin"

export function Plugins({ onSave, onDelete, disabled, disableSaveButton }: { onSave: () => void, onDelete: () => void, disabled: boolean, disableSaveButton: boolean }) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)

  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative">
      <ToolbarPlugin>
        {() => (
          <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1">
            <HistoryToolbarPlugin />
            <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable className="ContentEditable__root relative block h-72 min-h-72 overflow-auto px-8 py-4 focus:outline-none" placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ClickableLinkPlugin />
        <AutoLinkPlugin />
        <LinkPlugin />
        <FloatingLinkEditorPlugin
          anchorElem={floatingAnchorElem}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditMode={setIsLinkEditMode}
        />
        <TablePlugin />
        <HorizontalRulePlugin />
        <ImagesPlugin />
        <EmojisPlugin />
        <TwitterPlugin />
        <CheckListPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin
          transformers={[
            TABLE,
            HR,
            IMAGE,
            EMOJI,
            TWEET,
            CHECK_LIST,
            ...ELEMENT_TRANSFORMERS,
            ...MULTILINE_ELEMENT_TRANSFORMERS,
            ...TEXT_FORMAT_TRANSFORMERS,
            ...TEXT_MATCH_TRANSFORMERS,
          ]}
        />
      </div>
      <ActionsPlugin>
        <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
          <div className="flex flex-1 justify-start">
            <EditModeTogglePlugin />
          </div>
          <div>
            <CounterCharacterPlugin charset="UTF-16" />
          </div>
          <div className="flex flex-1 justify-end gap-2">
            <DeletePlugin onDelete={onDelete} disabled={disabled} />
            <SavePlugin onSave={onSave} disabled={disabled || disableSaveButton} />
          </div>
        </div>
      </ActionsPlugin>
    </div>
  )
}
