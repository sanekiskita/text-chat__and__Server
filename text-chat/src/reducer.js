const reducer = (state,action)=>{
    switch(action.type){
        case('IS_AUTH'):return {...state,isAuth:action.payload,userName:action.userName};
        case('SET_USERS'):return {...state,usersInRomm:action.usersInRomm,message:action.message,roomSetting:action.roomSetting};
        case('SET_MESSAGES'):return {...state,message:action.message};
        case('ADD_MESSAGES'):return {...state,message:[...state.message,action.message]};
        case('SET_MY_ROOMS'):return {...state,myRooms:action.myRooms};
        case('SET_ROOMS_ID'):return {...state,roomId:action.roomId};
        default:return state;
    }
}

export default reducer;