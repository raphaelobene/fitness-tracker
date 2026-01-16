'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import queryString from 'query-string'

export function useQueryString() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const currentParams = useMemo(
		() => queryString.parse(searchParams.toString(), { parseNumbers: true }),
		[searchParams]
	)

	const setQueryParam = useCallback(
		(key: string, value: string | null) => {
			const params = queryString.parse(searchParams.toString())

			if (value === null || value === '' || value === undefined) {
				delete params[key]
			} else {
				params[key] = value
			}

			const search = queryString.stringify(params, {
				skipEmptyString: true,
				skipNull: true,
			})

			startTransition(() => {
				router.replace(`?${search}`, { scroll: false })
			})
		},
		[router, searchParams]
	)

	const setQueryParams = useCallback(
		(updates: Record<string, string | null>) => {
			const params = queryString.parse(searchParams.toString())

			Object.entries(updates).forEach(([key, value]) => {
				if (value === null || value === '' || value === undefined) {
					delete params[key]
				} else {
					params[key] = value
				}
			})

			const search = queryString.stringify(params, {
				skipEmptyString: true,
				skipNull: true,
			})

			startTransition(() => {
				router.replace(`?${search}`, { scroll: false })
			})
		},
		[router, searchParams]
	)

	const removeQueryParam = useCallback(
		(key: string) => {
			setQueryParam(key, null)
		},
		[setQueryParam]
	)

	const getQueryParam = useCallback(
		(key: string) => {
			return searchParams.get(key) || undefined
		},
		[searchParams]
	)

	return {
		setQueryParam,
		setQueryParams,
		removeQueryParam,
		getQueryParam,
		currentParams,
		isPending,
	}
}
