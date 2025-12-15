import { Util } from "@glorpcloud/core/util";
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

const client = new DynamoDBClient();

const schema = z.object({
    date: z.string().date(),
    content: z.object({}).passthrough(),
});

export const main = Util.handler(async (input) => {
    const body = schema.parse(input.body);
    await client.send(
        new UpdateCommand({
            TableName: Resource.JournalTable.name,
            Key: {
                userId: input.userId,
                entry: body.date,
            },
            UpdateExpression: "set content = :content",
            ExpressionAttributeValues: {
                ":content": JSON.stringify(body.content),
            },
        }),
    );
});
