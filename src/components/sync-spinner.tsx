'use client'

import useSynchronizedAnimation from '@/hooks/use-synchronized-animation'
import { cn } from '@/lib/utils'

import { Icons } from './icons'

export default function SyncSpinner({ className }: { className?: string }) {
	const ref = useSynchronizedAnimation('spin')

	return (
		<Icons.spinner
			className={cn('animate-spin duration-75', className)}
			{...ref}
		/>
	)
}
