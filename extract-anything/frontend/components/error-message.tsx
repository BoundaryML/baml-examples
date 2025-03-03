interface ErrorMessageProps {
  error: string | null
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null

  return <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
}

