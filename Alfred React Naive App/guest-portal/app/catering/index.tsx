import { useEffect } from 'react'

const Catering = () => {
	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === 'development'
				? 'https://catering-dev.getalfred.com/catering'
				: 'https://catering.getalfred.com/catering'

		globalThis.location.replace(baseUrl)
	}, [])

	return null
}

export default Catering
