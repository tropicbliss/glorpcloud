import { Editor } from "@/components/editor";
import { EmptyEntry } from "@/components/empty-entry";
import { Calendar } from "@/components/ui/calendar"
import { onError } from "@/lib/error";
import { API } from "aws-amplify";
import { useEffect, useState } from "react"
import { toast } from "sonner";

function getCalendarCount() {
    const width = window.innerWidth

    if (width >= 1536) {
        return 5;
    } else if (width >= 1280) {
        return 4
    } else if (width >= 1024) {
        return 3
    } else if (width >= 768) {
        return 2
    } else {
        return 1
    }
}

function isMoreThanTwoDaysAgo(date: Date) {
    const threeDaysAgo = new Date()
    threeDaysAgo.setHours(0, 0, 0, 0)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 2)
    return date < threeDaysAgo
}

export function Journal() {
    const [calendarCount, setCalendarCount] = useState(1)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [content, setContent] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    function updateCalendarCount() {
        setCalendarCount(getCalendarCount())
    }

    function getDateString() {
        const year = date!.getFullYear();
        const month = String(date!.getMonth() + 1).padStart(2, '0');
        const day = String(date!.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getDefaultMonth() {
        const today = new Date()
        today.setMonth(today.getMonth() - getCalendarCount() + 1)
        return today
    }

    useEffect(() => {
        updateCalendarCount()

        window.addEventListener("resize", () => {
            updateCalendarCount()
        })
    }, [])

    useEffect(() => {
        if (date) {
            setLoading(true)
            API.get("glorpcloud", `/journal/${getDateString()}`, {}).then((res) => setContent(res.content)).catch((e) => onError(e)).finally(() => setLoading(false))
        }
    }, [date])

    return (
        <div className="space-y-3 p-3 w-full">
            <div className="flex justify-center">
                <Calendar disabled={loading} mode="single" numberOfMonths={calendarCount} selected={date} onSelect={setDate} captionLayout="dropdown" defaultMonth={getDefaultMonth()} className="rounded-lg border shadow-sm" />
            </div>
            {date ?
                content === null ? <EmptyEntry selectedDate={date} disabled={loading} onClick={async () => {
                    setLoading(true)
                    try {
                        await API.post("glorpcloud", "/journal", {
                            body: {
                                date: getDateString()
                            }
                        })
                        setContent(JSON.stringify({
                            root: {
                                children: [
                                    {
                                        children: [
                                            {
                                                detail: 0,
                                                format: 0,
                                                mode: "normal",
                                                style: "",
                                                text: "",
                                                type: "text",
                                                version: 1,
                                            },
                                        ],
                                        direction: "ltr",
                                        format: "",
                                        indent: 0,
                                        type: "paragraph",
                                        version: 1,
                                    },
                                ],
                                direction: "ltr",
                                format: "",
                                indent: 0,
                                type: "root",
                                version: 1,
                            },
                        }))
                    } catch (e) {
                        onError(e)
                    } finally {
                        setLoading(false)
                    }
                }} /> : <Editor readOnly={isMoreThanTwoDaysAgo(date)} initialSerializedEditorState={content} key={content} onDelete={async () => {
                    setLoading(true)
                    try {
                        API.del("glorpcloud", "/journal", {
                            body: {
                                date: getDateString()
                            }
                        })
                        setContent(null)
                        toast("Deleted journal entry")
                    } catch (e) {
                        onError(e)
                    } finally {
                        setLoading(false)
                    }
                }} onSave={async (content) => {
                    setLoading(true)
                    try {
                        API.put("glorpcloud", "/journal", {
                            body: {
                                date: getDateString(),
                                content
                            }
                        })
                        toast("Updated journal entry")
                    } catch (e) {
                        onError(e)
                    } finally {
                        setLoading(false)
                    }
                }} />
                : <></>}
        </div>
    )
}