import type { HookStatus } from "@/baml_client/react/hooks";
import { CheckCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import type { ComponentType } from "react";

export const Status: React.FC<{ status: HookStatus, withText?: boolean }> = ({
	status,
	withText = false,
}) => {
	const statusConfig = {
		pending: { icon: Loader2, className: "animate-spin text-blue-500", text: "Loading" },
		error: { icon: AlertCircle, className: "text-red-500", text: "Error" },
		success: { icon: CheckCircle, className: "text-green-500", text: "Success" },
		idle: { icon: null, className: "", text: "Idle" },
		streaming: { icon: Loader2, className: "animate-spin text-blue-500", text: "Streaming" },
	} satisfies Record<HookStatus, { icon: ComponentType | null, className: string, text: string }>;

	const { icon: Icon, className } = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;

	return Icon ? <Icon className={`h-5 w-5 ${className}`} /> : null;
};