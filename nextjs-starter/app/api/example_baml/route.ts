export const dynamic = 'force-dynamic'

import b from '../../../baml_client'
import { Role } from '../../../baml_client/types';

export async function POST(request: Request) {
    const result = await b.ClassifyMessage({
        convo: [
            {
                role: Role.Customer,
                content: "I want to cancel my subscription"
            }
        ]
    });

    return Response.json(result);
}
