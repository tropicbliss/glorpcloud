import { Resource } from "sst";
import { Example } from "@glorpcloud/core/example";

console.log(`${Example.hello()} Linked to ${Resource.MyBucket.name}.`);
