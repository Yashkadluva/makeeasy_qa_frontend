import { ADD_SIDEBAR_DATA, IS_SHOW_HUMBERG_MENU } from "../action/CommonAction"

export interface SideBarState {
    data: any
}

export interface HumbrugState {
    isShow: false
}

interface Action {
    type: string,
    payload?: any,
}

export const addSideBarReducer = (state: SideBarState = { data: '' }, action: Action) => {
    switch (action.type) {
        case ADD_SIDEBAR_DATA:
            return { data: action.payload}
        default:
            return state
    }

}

export const sideBarReducer = (state: HumbrugState = { isShow: false }, action: Action) => {
    switch (action.type) {
        case IS_SHOW_HUMBERG_MENU:
            return { isShow: !state.isShow }
        default:
            return state
    }

}