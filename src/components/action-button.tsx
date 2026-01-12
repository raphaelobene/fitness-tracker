'use client'

import type { ComponentProps, ReactNode } from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { LoadingSwap } from '@/components/loading-swap'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ActionButton({
	action,
	actionButtonText = 'Yes',
	actionButtonClassname,
	areYouSureDescription = (
		<>
			<span>Are you sure you want to delete?</span>
			<span className="text-destructive font-semibold">
				This action cannot be undone.
			</span>
		</>
	),
	requireAreYouSure = false,
	...props
}: ComponentProps<typeof Button> & {
	action: () => Promise<{ error: boolean; message?: string }>
	areYouSureDescription?: ReactNode
	actionButtonText?: string
	actionButtonClassname?: string
	requireAreYouSure?: boolean
}) {
	const [isLoading, startTransition] = useTransition()

	function performAction() {
		startTransition(async () => {
			const data = await action()
			if (data.error) {
				toast.error(data.message ?? 'Error')
			} else if (data.message) {
				toast.success(data.message)
			}
		})
	}

	if (requireAreYouSure) {
		return (
			<AlertDialog open={isLoading ? true : undefined}>
				<AlertDialogTrigger asChild>
					<Button {...props} />
				</AlertDialogTrigger>
				<AlertDialogContent className="sm:max-w-sm">
					<AlertDialogHeader>
						<AlertDialogTitle>{actionButtonText}</AlertDialogTitle>
						<AlertDialogDescription>
							{areYouSureDescription}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							className={cn(
								buttonVariants({ variant: 'ghost', size: 'sm' }),
								'not-disabled:hover:text-foreground bg-muted/40 border'
							)}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isLoading}
							onClick={performAction}
							className={cn(
								buttonVariants({ variant: 'secondary', size: 'sm' }),
								actionButtonClassname
							)}
						>
							<LoadingSwap isLoading={isLoading}>
								{actionButtonText}
							</LoadingSwap>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		)
	}

	return (
		<Button
			{...props}
			disabled={props.disabled ?? isLoading}
			onClick={(e) => {
				performAction()
				props.onClick?.(e)
			}}
		>
			<LoadingSwap isLoading={isLoading}>{props.children}</LoadingSwap>
		</Button>
	)
}
