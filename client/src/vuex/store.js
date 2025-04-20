import { createStore } from "vuex"

export default createStore({
	state() {
		return {
			isChatOpen: false,
			messages: [],
			user: null,
			login: false,
			search: "",
			cartCounter: 0,
			selectedLang: localStorage.getItem("selectedLang") || "en", // ✅ Thêm dòng này
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
		}
	},

	mutations: {
		setChatOpen (state, newValue) {
			state.isChatOpen = newValue
		},

		appendMessage (state, newMessage) {
            state.messages.push(newMessage)
        },

        prependMessage (state, newMessage) {
            state.messages.unshift(newMessage)
        },

		setMessages (state, newValue) {
			state.messages = newValue
		},

		setUser (state, newValue) {
			state.user = newValue
		},

		setLogin (state, newValue) {
			state.login = newValue
		},

		setSearch (state, newValue) {
			state.search = newValue
		},

		setCartCounter (state, cartCounter) {
			state.cartCounter = cartCounter
		},

		setSelectedLang (state, lang) { // ✅ Thêm cái mutation này
			state.selectedLang = lang
		}
	},

	getters: {
		getIsChatOpen (state) {
			return state.isChatOpen
		},
		
		getMessages (state) {
			return state.messages
		},

		getUser (state) {
			return state.user
		},
		
		getLogin (state) {
			return state.login
		},

		getSearch (state) {
			return state.search
		},

		getMonths (state) {
			return state.months
		},

		getCartCounter (state) {
			return state.cartCounter
		},

		getSelectedLang (state) { // ✅ Optional nếu m muốn lấy selectedLang trong computed
			return state.selectedLang
		}
	}
})
