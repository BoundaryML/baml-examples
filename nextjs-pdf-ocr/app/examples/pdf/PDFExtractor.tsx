"use client";

// import { PDFDocument } from "pdf-lib";
import Image from "next/image";
import React, {
  useState,
  useEffect,
  Dispatch,
  MouseEvent,
  useCallback,
} from "react";
import { pdfjs } from "react-pdf";
import { useStream } from "./hooks";
import {
  extractWithSchema,
  pdfGenerateBamlSchema,
} from "../../actions/extract_pdf";
import { readStreamableValue } from "ai/rsc";
import JSONView from "react18-json-view";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { isValid, set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { on } from "events";
import clsx from "clsx";
import { ClipLoader } from "react-spinners";
import { Check, Sparkle, Sparkles, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { atom, Provider, useAtom, useAtomValue } from "jotai";
import { unwrap, useAtomCallback } from "jotai/utils";
import "react18-json-view/src/style.css";
import {
  atomStore,
  diagnosticsAtom,
  filesAtom,
  projectAtom,
  runtimesAtom,
} from "@/app/_components/atoms";
import type { WasmDiagnosticError } from "@gloo-ai/baml-schema-wasm-web";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { usePathname } from "next/navigation";
import { CodeMirrorViewer } from "@/app/_components/CodeSnippet";

const wasmAtomAsync = atom(async () => {
  const wasm = await import("@gloo-ai/baml-schema-wasm-web/baml_schema_build");
  return wasm;
});
const sampleImages = [
  {
    src: "/samples/invoice.png",
    title: "Invoice",
  },
  {
    src: "/samples/cambodia-visa.jpg",
    title: "Visa Form",
  },
  {
    src: "/samples/summary-prospectus.png",
    title: "Portfolio Prospectus",
  },
];
// the url of image.
const selectedSampleImageAtom = atom<string | null>(sampleImages[0].src);
const uploadedImagesAtom = atom<string[]>([]);

export const wasmAtom = unwrap(wasmAtomAsync);

const formSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size < 10000000, {
    message: "Your file must be less than 10MB.",
  }),
});
// get around the swcminify issue using CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const AppNavbar = () => {
  return (
    <nav className="bg-gray-800">
      <div className="max-w-full mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <div className="font-semibold text-lg text-white">Boundary</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
const FileUploadForm = ({ setImages }: { setImages: Dispatch<string[]> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInvalidReason, setFileInvalidReason] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const checkValidFile = (file: File) => {
    const validTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      setFileInvalidReason("file is not a pdf, png, or jpg");
    }
  };

  const convertPdfToImages = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjs.getDocument(arrayBuffer).promise;
    const numPages = pdfDoc.numPages;
    const images: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const zoom = 2;
      const viewport = page.getViewport({
        scale: zoom * (window.devicePixelRatio || 1),
      });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      console.log("device pixel ratio", window.devicePixelRatio);
      const scales: { [key: number]: number } = { 1: 3.2, 2: 4 },
        defaultScale = 3,
        scale = scales[window.devicePixelRatio] || defaultScale;
      var displayWidth = 1.5;

      canvas.style.width = `${
        Math.ceil(viewport.width) / (window.devicePixelRatio || 1)
      }px`;
      canvas.style.height = `${
        Math.ceil(viewport.height) / (window.devicePixelRatio || 1)
      }px`;

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // @ts-ignore
      await page.render(renderContext).promise;
      images.push(canvas.toDataURL());
    }

    setImages(images);
  };

  useEffect(() => {
    setFileInvalidReason("");
    if (file) {
      checkValidFile(file);
    }
  }, [file]);

  const handleUpload = async (file?: File) => {
    // event.preventDefault();
    if (file) {
      if (file.type === "application/pdf") {
        await convertPdfToImages(file);
      } else {
        // for images
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages([reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleUpload(values.file);
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="file"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Add PDF Statements or screenshots</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    className="cursor-pointer max-w-[400px]"
                    // accept=["application/pdf"
                    onChange={(event) => {
                      onChange(event.target.files && event.target.files[0]);
                      handleFileChange(event);
                      if (event.target.files) {
                        onSubmit({ file: event.target.files[0] });
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {fileInvalidReason && <Alert>{fileInvalidReason}</Alert>}
          {/* <Button
            className="mt-2"
            disabled={!file || fileInvalidReason !== ""}
            type="submit"
          >
            Submit
          </Button> */}
        </form>
      </Form>
      {/* <div className="flex flex-col">{file?.name}</div> */}
    </div>
  );
};
const SampleImages = () => {
  const [selectedSampleImage, setSelectedSampleImage] = useAtom(
    selectedSampleImageAtom
  );
  const [uploadedImages, setUploadedImages] = useAtom(uploadedImagesAtom);

  return (
    <div className="flex flex-wrap gap-4">
      {sampleImages.map((image, index) => (
        <Card
          key={index}
          className={`h-[200px] w-[120px] border border-none justify-center items-center ${
            image.src === selectedSampleImage
              ? "outline outline-2 outline-gray-300"
              : ""
          }`}
          onClick={() => {
            setSelectedSampleImage(image.src);
          }}
        >
          <CardHeader className="py-1">
            <CardTitle className="text-xs text-center">{image.title}</CardTitle>
          </CardHeader>
          <CardContent className={clsx("p-0 justify-center items-center")}>
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger className="w-full items-center justify-center flex">
                <Image
                  src={image.src}
                  alt={image.title}
                  width={100}
                  height={200}
                  className="cursor-pointer object-contain"
                />
              </HoverCardTrigger>
              <HoverCardContent className="border-none shadow-none">
                <Image
                  src={image.src}
                  alt={image.title}
                  width={500}
                  height={600}
                  className="max-w-none"
                />
              </HoverCardContent>
            </HoverCard>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const getBase64ImageFromPath = async (imagePath: string): Promise<string> => {
  if (imagePath.startsWith("data:")) {
    // It's already a base64 string
    return imagePath;
  } else {
    // It's a path, fetch the image and convert to base64
    console.log("imagePath", imagePath);
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert image to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
};

function App() {
  const [selectedSampleImage, setSelectedSampleImage] = useAtom(
    selectedSampleImageAtom
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const images =
    uploadedImages.length > 0 ? uploadedImages : [selectedSampleImage || ""];

  const downloadImage = (src: string, index: number) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `page-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const copyBase64 = (base64: string) => {
    navigator.clipboard.writeText(base64).then(
      () => {
        alert("Base64 string copied to clipboard!");
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="flex flex-col gap-y-3 justify-start items-center w-full py-6">
        <FileUploadForm setImages={setUploadedImages} />
        <SampleImages />
      </div>
      <hr />
      <div className="gap-y-8 py-8 flex flex-row bg-slate-50">
        {images.map((src, index) => (
          <PageRenderer
            key={index}
            src={src}
            pageNumber={index + 1}
            onDownload={downloadImage}
            onCopyBase64={copyBase64}
          />
        ))}
      </div>
    </div>
  );
}

const PageRenderer = ({
  src,
  pageNumber,
  onDownload,
  onCopyBase64,
}: {
  src: string;
  pageNumber: number;
  onDownload: (src: string, index: number) => void;
  onCopyBase64: (base64: string) => void;
}) => (
  <div>
    <div className="font-semibold text-lg px-3 py-2"> Page {pageNumber}</div>
    <div className="grid grid-cols-2">
      <div className="flex-1 flex flex-col items-start justify-start px-3 overflow-x-scroll">
        <ExtractedStatement imageBase64={src} />
      </div>
      <div className="flex-1 flex flex-col items-start justify-center border-[1px] border-gray-100 rounded-md">
        <img
          src={src}
          alt={`Page ${pageNumber}`}
          className="object-contain object-top w-full h-full rounded-md"
        />
        <div className="flex flex-row gap-x-2">
          <Button
            variant={"outline"}
            onClick={() => onDownload(src, pageNumber - 1)}
          >
            Download Page {pageNumber}
          </Button>
          <Button variant={"outline"} onClick={() => onCopyBase64(src)}>
            Copy Base64
          </Button>
        </div>
      </div>
    </div>
    <hr />
  </div>
);

interface ValidatedValue {
  actual: number | undefined;
  calculated: number | undefined;
  delta: number | undefined;
  isValid: boolean;
}

const bamlBoilerPlate = `

function Extract(pdf: image) -> OutputSchema {
  client Sonnet35
  prompt #"
    {{ _.role("user") }}
    Extract the following fields from the document:

    {{ pdf }}

    {{ ctx.output_format }}
  "#
}

client<llm> GPT4o {
  provider openai
  options {
    model gpt-4o
    api_key env.OPENAI_API_KEY
  }
}

client<llm> Sonnet35 {
  provider anthropic
  options {
    model claude-3-5-sonnet-20240620
    api_key env.ANTHROPIC_API_KEY
  }
}
`;

function ExtractedStatement({ imageBase64 }: { imageBase64: string }) {
  const [bamlFile, setBamlFile] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useAtom(filesAtom);

  const streamGenerator = async () => {
    const url = window.location.origin + imageBase64;
    const base64Uri = await getBase64ImageFromPath(url);
    const { object } = await pdfGenerateBamlSchema(base64Uri);
    return readStreamableValue(object);
  };

  const { isLoading, isComplete, isError, error, mutate } = useStream(
    streamGenerator,
    {
      onData: (partialBamlFile) => {
        if (partialBamlFile) {
          const file = bamlBoilerPlate + partialBamlFile;
          setBamlFile(file);
          setProjectFiles({ "baml_src/main.baml": file ?? "" });
        }
      },
    }
  );

  const diagnostics = useAtomValue(diagnosticsAtom);

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="flex flex-col items-center gap-x-4 w-full gap-y-4">
        {isError && <>{error?.message}</>}
        <div className="flex w-full flex-col items-center justify-center gap-y-3">
          <BAMLSchema />
          <div className="text-xs flex flex-row justify-start gap-x-4 w-full items-center">
            <div className="font-semibold">BAML Schema</div>
            <div className="flex flex-row items-center justify-center gap-x-2">
              <Button
                className="w-fit text-xs pb-0 pt-0 py-0 h-8 px-3 bg-indigo-700 gap-x-2 hover:bg-indigo-500"
                onClick={mutate}
              >
                <Sparkles className="h-4 w-4 fill-white" />
                <div>Generate</div>
              </Button>
              {isLoading && <ClipLoader size={24} />}
            </div>
          </div>
          <div className="flex w-full relative h-[400px]">
            <CodeMirrorViewer lang="baml" fileContent={bamlFile || ""} />
            {!isLoading && !isComplete && (
              <div className="absolute inset-0  flex items-center justify-center">
                <div className="text-white">
                  Generate a schema from the PDF!
                </div>
              </div>
            )}
          </div>
          <div className="text-red-500 -mt-2 font-semibold text-xs w-full text-end h-[18px]">
            {diagnostics.length > 1 ? diagnostics.length + " errors" : ""}
          </div>
          <div className="flex flex-col w-full justify-center items-center">
            <JSONOutput
              imageBase64={imageBase64}
              enabled={
                diagnostics.length === 0 && bamlFile !== "" && bamlFile !== null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const testOutput = {
  invoice: {
    invoiceNumber: "INV-000001",
    balanceDue: 18400,
    company: {
      name: "Zylker Design Labs",
      address: {
        street: "14B, Northern Street Greater South Avenue",
        city: "New York",
        state: "New York",
        zipCode: "10001",
        country: "U.S.A",
      },
    },
    billTo: {
      name: "Jack Little",
      address: {
        street: "3242 Chandler Hollow Road",
        city: "Pittsburgh",
        state: "Pennsylvania",
        zipCode: "15222",
        country: "USA",
      },
    },
    shipTo: {
      name: "Jack Little",
      address: {
        street: "3242 Chandler Hollow Road",
        city: "Pittsburgh",
        state: "Pennsylvania",
        zipCode: "15222",
        country: "USA",
      },
    },
    invoiceDate: "18 May 2023",
    terms: "Due on Receipt",
    items: [
      {
        number: 1,
        description: "Brochure Design - Single sided (Color)",
        quantity: 1,
        rate: 900,
        amount: 900,
      },
      {
        number: 2,
        description:
          "Web Design packages (Simple) - 10 Pages, Slider, Free Logo, Dynamic Website, Free Domain, Hosting Free for 1st year,",
        quantity: 1,
        rate: 10000,
        amount: 10000,
      },
      {
        number: 3,
        description:
          "Print Ad - Newspaper - A full-page ad, Nationwide Circulation (Colour)",
        quantity: 1,
        rate: 7500,
        amount: 7500,
      },
    ],
    subTotal: 18400,
    taxRate: 5,
    total: 19320,
    notes: "Thanks for your business.",
    termsAndConditions:
      "All payments must be made in full before the commencement of any design work.",
  },
};

function JSONOutput({
  imageBase64,
  enabled,
}: {
  imageBase64: string;
  enabled: boolean;
}) {
  const [projectFiles, setProjectFiles] = useAtom(filesAtom);
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);

  const streamGenerator = async () => {
    const url = window.location.origin + imageBase64;
    const base64Uri = await getBase64ImageFromPath(url);
    const { object } = await extractWithSchema(
      base64Uri,
      projectFiles["baml_src/main.baml"]
    );
    return readStreamableValue(object);
  };

  const { isLoading, isComplete, isError, error, mutate } = useStream(
    streamGenerator,
    {
      onData: (partialJson) => {
        if (partialJson) {
          setJsonOutput(partialJson);
        }
      },
    }
  );

  return (
    <div className="flex flex-col w-full">
      <div className="text-xs flex flex-row justify-start gap-x-4 w-full items-center">
        <div className="font-semibold">Extracted JSON Output</div>
        <div className="flex flex-row items-center justify-center gap-x-2 pb-2">
          <Button
            className="w-fit disabled:bg-gray-500 text-xs pb-0 pt-0 py-0 h-8 px-3 bg-indigo-700 gap-x-2 hover:bg-indigo-500"
            onClick={mutate}
            disabled={!enabled}
          >
            <Sparkles className="h-4 w-4 fill-white" />
            <div>Extract data</div>
          </Button>
          {isLoading && <ClipLoader size={24} />}
        </div>
      </div>
      <div className="overflow-x-clip">{error && <>{error?.message}</>}</div>

      <div className="flex w-full  relative">
        <JSONView
          className="text-xs bg-white rounded-md overflow-y-auto h-[400px] w-full p-1 border-border border"
          src={jsonOutput ?? {}}
        />
        {!isLoading && !isComplete ? (
          <div className="absolute inset-0 flex w-full h-full justify-center items-center font-semibold text-muted-foreground">
            No data extracted yet
          </div>
        ) : null}
      </div>
    </div>
  );
}

const createRuntime = (
  wasm: typeof import("@gloo-ai/baml-schema-wasm-web"),
  envVars: Record<string, string>,
  project_files: Record<string, string>
) => {
  const project = wasm.WasmProject.new("baml_src", project_files);

  let rt = undefined;
  let diag = undefined;
  try {
    rt = project.runtime(envVars);
    diag = project.diagnostics(rt);
  } catch (e) {
    const WasmDiagnosticError = wasm.WasmDiagnosticError;
    if (e instanceof Error) {
      console.error(e.message);
    } else if (e instanceof WasmDiagnosticError) {
      diag = e;
    } else {
      console.error(e);
    }
  }

  return {
    project,
    runtime: rt,
    diagnostics: diag,
  };
};

function BAMLSchema() {
  const [projectFiles, setProjectFiles] = useAtom(filesAtom);
  const wasm = useAtomValue(wasmAtom);
  const [diagnostics, setDiagnostics] = useAtom(diagnosticsAtom);
  const createRuntimeCb = useAtomCallback(
    useCallback(
      (get, set, wasm: typeof import("@gloo-ai/baml-schema-wasm-web")) => {
        const {
          project,
          runtime,
          diagnostics: diags,
        } = createRuntime(
          wasm,
          { ANTHROPIC_API_KEY: "test", OPENAI_API_KEY: "test" },
          projectFiles
        );
        set(projectAtom, project);
        set(runtimesAtom, {
          last_successful_runtime: undefined,
          current_runtime: runtime,
          diagnostics: diags,
        });
        // console.log("runtime created" + diagnostics?.errors());
        setDiagnostics(diags?.errors() ?? []);
      },
      [wasm, projectFiles, runtimesAtom, projectAtom]
    )
  );

  useEffect(() => {
    if (wasm) {
      createRuntimeCb(wasm);
    }
  }, [wasm, JSON.stringify(projectFiles)]);

  return (
    <>
      {/* {runtime && <>diagnostics ready</>} */}
      {/* {diagnostics && <> ({diagnostics.length} errors)</>} */}
    </>
  );
}

export default App;
