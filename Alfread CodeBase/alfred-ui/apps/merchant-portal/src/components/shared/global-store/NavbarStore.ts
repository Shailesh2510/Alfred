/* eslint-disable no-unused-vars */
import { create } from "zustand"

interface NavbarState {
	isNavbarOpen: boolean
	toggleNavbar: () => void
	closeNavbar: () => void
	setIsNavbarOpen: (value: boolean) => void
}

export const useNavbarStore = create<NavbarState>(set => ({
	isNavbarOpen: false,
	toggleNavbar: () => set(state => ({ isNavbarOpen: !state.isNavbarOpen })),
	closeNavbar: () => set({ isNavbarOpen: false }),
	setIsNavbarOpen: (value: boolean) => set({ isNavbarOpen: value })
}))
