import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { BamlValidationError, BamlClientFinishReasonError } from "@boundaryml/baml/errors";

const getErrorMessage = (error: BamlValidationError | BamlClientFinishReasonError | Error) => {
    if (error instanceof BamlValidationError) {
        return "Failed to parse the LLM response into the expected format. Please try again with different input.";
    }
    if (error instanceof BamlClientFinishReasonError) {
        return "The LLM stopped generating before producing a complete valid response. This usually happens when the model encounters an unexpected pattern or constraint.";
    }

    return error.message;
}

const ErrorPreview = ({ error }: { error: Error | BamlValidationError | BamlClientFinishReasonError }) => {
    const getDetails = () => {
        if (error instanceof BamlValidationError) {
            return (
                <div className="space-y-4">
                     <section>
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">BAML Validation Error</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <pre className="text-sm text-red-900 dark:text-red-300 whitespace-pre-wrap break-words font-mono">{error.message}</pre>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Raw LLM Output</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <pre className="text-sm text-red-900 dark:text-red-300 whitespace-pre-wrap break-words">{error.raw_output}</pre>
                        </div>
                    </section>
                    <section>
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Original Prompt</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <pre className="text-sm text-red-900 dark:text-red-300 whitespace-pre-wrap break-words">{error.prompt}</pre>
                        </div>
                    </section>

                </div>
            );
        }
        if (error instanceof BamlClientFinishReasonError) {
            return (
                <div className="space-y-4">
                     <section>
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">BAML Finish Reason Error</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <pre className="text-sm text-red-900 dark:text-red-300 whitespace-pre-wrap break-words font-mono">{error.message}</pre>
                        </div>
                    </section>
                    <section>
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Raw LLM Output</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <pre className="text-sm text-red-900 dark:text-red-300 whitespace-pre-wrap break-words">{error.raw_output}</pre>
                        </div>
                    </section>
                    <section>
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Original Prompt</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <pre className="text-sm text-red-900 dark:text-red-300 whitespace-pre-wrap break-words">{error.prompt}</pre>
                        </div>
                    </section>


                </div>
            );
        }
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <pre className="text-sm text-red-900 dark:text-red-300 whitespace-pre-wrap break-words">{error.message}</pre>
            </div>
        );
    };

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-base font-semibold">{error.name || "Error"}</AlertTitle>
            <AlertDescription>
                <p className="mb-4 text-sm font-medium">{getErrorMessage(error)}</p>
                {getDetails()}
            </AlertDescription>
        </Alert>
    );
};

export default ErrorPreview