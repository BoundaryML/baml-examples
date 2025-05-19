'use client';
import type { Position } from '@/baml_client/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { readStreamableValue } from 'ai/rsc';
import React, { useState, useEffect, type Dispatch } from 'react';
import { useForm } from 'react-hook-form';
import { pdfjs } from 'react-pdf';
import { z } from 'zod';
import { extractStatement } from './actions/extract-pdf';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';
import { ClipLoader } from 'react-spinners';

const formSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size < 10000000, {
    message: 'Your file must be less than 10MB.',
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
  const [fileInvalidReason, setFileInvalidReason] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const checkValidFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      setFileInvalidReason('file is not a pdf, png, or jpg');
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
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      console.log('device pixel ratio', window.devicePixelRatio);
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
    setFileInvalidReason('');
    if (file) {
      checkValidFile(file);
    }
  }, [file]);

  const handleUpload = async (file?: File) => {
    // event.preventDefault();
    if (file) {
      if (file.type === 'application/pdf') {
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
// interface Position {
//   ticker: string;
//   quantity: number;
//   openLots: OpenLot[];
// }

// interface OpenLot {
//   costBasis: number;
//   quantity: number;
//   purchaseDate: number;
// }

function App() {
  const [images, setImages] = useState<string[]>([]);

  const downloadImage = (src: string, index: number) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `page-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const copyBase64 = (base64: string) => {
    navigator.clipboard.writeText(base64).then(
      () => {
        alert('Base64 string copied to clipboard!');
      },
      (err) => {
        console.error('Failed to copy: ', err);
      },
    );
  };
  // console.log("images", images);
  return (
    <div className="App">
      <AppNavbar />
      <div className="flex flex-col justify-center items-center w-full py-6">
        <FileUploadForm setImages={setImages} />
      </div>
      <hr />
      <div className="gap-y-8 py-8">
        {images.map((src, index) => (
          <div key={index}>
            <div className="font-semibold text-lg px-3 py-2">
              {' '}
              Page {index + 1}
            </div>
            <div className="grid grid-cols-2">
              <div className="flex-1 flex flex-col items-start justify-start px-3 overflow-x-scroll">
                <ExtractedStatement imageBase64={src} />
              </div>
              <div className="flex-1 flex flex-col items-start justify-center border-[1px] border-gray-100 rounded-md">
                <img
                  src={src}
                  alt={`Page ${index + 1}`}
                  className="object-contain object-top w-full h-full"
                />
                <div className="flex flex-row gap-x-2">
                  <Button
                    variant={'outline'}
                    onClick={() => downloadImage(src, index)}
                  >
                    Download Page {index + 1}
                  </Button>
                  <Button variant={'outline'} onClick={() => copyBase64(src)}>
                    Copy Base64
                  </Button>
                </div>
              </div>
            </div>

            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ValidatedValue {
  actual: number | undefined;
  calculated: number | undefined;
  delta: number | undefined;
  isValid: boolean;
}

interface PositionWithMetadata extends Position {
  validatedCostBasis: ValidatedValue;
  validatedMarketValue: ValidatedValue;
  wasFixed: boolean;
}

const calculateValidatedValue = (
  actual: number | undefined | null,
  calculated: number | undefined | null,
): ValidatedValue => {
  const epsilon = 1e-3; // Small tolerance for floating point comparison
  let delta =
    actual != null &&
    calculated != null &&
    actual != undefined &&
    calculated != undefined
      ? Math.abs(actual - calculated)
      : undefined;
  const isValid = delta !== undefined ? delta < epsilon : false;

  if (isValid && delta !== undefined) {
    delta = 0; // Set delta to 0 if within epsilon
  }
  console.log(
    'actual',
    actual,
    'calculated',
    calculated,
    'delta',
    delta,
    'isValid',
    isValid,
  );

  return {
    actual: actual ?? undefined,
    calculated: calculated ?? undefined,
    delta,
    isValid,
  };
};

const calculateMetadata = (positions: Position[]): PositionWithMetadata[] => {
  return positions.map((row) => {
    const calculatedCostBasis =
      row.quantity && row.unit_cost ? row.quantity * row.unit_cost : undefined;
    const calculatedMarketValue =
      row.quantity && row.current_price
        ? row.quantity * row.current_price
        : undefined;

    return {
      ...row,
      validatedCostBasis: calculateValidatedValue(
        row.cost_basis,
        calculatedCostBasis,
      ),
      validatedMarketValue: calculateValidatedValue(
        row.market_value,
        calculatedMarketValue,
      ),
      wasFixed: false,
    };
  });
};

function ExtractedStatement({ imageBase64 }: { imageBase64: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState<PositionWithMetadata[]>([]);
  const [positionsFixed, setPositionsFixed] = useState<PositionWithMetadata[]>(
    [],
  );
  const [showChecks, setShowChecks] = useState(false);

  const handleGenerateStatement = async () => {
    setIsLoading(true);
    try {
      const { object } = await extractStatement(imageBase64);
      let finalPositions: PositionWithMetadata[] = [];

      for await (const partialStatement of readStreamableValue(object)) {
        const presentPositions = (partialStatement ?? []).filter(
          (pos): pos is Position => pos !== undefined,
        );
        finalPositions = calculateMetadata(presentPositions);
        setPositions(finalPositions);
      }

      if (!finalPositions) {
        return;
      }
    } catch (error) {
      console.error('Error generating statement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-2 ">
      <div className="flex flex-row items-center gap-x-4">
        <div className="flex flex-row items-center justify-center gap-x-2">
          <Button className="w-fit" onClick={handleGenerateStatement}>
            Extract Positions
          </Button>
          {isLoading && <ClipLoader size={24} />}
        </div>
        <div className="flex flex-row">
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" onCheckedChange={setShowChecks} />
            <Label htmlFor="airplane-mode">Toggle Checks</Label>
          </div>
        </div>
      </div>

      {positions && (
        <Table className="transition transition-all">
          <TableCaption>A list of your recent statements.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={7}>Positions</TableHead>
            </TableRow>
            <TableRow>
              <TableHead>Asset Type</TableHead>
              <TableHead className="max-w-[120px] whitespace-pre-wrap">
                Asset Name
              </TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Current price</TableHead>
              <TableHead>Date Acquired</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead className="p-1">Cost Basis</TableHead>
              <TableHead>Mkt Val </TableHead>
              {showChecks && (
                <>
                  <TableHead>Calc Mkt Val (Delta)</TableHead>
                  <TableHead>Notes</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(
              positions.reduce(
                (acc, row) => {
                  const assetType = row.asset_type || 'Unknown';
                  if (!acc[assetType]) acc[assetType] = [];
                  acc[assetType].push(row);
                  return acc;
                },
                {} as Record<string, PositionWithMetadata[]>,
              ),
            ).map(([assetType, rows], index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell colSpan={7} className="font-bold">
                    {assetType}
                  </TableCell>
                </TableRow>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="p-2">{rowIndex + 1}</TableCell>
                    <TableCell className="max-w-[120px] whitespace-pre-wrap">
                      {row.asset_name}
                    </TableCell>
                    <TableCell className="p-2">{row.symbol}</TableCell>
                    <TableCell className="p-2">
                      {row.quantity?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell className="p-2">
                      {row.current_price
                        ? `$${row.current_price.toLocaleString()}`
                        : ''}
                    </TableCell>
                    <TableCell className="p-2">{row.date_acquired}</TableCell>
                    <TableCell className="p-2">
                      {row.unit_cost
                        ? `$${row.unit_cost.toLocaleString()}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell
                      className={`p-2 ${
                        !row.validatedCostBasis.actual ? '' : ''
                      }`}
                    >
                      {row.validatedCostBasis.actual
                        ? `$${row.validatedCostBasis.actual.toLocaleString()}`
                        : ''}
                    </TableCell>
                    <TableCell>
                      {row.validatedMarketValue.actual
                        ? `$${row.validatedMarketValue.actual.toLocaleString()}`
                        : ''}
                    </TableCell>

                    {showChecks && (
                      <>
                        <TableCell className={`p-2 bg-blue-100`}>
                          {row.validatedMarketValue.delta !== undefined
                            ? `$${row.validatedMarketValue.delta.toLocaleString()}`
                            : 'N/A'}
                          {row.validatedMarketValue.delta !== undefined &&
                            (row.validatedMarketValue.isValid ? (
                              <Check className="text-green-500 inline ml-2" />
                            ) : (
                              <X className="text-red-500 inline ml-2" />
                            ))}
                        </TableCell>
                        <TableCell className="p-2 max-w-[200px]">
                          {row.data_quality_notes ?? ''}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
export default App;
