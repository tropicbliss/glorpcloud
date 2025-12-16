import { Util } from "@glorpcloud/core/util";
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

const client = new DynamoDBClient();

const schema = z.object({
    date: z.iso.date(),
});

export const main = Util.handler(async (input) => {
    const body = schema.parse(input.body);
    await client.send(
        new PutCommand({
            TableName: Resource.JournalTable.name,
            Item: {
                userId: input.userId,
                entry: body.date,
                content: JSON.stringify({
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
                }),
            },
        }),
    );
});
