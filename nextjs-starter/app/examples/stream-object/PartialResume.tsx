"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Briefcase,
  GraduationCap,
  Link,
  Star,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RecursivePartialNull } from "@/baml_client/async_client";
import { Resume } from "@/baml_client/types";
import { ErrorWrapper } from "../_components/ErrorWrapper";

const PartialResume = ({
  resume,
}: {
  resume: RecursivePartialNull<Resume>;
}) => {
  const [isWhyHireOpen, setIsWhyHireOpen] = useState(false);
  const prevResumeRef = useRef<RecursivePartialNull<Resume>>({});

  useEffect(() => {
    prevResumeRef.current = resume;
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode
  ) => (
    <AnimatePresence>
      {content && (
        <motion.div
          key={title}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeInUp}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </h3>
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <CardContent className="p-6">
      <ScrollArea className="h-80 pr-4">
        <AnimatePresence>
          {resume.why_hire && resume.why_hire.length > 0 && (
            <motion.div
              key="why-hire"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert className="bg-blue-200">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-primary mr-2" />
                    <AlertTitle className="font-bold text-primary">
                      Why we should hire this person
                    </AlertTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWhyHireOpen(!isWhyHireOpen)}
                    aria-label={
                      isWhyHireOpen ? "Close reasons" : "Open reasons"
                    }
                  >
                    {isWhyHireOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <AnimatePresence>
                  {isWhyHireOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="list-disc pl-5 mt-2 space-y-1"
                    >
                      {resume.why_hire.map((reason, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm"
                        >
                          {reason}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {renderSection(
          "Name",
          <User className="h-5 w-5 text-primary" />,
          resume.name && (
            <motion.h2
              key={resume.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-primary"
            >
              {resume.name}
            </motion.h2>
          )
        )}

        {renderSection(
          "Links",
          <Link className="h-5 w-5 text-primary" />,
          resume.links && resume.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {resume.links.map(
                  (link, index) =>
                    link?.url?.value && (
                      <motion.a
                        key={link.url.value}
                        href={link.url.value}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                      <ErrorWrapper error={ link?.url?.checks?.valid_link?.status === "failed" ? "Invalid URL" : "" }>
                        <Link className="h-4 w-4 mr-1" />
                        {link.url.value}
                      </ErrorWrapper>

                      </motion.a>
                    )
                )}
              </AnimatePresence>
            </div>
          )
        )}

        {renderSection(
          "Skills",
          <Star className="h-5 w-5 text-primary" />,
          resume.skills && resume.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {resume.skills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        )}

        {renderSection(
          "Experience",
          <Briefcase className="h-5 w-5 text-primary" />,
          resume.experience && resume.experience.length > 0 && (
            <ul className="space-y-4">
              <AnimatePresence>
                {resume.experience.map(
                  (item, index) =>
                    item && (
                      <motion.li
                        key={`${item.company}-${item.title}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="border-l-2 border-gradient-to-b from-pink-500 via-red-500 to-yellow-500 pl-4 pb-4"
                      >
                        <h4 className="font-medium text-primary">
                          {item.title} @ {item.company}
                        </h4>
                        {item.company_url && (
                          <a
                            href={item.company_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-secondary-foreground underline text-sm hover:text-primary transition-colors"
                          >
                            {item.company_url}
                          </a>
                        )}
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <AnimatePresence>
                            {(item.description ?? []).map((desc, num) => (
                              <motion.li
                                key={num}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm text-muted-foreground"
                              >
                                {desc}
                              </motion.li>
                            ))}
                          </AnimatePresence>
                        </ul>
                      </motion.li>
                    )
                )}
              </AnimatePresence>
            </ul>
          )
        )}

        {renderSection(
          "Education",
          <GraduationCap className="h-5 w-5 text-primary" />,
          resume.education && resume.education.length > 0 && (
            <ul className="space-y-2">
              <AnimatePresence>
                {resume.education.map(
                  (item, index) =>
                    item && (
                      <motion.li
                        key={`${item.school}-${item.degree}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-secondary/10 p-3 rounded-md"
                      >
                        <h4 className="font-medium text-primary">
                          {item.degree}
                        </h4>
                        <p className="text-sm text-secondary-foreground">
                          {item.school}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.year}
                        </p>
                      </motion.li>
                    )
                )}
              </AnimatePresence>
            </ul>
          )
        )}
      </ScrollArea>
    </CardContent>
  );
};

export default PartialResume;
