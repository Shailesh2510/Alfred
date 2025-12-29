/* eslint-disable no-magic-numbers */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Order = 'asc' | 'desc'

type Iteratee<T> = keyof T | ((item: T) => any)

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function orderBy<T>(
	collection: T[],
	iteratees: Iteratee<T>[] = [],
	orders: Order[] = []
): T[] {
	return [...collection].sort((a, b) => {
		for (const [index, iteratee] of iteratees.entries()) {
			const order = orders[index] || 'asc'

			const valueA = typeof iteratee === 'function' ? iteratee(a) : a[iteratee]
			const valueB = typeof iteratee === 'function' ? iteratee(b) : b[iteratee]

			if (valueA < valueB) return order === 'asc' ? -1 : 1
			if (valueA > valueB) return order === 'asc' ? 1 : -1
		}
		return 0
	})
}

export function startCase(string_: string): string {
	const normalizedString = string_.replaceAll(/[^a-zA-Z0-9]+/g, ' ')

	return normalizedString
		.trim()
		.split(/\s+/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}
