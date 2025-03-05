import AnsiColorText from "./ansii-string"

interface ErrorMessageProps {
  error: string | null
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null

  return <div className="mt-6 p-4 bg-foreground text-white rounded-md">
    {/* {JSON.stringify(error)} */}
    <pre>
      <AnsiColorText text={error} />
    </pre>
  </div>
}

