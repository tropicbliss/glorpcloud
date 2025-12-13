import { Util } from "@glorpcloud/core/util";
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

const client = new DynamoDBClient();

const schema = z.object({
    date: z.string().date(),
});

export const main = Util.handler(async (input) => {
    const body = schema.parse(input.body);
    const response = await client.send(
        new GetCommand({
            TableName: Resource.JournalTable.name,
            Key: {
                userId: input.userId,
                entry: body.date,
            },
        }),
    );
    const responseData = response.Item;
    let content: string | null = null;
    if (responseData !== undefined) {
        content = responseData.content;
    }
    return { content };
});
