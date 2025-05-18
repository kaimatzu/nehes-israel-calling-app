import { Phone, PhoneOff, ArrowLeft, PhoneIncoming, PhoneOutgoing, Voicemail, XCircle } from "lucide-react"

export const statusIcon = {
  completed:      <Phone className="h-4 w-4 text-green-500 mr-1" />,
  in_progress:    <Phone className="h-4 w-4 text-blue-500 mr-1" />,
  inprogress:     <Phone className="h-4 w-4 text-blue-500 mr-1" />,     // API may send underscores or not!
  initiated:      <PhoneOutgoing className="h-4 w-4 text-yellow-500 mr-1" />,
  queued:         <PhoneOutgoing className="h-4 w-4 text-yellow-500 mr-1" />,
  ringing:        <PhoneIncoming className="h-4 w-4 text-yellow-500 mr-1" />,
  busy:           <XCircle className="h-4 w-4 text-orange-500 mr-1" />,
  no_answer:      <Voicemail className="h-4 w-4 text-orange-500 mr-1" />,
  noanswer:       <Voicemail className="h-4 w-4 text-orange-500 mr-1" />,
  canceled:       <PhoneOff className="h-4 w-4 text-gray-400 mr-1" />,
  failed:         <PhoneOff className="h-4 w-4 text-red-500 mr-1" />,
};

export function statusKey(status: string) {
  return status.replace(/-/g, "_").toLowerCase();
}

export function getStatusIcon(key: string) {
  return statusIcon[key as keyof typeof statusIcon] || <PhoneOff className="h-4 w-4 text-gray-600 mr-1" />;
}