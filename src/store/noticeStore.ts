import { create } from "zustand";

export interface Notice {
	id: number;
	text: string;
	action?: { label: string; run: () => void };
}

interface NoticeState {
	notice: Notice | null;
	notify: (text: string, action?: Notice["action"]) => void;
	dismiss: (id: number) => void;
}

let nextId = 1;

export const useNotices = create<NoticeState>()((set, get) => ({
	notice: null,
	notify: (text, action) => set({ notice: { id: nextId++, text, action } }),
	dismiss: (id) => {
		if (get().notice?.id === id) {
			set({ notice: null });
		}
	},
}));
