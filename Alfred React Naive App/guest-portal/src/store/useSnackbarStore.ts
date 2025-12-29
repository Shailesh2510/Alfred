/* eslint-disable no-unused-vars */
import { create } from 'zustand'
import { SnackbarType } from '../types/others'

interface SnackbarState {
	snackbarMessage: string
	snackbarVisible: boolean
	snackbarType: SnackbarType
	snackBarTitle: string
}

interface SnackbarActions {
	setSnackbarMessage: (
		visible: boolean,
		type: SnackbarType,
		title: string,
		message: string
	) => void
	setSnackbarVisible: (visible: boolean) => void
}

const initialState: SnackbarState = {
	snackbarMessage: '',
	snackbarVisible: false,
	snackbarType: SnackbarType.SUCCESS,
	snackBarTitle: ''
}

export const useSnackbarStore = create<SnackbarState & SnackbarActions>(
	set => ({
		...initialState,
		setSnackbarMessage: (visible, type, title, message) =>
			set({
				snackbarVisible: visible,
				snackbarType: type,
				snackBarTitle: title,
				snackbarMessage: message
			}),
		setSnackbarVisible: visible => set({ snackbarVisible: visible })
	})
)
