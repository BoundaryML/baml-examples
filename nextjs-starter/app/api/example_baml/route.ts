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
    ); // result is of type Category[]!
    
    console.log("Classify result:", result);

    return Response.json(result);
}
