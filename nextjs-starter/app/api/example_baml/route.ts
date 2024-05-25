export const dynamic = 'force-dynamic'

import { b, traceAsync } from "../../../baml_client"
import { Role } from '../../../baml_client/types';

export async function POST(request: Request) {
    const result = await b.ClassifyMessage(
        [
            {
                role: Role.Customer,
                content: "I want to cancel my subscription"
            }
        ]
    );

    // const stream = b.stream.ClassifyMessage([
    //     {
    //         role: Role.Customer,
    //         content: "I want to cancel my subscription"
    //     }
    // ]);

    // for await (const event of stream) {
    //     console.log("STREAM:", event);
    // }

    // const result2 = await stream.done();
    // console.log("FINAL:", result2);

    return Response.json(result);
}
