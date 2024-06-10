"use client";

import { useState } from "react";
import { extractResume } from "../../actions/streamable_objects";
import { readStreamableValue } from "ai/rsc";
import { Resume } from "@/baml_client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ClipLoader } from "react-spinners";
export const dynamic = "force-dynamic";

export default function Home() {
  const [resume, setExtractedResume] = useState<Partial<Resume>>();
  const [resumeText, setResumeText] = useState<string>(
    "Sarah Montez\nHarvard University\nMay 2015-2019\n3.92 GPA\nGoogle\nSoftware Engineer\nJune 2019-Present\n- Backend engineer\n- Rewrote search and uplifted metrics by 120%\n- Used C++ and Python\nMicrosoft\nSoftware Intern\nJune 2018-August 2018\n- Worked on the Windows team\n- Updated the UI\n- Used C++"
  );
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col h-full w-full justify-center items-center mt-14">
      <div className="font-semibold text-3xl">Streaming Objects with BAML</div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl p-6 md:p-8 lg:p-10">
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Enter your resume text here..."
            className="h-[600px] p-4 text-lg w-[400px] bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
        <Button
          disabled={isLoading}
          onClick={async () => {
            const { object } = await extractResume(resumeText);
            setIsLoading(true);
            for await (const partialObject of readStreamableValue(object)) {
              setExtractedResume(partialObject);
            }
            setIsLoading(false);
          }}
        >
          Extract Resume!
        </Button>

        <div className="w-full max-w-2xl p-6 md:p-8 lg:p-10">
          <Card className="bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200 w-[500px] h-[600px]">
            <CardHeader>
              <CardTitle className="flex flex-row items-center gap-x-4 relative">
                {resume?.name || "John Doe"}
                {isLoading && (
                  <div className="absolute top-0 bottom-0 right-0">
                    <ClipLoader color="gray" />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Skills</h3>
                <ul className="grid grid-cols-2 gap-2 mt-2">
                  {(resume?.skills ?? []).map((skill, num) => (
                    <li
                      key={num}
                      className="px-2 py-1 bg-gray-200 rounded-md dark:bg-gray-700"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium">Education</h3>
                <ul className="space-y-2 mt-2">
                  {(resume?.education ?? []).map((item, index) => (
                    <li key={index}>
                      <h4 className="font-medium">{item.degree}</h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        {item.school}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {item.year}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* <pre>{generation}</pre> */}
    </div>
  );
}
