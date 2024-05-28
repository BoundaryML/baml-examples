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

    // const stream = b.stream.ExtractResume(
    //     "Sarah Montez\nHarvard University\nMay 2015-2019\n3.92 GPA\nGoogle\nSoftware Engineer\nJune 2019-Present\n- Backend engineer\n- Rewrote search and uplifted metrics by 120%\n- Used C++ and Python\nMicrosoft\nSoftware Intern\nJune 2018-August 2018\n- Worked on the Windows team\n- Updated the UI\n- Used C++"
    // );

    // for await (const event of stream) {
    //     console.log("STREAM:", event);
    // }

    // const result2 = await stream.done();
    // console.log("FINAL:", result2);

    return Response.json(result);
}
