"use client";

import { useState } from "react";
import { b } from "@/baml_client";
import {
  extractResume,
  extractUnstructuredResume,
} from "../../actions/streamable_objects";
import { readStreamableValue } from "ai/rsc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ClipLoader } from "react-spinners";
import { unstable_noStore as noStore } from "next/cache";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { Callout } from "@tremor/react";
import { useStream } from "@/app/_hooks/useStream";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export default function Home() {
  const [resumeText, setResumeText] = useState<string>(
    `
Vaibhav Gupta
linkedin/vaigup
vbv@boundaryml.com
@hellovai on Twitter + Github

EXPERIENCE
Boundary ML,
Founder
July 2022-Present
Seattle, WA
* We make LLMS easy to use for everyone

DE Shaw,
Software Engineer
Jan 2020-May 2022
New York, NY
* Worked on the core infra

Google,
Software Engineer
Dec 2018-2020
Seattle, WA
•
Augmented Reality,
Depth Team
•
Technical Lead for on-device optimizations
•
Optimized and designed front
facing depth algorithm
on Pixel 4
•
Focus: C++ and SIMD on custom silicon
Life Plus Plus,
Founder
July 2018-July 2019
Seattle, WA
•
Bootcamp for landing people jobs in the computer science industry
•
Designed the curriculumn and sourced students to join the program
•
Organically grew to
$
50k in profit with 3 out of 4 people landing jobs
Microsoft,
Program Manager
Sep 2017-July 2018
Redmond, WA
•
Microsoft Mixed Reality (HoloLens + VR), 6DoF Tracking
•
Worked to establish the VR Arcade space with external enterprises
•
Guided various prototypes from concept stage to enterpise APIs
Microsoft,
Software Engineer
Jul 2015-Sep 2017
Redmond, WA
•
Microsoft HoloLens, Scene Reconstruction
•
Architected, implemented, tested fault resistent storage pipeline for mesh data across 2 teams
•
Scoped, designed, and implemented mesh delivery API surface with a team of 2
•
Responsible for runtime bring up on new hardware with custom instruction set and power constraints
•
Focus: C++ and SIMD on custom silicon

EDUCATION
University of Texas at Austin
Aug 2012-May 2015
Bachelors of Engineering, Integrated Circuits
Bachelors of Computer Science`
  );

  const {
    data: completeResume,
    partialData: resume,
    isLoading: isLoadingStructured,
    isError: isErrorStructured,
    error: errorStructured,
    mutate: extractStructuredResume,
  } = useStream(extractResume);

  const {
    data: unstructuredResumeComplete,
    partialData: unstructuredResume,
    isLoading: isLoadingUnstructured,
    isError: isErrorUnstructured,
    error: errorUnstructured,
    mutate: extractUnstructuredResumeData,
  } = useStream(extractUnstructuredResume);

  const isLoading = isLoadingStructured || isLoadingUnstructured;
  const isError = isErrorStructured || isErrorUnstructured;
  console.log("isERror ", isError);

  return (
    <div className="flex flex-col h-full w-full justify-center items-center pt-14 overflow-y-auto max-w-[100vw">
      <div className="font-semibold text-3xl">Streaming Objects with BAML</div>
      <div className="flex flex-col items-center justify-center h-full">
        {isError && (
          <div className="mt-4 max-w-2xl max-h-[100px] overflow-y-auto text-red-500">
            <p className="font-bold">Error</p>
            <p>
              {(
                errorStructured?.message ||
                errorUnstructured?.message ||
                "An error occurred while processing the resume."
              ).slice(-500)}
            </p>
          </div>
        )}
        <div className="flex items-center justify-center h-full gap-8">
          <div className="w-full max-w-2xl">
            <Textarea
              value={resumeText}
              disabled={isLoading}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Enter your resume text here..."
              className="h-[600px] p-4 text-lg w-[400px] bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex-col items-center justify-center">
            <Button
              disabled={isLoading}
              onClick={async () => {
                console.log("clicked");
                extractStructuredResume(resumeText);
                extractUnstructuredResumeData(resumeText);
              }}
            >
              {isLoading && <ClipLoader color="gray" />} Extract Resume!
            </Button>
          </div>

          <div className="h-full">
            <TabGroup>
              <TabList className="mt-4">
                <Tab>Unstructured</Tab>
                <Tab>Structured</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Card className="bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200 w-[500px] h-[600px] p-4 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {unstructuredResume}
                    </pre>
                  </Card>
                </TabPanel>
                <TabPanel>
                  <Card className="bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200 w-[500px] h-[600px] overflow-y-auto p-4">
                    <CardContent>
                      <div>
                        {resume?.why_hire && resume.why_hire.length > 0 && (
                          <div className="bg-grp-2 rounded-md">
                            <Callout
                              className="mt-4"
                              title="Why we should hire this person"
                              color="teal"
                            >
                              {resume.why_hire.map((reason, index) => (
                                <p key={index}>{reason}</p>
                              ))}
                            </Callout>
                          </div>
                        )}
                        <h1 className="text-lg font-medium">
                          Name: {resume?.name || "<unknown>"}
                        </h1>
                        <div className="flex text-xs flex-col">
                          {resume?.links?.map((link, index) => (
                            <a
                              key={index}
                              href={link ?? ""}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 underline"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                        <h3 className="text-lg font-medium">Skills</h3>
                        <ul className="grid grid-cols-2 gap-2 mt-2">
                          {(resume?.skills ?? []).map((skill, num) => (
                            <li
                              key={num}
                              className="px-2 py-1 bg-gray-200 rounded-md dark:bg-gray-700 text-xs"
                            >
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Experience</h3>
                        <ul className="space-y-2 mt-2">
                          {(resume?.experience ?? []).map((item, index) => (
                            <li key={index}>
                              <h4 className="font-medium">
                                {item?.title} @ {item?.company}
                              </h4>
                              {item?.company_url && (
                                <a
                                  href={item?.company_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 underline"
                                >
                                  {item?.company_url}
                                </a>
                              )}
                              <ul className="grid grid-cols-2 gap-2 mt-2 text-muted-foreground text-xs">
                                {(item?.description ?? []).map((desc, num) => (
                                  <li key={num}>{desc}</li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Education</h3>
                        <ul className="space-y-2 mt-2">
                          {(resume?.education ?? []).map((item, index) => (
                            <li key={index}>
                              <h4 className="font-medium">{item?.degree}</h4>
                              <p className="text-gray-500 dark:text-gray-400">
                                {item?.school}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                {item?.year}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
        </div>
      </div>

      {/* <pre>{generation}</pre> */}
    </div>
  );
}
