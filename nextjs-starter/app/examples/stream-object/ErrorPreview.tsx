import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const asBamlError = (error: Error) => {
    try {
        return JSON.parse(error.message) as { message: string, name: string };
    } catch {
        return false;
    }
}

const ErrorPreview = ({ error }: { error: Error }) => {
    const bamlError = asBamlError(error);

    if (bamlError === false) {
        return <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{error.name}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
    }

    return (
        <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Parsing Failure</AlertTitle>
        <AlertDescription>
            <pre className="whitespace-pre-wrap">{bamlError.message}
            </pre>
            </AlertDescription>
        </Alert>
    );
};

export default ErrorPreview