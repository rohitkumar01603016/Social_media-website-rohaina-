import jwtDecode from "jwt-decode";

const auth = {
  isAuthenticated() {
    if (typeof window === "undefined") {
      return false;
    }

    const storedUser = localStorage.getItem("userInfo1");

    if (!storedUser) {
      return false;
    }

    try {
      const user = JSON.parse(storedUser);

      if (!user?.token) {
        localStorage.removeItem("userInfo1");
        return false;
      }

      const decodedToken = jwtDecode(user.token);

      if (decodedToken?.exp && decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("userInfo1");
        return false;
      }

      return user;
    } catch (error) {
      localStorage.removeItem("userInfo1");
      return false;
    }
  },
};

export default auth;
