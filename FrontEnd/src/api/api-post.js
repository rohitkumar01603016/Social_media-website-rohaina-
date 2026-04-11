import { requestJson } from "./client";
// const create = async (params, credentials, post) => {

//   try {
//        const requestOptions = {
//         method: 'POST',
//         headers: { 
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//        'Authorization': credentials.t
//         },
//         authorization : credentials.t,
//         body: JSON.stringify(post), 
//     };

//   let response = await fetch('/api/post/'+params.userId,requestOptions)

//     const Data = await response.json();
//      return Data;
//   } catch(err) {
//     return err
//   }
// }

// const getFeed = async (params, credentials,signal)=>{
//        try {
//        const requestOptions = {
//         method: 'Get',
//         signal: signal,
//         headers: { 
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//         },
//         authorization : credentials.t,
        
//     };

//     let response = await fetch('/api/post/feed/'+params.userId,requestOptions)

//     const Data =  response.json();
//      return Data;
//   } catch(err) {
//     return err
//   }


// }

// const getFeedUser = async (params, credentials,signal)=>{
//        try {
//        const requestOptions = {
//         method: 'Get',
//         signal: signal,
//         headers: { 
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//         },
//         authorization : credentials.t,
        
//     };

//     let response = await fetch('/api/post/feedUser/'+params.userId,requestOptions)

//     const Data = await response.json();
//      return Data;
//   } catch(err) {
//     return err
//   }


// }
// const findPeoplee = async (params, credentials,signal) => {
//   try {
//     let response = await fetch('/api/users/findpeople/' + params.userId, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t,
//          signal: signal,

//       }
//     })    
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }
// const remove = async (params, credentials) => {
//   try {
//     let response = await fetch('/api/post/' + params.postId, {
//       method: 'DELETE',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//       }
//     })
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }

// const follow =async (params, credentials, followId)=>{

//   console.log("fl")

// try {
//     let response = await fetch('/api/users/follow/', {
//       method: 'PUT',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//       },
//       body: JSON.stringify({userId:params.userId, followId: followId})
//     })
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }

// }

// const unfollow =async (params, credentials, unfollowId)=>{
//   console.log("unfl")



// try {
//     let response = await fetch('/api/users/unfollow/', {
//       method: 'PUT',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//       },
//       body: JSON.stringify({userId:params.userId, unfollowId: unfollowId})
//     })
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }

// }

// const Like =async(params ,credentials, postId  )=>{

//   try {
    
//     let response = await fetch('/api/post/like',
//     {
//       method :'PUT',
//       headers:{
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//       },
//       body :JSON.stringify({userId:params.userId, postId: postId})
//     })
//     return await response.json()

//   } catch (error) {
//         console.log(error)
//   }
// }


// const unlike =async(params ,credentials, postId  )=>{

//   try {
    
//     let response = await fetch('/api/post/unlike',
//     {
//       method :'PUT',
//       headers:{
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//       },
//       body :JSON.stringify({userId:params.userId, postId: postId})
//     })
//     return await response.json()

//   } catch (error) {
//         console.log(error)
//   }
// }

// const comment = async (params, credentials, postId, comment) => {
//   try {
//     let response = await fetch('/api/post/comment/', {
//       method: 'PUT',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//       },
//       body: JSON.stringify({userId:params.userId, postId: postId, comment: comment})
//     })
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }

// const read = async (params, credentials, signal) => {
//   try {
//     console.log("--->",params);
    
//     let response = await fetch('/api/users/' + params.userId, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t
//       }
//   })
//     return await response.json();
//     // console.log("--->",response);
//   } catch(err) {
//     console.log(err)
//   }
// }
// const checkFollow = (user,jwt) => {
//     const match = user.followers.some((follower)=> {
//       return follower._id == jwt
//     })
//     return match
//   }



// const update = async (params, credentials, Values) => {
//   let v = {name:"FFF"}
//   try {
//     let response = await fetch('/api/users/update/' + params.userId, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization':credentials.t
//       },
//       body:  JSON.stringify(Values),
//     })
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }
// const uncomment = async (params, credentials, postId, comment) => {
// console.log(params.userId , postId , comment)

//   try {
//     let response = await fetch('/api/post/uncomment/', {
//       method: 'PUT',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization':credentials.t
//       },
//       body: JSON.stringify({userId:params.userId, postId: postId, comment: comment})
//     })
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }

// const searchuser = async (params, credentials,se) => {
//   console.log(se);
//   try {
//     let response = await fetch(`/api/users/?search=${se.search}`, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t,
//       }
//     })    
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }

// const getChat = async (params, credentials,se) => {
//   try {
//     let response = await fetch(`/api/chat/`, {
//       method: 'POST',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t,
//       },
//       body: JSON.stringify({userId:params.userId,id:se})
//     })    
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }

// const getMessage = async (params, credentials,se) => {
//   console.log(se)
//   try {
//     let response = await fetch(`/api/message/${se}`, {
//       method: 'Get',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t,
//       }
//     })    
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }

// const setMessage = async (params, credentials,se) => {
//   console.log(params)
//   try {
//     let response = await fetch(`/api/message/`, {
//       method: 'Post',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t,
//       },
//       body:JSON.stringify(params)
//     })    
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }


// const fetchChats = async (params, credentials,se) => {
//   try {
//     let response = await fetch(`/api/chat/`, {
//       method: 'Get',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': credentials.t,
//       }
//     })    
//     return await response.json()
//   } catch(err) {
//     console.log(err)
//   }
// }


// export  {searchuser,fetchChats,setMessage,getChat,getMessage,create,update,remove,getFeed,findPeoplee,follow,unfollow,Like,unlike,comment,uncomment,read,checkFollow,getFeedUser}


// ================= POSTS =================

const buildHeaders = (credentials, includeContentType = true) => {
  const headers = {
    Accept: "application/json",
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (credentials?.t) {
    headers.Authorization = credentials.t;
  }

  return headers;
};

const create = async (params, credentials, post) => {
  try {
    return await requestJson("/api/post/" + params.userId, {
      method: "POST",
      headers: buildHeaders(credentials),
      body: JSON.stringify(post),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getFeed = async (params, credentials, signal) => {
  try {
    const data = await requestJson("/api/post/feed/" + params.userId, {
      method: "GET",
      signal: signal,
      headers: buildHeaders(credentials),
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getFeedUser = async (params, credentials, signal) => {
  try {
    const data = await requestJson("/api/post/feeduser/" + params.userId, {
      method: "GET",
      signal: signal,
      headers: buildHeaders(credentials),
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

// ================= USERS =================

const findPeoplee = async (params, credentials, signal) => {
  try {
    const data = await requestJson(
      "/api/users/findpeople/" + params.userId,
      {
        method: "GET",
        signal: signal,
        headers: buildHeaders(credentials),
      }
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

const read = async (params, credentials) => {
  try {
    return await requestJson("/api/users/" + params.userId, {
      method: "GET",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const update = async (params, credentials, values) => {
  try {
    return await requestJson(
      "/api/users/update/" + params.userId,
      {
        method: "PUT",
        headers: buildHeaders(credentials),
        body: JSON.stringify(values),
      }
    );
  } catch (err) {
    console.log(err);
    return null;
  }
};

const searchuser = async (params, credentials, se) => {
  if (!se?.search?.trim()) {
    return [];
  }

  try {
    const data = await requestJson(
      `/api/users/?search=${se.search}`,
      {
        method: "GET",
        headers: buildHeaders(credentials),
      }
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

// ================= FOLLOW =================

const follow = async (params, credentials, followId) => {
  try {
    return await requestJson("/api/users/follow", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({
        userId: params.userId,
        followId: followId,
      }),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const unfollow = async (params, credentials, unfollowId) => {
  try {
    return await requestJson("/api/users/unfollow", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({
        userId: params.userId,
        unfollowId: unfollowId,
      }),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

// ================= POSTS ACTION =================

const remove = async (params, credentials) => {
  try {
    return await requestJson("/api/post/" + params.postId, {
      method: "DELETE",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const Like = async (params, credentials, postId) => {
  try {
    return await requestJson("/api/post/like", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({
        userId: params.userId,
        postId: postId,
      }),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const unlike = async (params, credentials, postId) => {
  try {
    return await requestJson("/api/post/unlike", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({
        userId: params.userId,
        postId: postId,
      }),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const comment = async (params, credentials, postId, comment) => {
  try {
    return await requestJson("/api/post/comment", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({
        userId: params.userId,
        postId: postId,
        comment: comment,
      }),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const uncomment = async (params, credentials, postId, comment) => {
  try {
    return await requestJson("/api/post/uncomment", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({
        userId: params.userId,
        postId: postId,
        comment: comment,
      }),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

// ================= CHAT =================

const getChat = async (params, credentials, id) => {
  try {
    return await requestJson("/api/chat", {
      method: "POST",
      headers: buildHeaders(credentials),
      body: JSON.stringify({
        userId: params.userId,
        id: id,
      }),
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

const fetchChats = async (params, credentials) => {
  try {
    const data = await requestJson("/api/chat", {
      method: "GET",
      headers: buildHeaders(credentials),
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getMessage = async (params, credentials, chatId) => {
  try {
    const data = await requestJson("/api/message/" + chatId, {
      method: "GET",
      headers: buildHeaders(credentials),
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

const setMessage = async (params, credentials) => {
  try {
    return await requestJson("/api/message", {
      method: "POST",
      headers: buildHeaders(credentials),
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const markViewOnceMessage = async (params, credentials) => {
  try {
    return await requestJson("/api/message/view-once/" + params.messageId, {
      method: "PUT",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteMessageForEveryone = async (params, credentials) => {
  try {
    return await requestJson("/api/message/everyone/" + params.messageId, {
      method: "DELETE",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteMessageForMe = async (params, credentials) => {
  try {
    return await requestJson("/api/message/me/" + params.messageId, {
      method: "DELETE",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const createStory = async (params, credentials, story) => {
  try {
    return await requestJson("/api/story/" + params.userId, {
      method: "POST",
      headers: buildHeaders(credentials),
      body: JSON.stringify(story),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getStoryFeed = async (params, credentials) => {
  try {
    const data = await requestJson("/api/story/feed/" + params.userId, {
      method: "GET",
      headers: buildHeaders(credentials),
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getUserStories = async (params, credentials) => {
  try {
    const data = await requestJson("/api/story/user/" + params.userId, {
      method: "GET",
      headers: buildHeaders(credentials),
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

const viewStory = async (params, credentials) => {
  try {
    return await requestJson("/api/story/" + params.storyId + "/view", {
      method: "PUT",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const toggleStoryLike = async (params, credentials) => {
  try {
    return await requestJson("/api/story/" + params.storyId + "/like", {
      method: "PUT",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteStory = async (params, credentials) => {
  try {
    return await requestJson("/api/story/" + params.storyId, {
      method: "DELETE",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const changePasswordApi = async (credentials, values) => {
  try {
    return await requestJson("/api/users/password", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify(values),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteAccountApi = async (params, credentials, values) => {
  try {
    return await requestJson("/api/users/delete/" + params.userId, {
      method: "DELETE",
      headers: buildHeaders(credentials),
      body: JSON.stringify(values),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const blockUserApi = async (credentials, targetUserId) => {
  try {
    return await requestJson("/api/users/block", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({ targetUserId }),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const unblockUserApi = async (credentials, targetUserId) => {
  try {
    return await requestJson("/api/users/unblock", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({ targetUserId }),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const moderateBlockUserApi = async (credentials, payload) => {
  try {
    return await requestJson("/api/users/moderate-block", {
      method: "POST",
      headers: buildHeaders(credentials),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const archiveChatApi = async (params, credentials) => {
  try {
    return await requestJson("/api/chat/" + params.chatId + "/archive", {
      method: "PUT",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const setChatPasswordApi = async (params, credentials, password) => {
  try {
    return await requestJson("/api/chat/" + params.chatId + "/password", {
      method: "PUT",
      headers: buildHeaders(credentials),
      body: JSON.stringify({ password }),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const removeChatPasswordApi = async (params, credentials) => {
  try {
    return await requestJson("/api/chat/" + params.chatId + "/password", {
      method: "DELETE",
      headers: buildHeaders(credentials),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const unlockChatApi = async (params, credentials, password) => {
  try {
    return await requestJson("/api/chat/" + params.chatId + "/unlock", {
      method: "POST",
      headers: buildHeaders(credentials),
      body: JSON.stringify({ password }),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// ================= HELPER =================

const checkFollow = (user, id) => {
  return user.followers.some((f) => f._id === id);
};

// ================= EXPORT =================

export {
  create,
  getFeed,
  getFeedUser,
  findPeoplee,
  read,
  update,
  searchuser,
  follow,
  unfollow,
  remove,
  Like,
  unlike,
  comment,
  uncomment,
  getChat,
  fetchChats,
  getMessage,
  setMessage,
  markViewOnceMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  createStory,
  getStoryFeed,
  getUserStories,
  viewStory,
  toggleStoryLike,
  deleteStory,
  changePasswordApi,
  deleteAccountApi,
  blockUserApi,
  unblockUserApi,
  moderateBlockUserApi,
  archiveChatApi,
  setChatPasswordApi,
  removeChatPasswordApi,
  unlockChatApi,
  checkFollow,
};
