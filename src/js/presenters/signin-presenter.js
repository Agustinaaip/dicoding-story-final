import StoryAPI from "../services/api-service";
import Swal from "sweetalert2";

class SigninPresenter {
  #view = null;

  constructor(view) {
    this.#view = view;
  }

  async signin(formData) {
    try {
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const response = await StoryAPI.signin(data);

      if (response.error) {
        throw new Error(response.message);
      }

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Sign In successful",
        text: "Please log in with your account",
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect to login
      window.location.hash = "#/login";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Sign In failed",
        text: error.message,
      });
    }
  }
}

export default SigninPresenter;
