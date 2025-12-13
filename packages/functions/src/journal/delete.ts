import { Util } from "@glorpcloud/core/util";
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

const client = new DynamoDBClient();

const schema = z.object({
    date: z.string().date(),
});

export const main = Util.handler(async (input) => {
    const body = schema.parse(input.body);
    await client.send(
        new DeleteCommand({
            TableName: Resource.JournalTable.name,
            Key: {
                userId: input.userId,
                entry: body.date,
            },
        }),
    );
});
