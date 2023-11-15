import { XCircleIcon } from '@heroicons/react/24/outline'

export function FieldError ({ messages, id }: { id: string, messages?: string[] | null }) {
  if (!(messages && messages.length)) return null

  return (<div
    id={id}
    aria-live="polite"
    className="mt-2 text-sm text-red-500"
  >
    {messages.map((error: string) => (
      <p key={error}>{error}</p>
    ))}
  </div>)
}

export function ErrorAlert ({ message, id = 'general-error' }: { id?: string, message?: string | null }) {
  if (!(message)) return null

  return (
    <div id={id}
         className="mt-6 rounded-md bg-red-50 p-4 md:p-6 flex items-center gap-2 text-sm text-red-500 border border-red-500"
         aria-live="polite">
      <XCircleIcon className="h-6 w-6"/>
      <p> {message} </p>
    </div>
  )
}
